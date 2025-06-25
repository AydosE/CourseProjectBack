const { Op } = require("sequelize");

module.exports = (Model, idParam = "id") => {
  return async (req, res, next) => {
    const isAdmin = req.user?.role === "admin";
    if (isAdmin) return next();

    const id = req.params[idParam];
    const record = await Model.findByPk(id);

    if (!record) return res.status(404).json({ message: "Ресурс не найден" });

    if (record.userId !== req.user.id) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    next();
  };
};
