const express = require("express");
const sequelize = require("./config/db");
const cors = require("cors");
const User = require("./models/User");
const templatesRouter = require("./routes/template");
require("dotenv").config();

const app = express();
// app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.send("👋 Привет! Сервер работает!");
});
app.use("/api/templates", templatesRouter);

sequelize
  .sync()
  .then(() => console.log("✅ Таблицы созданы и база готова!"))
  .catch((err) => console.error("❌ Ошибка синхронизации:", err));

app.listen(5000, () => console.log("🚀 Сервер запущен на порту 5000"));
