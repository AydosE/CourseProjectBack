const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Answer = require("./Answer");
const User = require("./User");
const Template = require("./Template");

const Form = sequelize.define(
  "Form",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    templateId: { type: DataTypes.UUID, allowNull: true },
    userId: { type: DataTypes.UUID, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
  }
);

module.exports = Form;
