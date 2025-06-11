const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
    is_blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    preferred_lang: { type: DataTypes.STRING, defaultValue: "en" },
    theme: { type: DataTypes.ENUM("light", "dark"), defaultValue: "light" },
  },
  { timestamps: true }
);

module.exports = User;
