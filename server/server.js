const express = require("express");
const sequelize = require("./config/db");
const cors = require("cors");
const User = require("./models/User");
const templatesRouter = require("./routes/templates");
const formsRouter = require("./routes/forms");
const answersRouter = require("./routes/answer");
const authRouter = require("./routes/auth");

require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // фронтенд
    credentials: true, // если используешь cookie
  })
);

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.send("👋 Привет! Сервер работает!");
});
app.use("/api/templates", templatesRouter);
app.use("/api/forms", formsRouter);
app.use("/api/answers", answersRouter);
app.use("/api/auth", authRouter);
app.use("/api/forms", formsRouter);
sequelize
  .sync({ alter: true })
  // .sync()
  .then(() => console.log("✅ Таблицы созданы и база готова!"))
  .catch((err) => console.error("❌ Ошибка синхронизации:", err));

app.listen(5000, () => console.log("🚀 Сервер запущен на порту 5000"));
