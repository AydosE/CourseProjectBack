const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Template = require("./Template");

const Question = sequelize.define(
  "Question",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM("text", "textarea", "number", "checkbox"),
      allowNull: false,
    },
    options: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

Question.belongsTo(Template, { foreignKey: "templateId" });
Template.hasMany(Question, { foreignKey: "templateId", onDelete: "CASCADE" });

module.exports = Question;
