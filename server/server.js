const express = require("express");
const sequelize = require("./config/db");
const db = require("./models/index");
const cors = require("cors");
const User = require("./models/User");
const templatesRouter = require("./routes/templates");
const formsRouter = require("./routes/forms");
const answersRouter = require("./routes/answer");
const authRouter = require("./routes/auth");
const tagRoutes = require("./routes/tags");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const ticketsRouter = require("./routes/tickets");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [
      "https://course-project-front-inky.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
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
app.use("/api/tags", tagRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tickets", ticketsRouter);
sequelize
  // .sync({ force: true })
  .sync()
  .then(() => console.log("✅ Таблицы созданы и база готова!"))
  .catch((err) => console.error("❌ Ошибка синхронизации:", err));

app.listen(5000, () => console.log("🚀 Сервер запущен на порту 5000"));
