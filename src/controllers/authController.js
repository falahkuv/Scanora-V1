const bcrypt = require("bcryptjs");
const { prisma } = require("../config/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { signToken } = require("../services/tokenService");
const { toUserResponse } = require("../services/formatService");
const { sendSuccess } = require("../services/responseService");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email already in use",
      data: null
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  });

  const token = signToken({ userId: user.id, email: user.email });

  return sendSuccess(
    res,
    "User registered successfully",
    {
      token,
      user: toUserResponse(user)
    },
    201
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
      data: null
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
      data: null
    });
  }

  const token = signToken({ userId: user.id, email: user.email });

  return sendSuccess(res, "Login successful", {
    token,
    user: toUserResponse(user)
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      data: null
    });
  }

  return sendSuccess(res, "User profile", toUserResponse(user));
});

module.exports = {
  register,
  login,
  me
};
