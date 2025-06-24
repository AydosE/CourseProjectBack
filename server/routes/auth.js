const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = "your_secret_key"; // позже можно вынести в .env

// Регистрация
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Пользователь уже существует" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Ошибка регистрации" });
  }
});

// Вход
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Неверный email" });
    if (user.is_blocked)
      return res.status(403).json({ message: "Пользователь заблокирован" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Неверный пароль" });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      username: user.username,
      theme: user.theme,
      preferred_lang: user.preferred_lang,
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка входа" });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  const { id, username, email, role, preferred_lang, theme } = req.user;
  res.json({ id, username, email, role, preferred_lang, theme });
});

module.exports = router;
