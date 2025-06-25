const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // лучше из .env

const auth = {};

auth.optional = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const token = authHeader.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // можно: req.user = await User.findByPk(decoded.userId)
  } catch (err) {
    // молча продолжаем без пользователя
  }
  next();
};

auth.required = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Нет токена" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user)
      return res.status(401).json({ message: "Пользователь не найден" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Невалидный токен" });
  }
};

module.exports = auth;
