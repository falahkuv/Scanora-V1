const errorHandler = (err, req, res, next) => {
  console.error("API error:", err);
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // UX Best Practice: Mask raw database/Prisma errors
  if (err.name === "PrismaClientValidationError" || err.name === "PrismaClientKnownRequestError") {
    statusCode = 400;
    message = "Terjadi kesalahan pada data yang dikirim atau sistem database.";
  } else if (statusCode === 500) {
    message = "Terjadi kesalahan internal pada server kami. Silakan coba lagi nanti.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};

module.exports = errorHandler;
