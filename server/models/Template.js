const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Template = sequelize.define(
  "Template",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    category: { type: DataTypes.STRING },
    imageUrl: { type: DataTypes.STRING },
    tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    userId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

Template.belongsTo(User, { foreignKey: "userId" });
module.exports = Template;
