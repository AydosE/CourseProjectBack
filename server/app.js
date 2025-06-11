const express = require("express");
const sequelize = require("./config/db");
const User = require("./models/User");
require("dotenv").config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const app = express();
app.use(express.json());

sequelize
  .sync()
  .then(() => console.log("✅ Таблицы созданы и база готова!"))
  .catch((err) => console.error("❌ Ошибка синхронизации:", err));

app.listen(5000, () => console.log("🚀 Сервер запущен на порту 5000"));
