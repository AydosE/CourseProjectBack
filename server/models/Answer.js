const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Form = require("./Form");
const Question = require("./Question");

const Answer = sequelize.define(
  "Answer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    formId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

// 🔗 Ассоциации (если нужно)
// Answer.belongsTo(Form, { foreignKey: "formId" });
// Answer.belongsTo(Question, { foreignKey: "questionId" });

module.exports = Answer;
