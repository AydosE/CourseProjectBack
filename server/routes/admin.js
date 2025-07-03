const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

function isAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Только для администраторов" });
  }
  next();
}

router.get("/users", auth.required, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "role", "is_blocked"],
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    console.error("Ошибка получения пользователей:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/:id/block", auth.required, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });
    user.is_blocked = !user.is_blocked;
    await user.save();
    res.json({ message: user.is_blocked ? "Заблокирован" : "Разблокирован" });
  } catch (err) {
    console.error("Ошибка блокировки:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/:id/toggle-admin", auth.required, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });
    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();
    res.json({ message: `Теперь ${user.role}` });
  } catch (err) {
    console.error("Ошибка назначения роли:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/:id", auth.required, isAdmin, async (req, res) => {
  try {
    const count = await User.destroy({ where: { id: req.params.id } });
    if (!count)
      return res.status(404).json({ message: "Пользователь не найден" });
    res.json({ message: "Пользователь удалён" });
  } catch (err) {
    console.error("Ошибка удаления:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
