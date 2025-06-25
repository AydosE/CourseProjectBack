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
    templateId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
  }
);

Form.belongsTo(User, { foreignKey: "userId" });
Form.belongsTo(Template, { foreignKey: "templateId" });

// 💥 Ассоциации с Answer
Form.hasMany(Answer, { foreignKey: "formId", onDelete: "CASCADE" });
Answer.belongsTo(Form, { foreignKey: "formId" });

module.exports = Form;
