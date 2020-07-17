var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('postgres://postgres:chzhzh1212@localhost:5433/loc');
var db = {};

db['loc'] = sequelize.import(path.join(__dirname, 'style_server.js'));
db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;

db.loc.sync();
db.loc.drop();
db.loc.sync({force: true});