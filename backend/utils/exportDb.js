const fs = require('fs');
const path = require('path');
const { User, Task, Comment } = require('../models');

async function exportDatabaseToJson() {
  try {
    const users = await User.findAll({
      attributes: { exclude: [] } // Include passwords as requested by user ("contain all the id , passwords")
    });
    const tasks = await Task.findAll();
    const comments = await Comment.findAll();

    const data = {
      users: users.map(u => u.toJSON()),
      tasks: tasks.map(t => t.toJSON()),
      comments: comments.map(c => c.toJSON()),
      last_updated: new Date().toISOString()
    };

    const targetPath = path.join(__dirname, '../../database/data_summary.json');
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
    console.log(`Database exported to ${targetPath}`);
  } catch (error) {
    console.error('Failed to export database:', error);
  }
}

module.exports = exportDatabaseToJson;
