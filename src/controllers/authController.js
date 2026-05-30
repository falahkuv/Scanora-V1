const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { prisma } = require("../config/prisma");
const { supabase } = require("../config/supabase");
const asyncHandler = require("../middleware/asyncHandler");
const { signToken } = require("../services/tokenService");
const { toUserResponse } = require("../services/formatService");
const { sendSuccess } = require("../services/responseService");

const PROFILE_IMAGES = [
  "/images/pp1.png",
  "/images/pp2.png",
  "/images/pp3.png"
];

const pickRandomProfileImage = () => {
  const idx = Math.floor(Math.random() * PROFILE_IMAGES.length);
  return PROFILE_IMAGES[idx];
};

const ensureProfileImage = async (user) => {
  if (user.profileImage) return user;
  return prisma.user.update({
    where: { id: user.id },
    data: { profileImage: pickRandomProfileImage() }
  });
};

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

  let user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      profileImage: pickRandomProfileImage()
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

  let user = await prisma.user.findUnique({
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

  user = await ensureProfileImage(user);
  const token = signToken({ userId: user.id, email: user.email });

  return sendSuccess(res, "Login successful", {
    token,
    user: toUserResponse(user)
  });
});

const me = asyncHandler(async (req, res) => {
  let user = await prisma.user.findUnique({
    where: { id: req.user.userId }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      data: null
    });
  }

  user = await ensureProfileImage(user);
  return sendSuccess(res, "User profile", toUserResponse(user));
});

const googleLogin = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({
      success: false,
      message: "Access token is required",
      data: null
    });
  }

  if (!supabase) {
    return res.status(500).json({
      success: false,
      message: "Supabase is not configured",
      data: null
    });
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data?.user) {
    return res.status(401).json({
      success: false,
      message: "Invalid Google session",
      data: null
    });
  }

  const email = data.user.email;
  const name =
    data.user.user_metadata?.full_name ||
    data.user.user_metadata?.name ||
    data.user.user_metadata?.preferred_username ||
    (email ? email.split("@")[0] : "Scanora User");

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileImage: pickRandomProfileImage()
      }
    });
  }

  user = await ensureProfileImage(user);

  const token = signToken({ userId: user.id, email: user.email });

  return sendSuccess(res, "Login successful", {
    token,
    user: toUserResponse(user)
  });
});

module.exports = {
  register,
  login,
  me,
  googleLogin
};
