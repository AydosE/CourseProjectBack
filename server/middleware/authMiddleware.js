const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = "your_secret_key"; // вынести в .env желательно

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Нет токена" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user)
      return res.status(401).json({ message: "Пользователь не найден" });

    req.user = user; // прикрепляем пользователя к запросу
    next();
  } catch (err) {
    res.status(401).json({ message: "Невалидный токен" });
  }
};

module.exports = authMiddleware;
