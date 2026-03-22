const sequelize = require("../config/database");
const User = require("./User");
const Task = require("./Task");
const Comment = require("./Comment");

User.hasMany(Task, {
  foreignKey: "assigned_to",
  as: "tasks",
});

Task.belongsTo(User, {
  foreignKey: "assigned_to",
  as: "assignee",
});

Task.hasMany(Comment, {
  foreignKey: "task_id",
  as: "comments",
  onDelete: "CASCADE",
});

Comment.belongsTo(Task, {
  foreignKey: "task_id",
  as: "task",
});

User.hasMany(Comment, {
  foreignKey: "user_id",
  as: "comments",
});

Comment.belongsTo(User, {
  foreignKey: "user_id",
  as: "author",
});

module.exports = {
  sequelize,
  User,
  Task,
  Comment,
};
