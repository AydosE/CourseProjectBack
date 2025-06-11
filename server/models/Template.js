const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Template = sequelize.define("Template", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
});

module.exports = Template;
