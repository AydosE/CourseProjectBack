const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Answer = sequelize.define(
  "Answer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    formId: { type: DataTypes.UUID, allowNull: false },
    question: { type: DataTypes.STRING, allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    freezeTableName: true,
  }
);
module.exports = Answer;
