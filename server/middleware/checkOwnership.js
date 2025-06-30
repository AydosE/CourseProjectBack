module.exports = (Model, idParam = "id") => {
  return async (req, res, next) => {
    try {
      const isAdmin = req.user?.role === "admin";
      if (isAdmin) return next();

      const id = req.params[idParam];
      if (!id) {
        return res.status(400).json({ message: "Некорректный идентификатор" });
      }

      const record = await Model.findByPk(id, {
        attributes: ["id", "userId"],
      });

      if (!record) {
        return res.status(404).json({ message: "Ресурс не найден" });
      }

      if (!("userId" in record) || record.userId !== req.user.id) {
        return res.status(403).json({ message: "Нет доступа" });
      }
      console.log("ownership OK");
      return next();
    } catch (err) {
      console.error("❌ Ошибка в checkOwnership:", err);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  };
};
