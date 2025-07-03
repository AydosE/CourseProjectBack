const { validate: isUuid } = require("uuid");

module.exports = (Model, idParam = "id") => {
  return async (req, res, next) => {
    try {
      const isAdmin = req.user?.role === "admin";
      const id = req.params[idParam];

      if (!id || (id !== "me" && !isUuid(id))) {
        return res.status(400).json({ message: "Некорректный идентификатор" });
      }

      if (isAdmin) return next();

      if (id === "me") {
        req.ownership = "self";
        return next();
      }

      const record = await Model.findByPk(id, {
        attributes: ["id", "userId"],
      });

      if (!record) {
        return res.status(404).json({ message: "Ресурс не найден" });
      }

      if (!("userId" in record) || record.userId !== req.user.id) {
        return res.status(403).json({ message: "Нет доступа к ресурсу" });
      }

      req.ownership = "own";
      return next();
    } catch (err) {
      console.error("Ошибка в checkOwnership:", err);
      return res
        .status(500)
        .json({ message: "Ошибка сервера при проверке доступа" });
    }
  };
};
