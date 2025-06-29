const { Form } = require("../models");

async function canViewForm(req, res, next) {
  const form = await Form.findByPk(req.params.id);
  if (!form) return res.status(404).json({ message: "Форма не найдена" });

  const isOwner = form.userId === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Нет доступа к этой форме" });
  }

  req.form = form;
  next();
}
module.exports = canViewForm;
