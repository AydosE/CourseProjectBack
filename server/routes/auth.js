const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const generateToken = (user) =>
  jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email уже зарегистрирован" });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hash,
    });

    const token = generateToken(newUser);
    res.status(201).json({
      token,
      username: newUser.username,
      theme: newUser.theme,
      preferred_lang: newUser.preferred_lang,
    });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ message: "Ошибка сервера при регистрации" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email и пароль обязательны" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Неверный email" });

    if (user.is_blocked)
      return res.status(403).json({ message: "Пользователь заблокирован" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Неверный пароль" });

    const token = generateToken(user);
    res.json({
      token,
      username: user.username,
      theme: user.theme,
      preferred_lang: user.preferred_lang,
    });
  } catch (err) {
    console.error("Ошибка входа:", err);
    res.status(500).json({ message: "Ошибка сервера при входе" });
  }
});

router.get("/me", auth.required, (req, res) => {
  const { id, username, email, role, preferred_lang, theme } = req.user;
  res.json({ id, username, email, role, preferred_lang, theme });
});

module.exports = router;
