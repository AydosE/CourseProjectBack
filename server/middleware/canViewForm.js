// middleware/canViewForm.js
const { validate: isUuid } = require("uuid");
const Form = require("../models/Form");

module.exports = async (req, res, next) => {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res
      .status(400)
      .json({ message: "Некорректный идентификатор формы" });
  }

  try {
    const form = await Form.findByPk(id);
    if (!form) return res.status(404).json({ message: "Форма не найдена" });

    const isAdmin = req.user.role === "admin";
    const isOwner = form.userId === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Нет доступа к форме" });
    }

    next();
  } catch (err) {
    console.error("Ошибка в canViewForm:", err);
    res
      .status(500)
      .json({ message: "Ошибка проверки доступа", error: err.message });
  }
};
