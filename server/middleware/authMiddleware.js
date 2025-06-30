const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const auth = {};

// 🔓 Необязательная авторизация (req.user может быть null)
auth.optional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      preferred_lang: user.preferred_lang,
      theme: user.theme,
    };

    next();
  } catch (err) {
    req.user = null;
    return next(); // молча продолжаем как гость
  }
};

// 🔐 Обязательная авторизация
auth.required = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Нет токена" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Неверный формат токена" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      preferred_lang: user.preferred_lang,
      theme: user.theme,
    };

    next();
  } catch (err) {
    console.error("Ошибка в auth.required:", err);
    res.status(401).json({ message: "Невалидный или просроченный токен" });
  }
};

module.exports = auth;
