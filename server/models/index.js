const Template = require("./Template");
const User = require("./User");
const Form = require("./Form");
const Question = require("./Question");
const Answer = require("./Answer");

// Пользователь → шаблоны
User.hasMany(Template, { foreignKey: "userId", onDelete: "CASCADE" });
Template.belongsTo(User, { foreignKey: "userId" });

// Шаблон → вопросы и формы
Template.hasMany(Question, { foreignKey: "templateId", onDelete: "SET NULL" });
Question.belongsTo(Template, {
  foreignKey: "templateId",
  onDelete: "SET NULL",
});

// Template.hasMany(Form, { foreignKey: "templateId", onDelete: "CASCADE" });
Template.hasMany(Form, { foreignKey: "templateId", onDelete: "SET NULL" });
Form.belongsTo(Template, { foreignKey: "templateId", onDelete: "SET NULL" });

// Форма → ответы
Form.hasMany(Answer, { foreignKey: "formId", onDelete: "CASCADE" });
Answer.belongsTo(Form, { foreignKey: "formId" });

// Вопрос → ответы
Question.hasMany(Answer, { foreignKey: "questionId" });
Answer.belongsTo(Question, { foreignKey: "questionId" });

module.exports = { User, Template, Form, Question, Answer };
