const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
const path = require('path');
const fs = require('fs');

const db = {};

fs.readdirSync(__dirname)
  .filter(file => (
    file.indexOf('.') !== 0 &&
    file !== path.basename(__filename) &&
    file.slice(-3) === '.js'
  ))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
const ContentDownload = require('./ContentDownload')(sequelize, DataTypes);
db['ContentDownload'] = ContentDownload;
  });


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
