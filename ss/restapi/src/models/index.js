import fs from 'fs'
import path from 'path'

const Sequelize = require('sequelize')
const config = require(__dirname + '/../configs/sequelize.js')[process.env.NODE_ENV]
const basename = path.basename(__filename)

const models = {}
let sequelize

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
}

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-9) === '.model.js')) //모델파일들 불러와라!!
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize)
    //console.log("@@@@model", model.name);
    //const model = sequelize['import'](path.join(__dirname, file)); // 원래 블로그는 이거였는데.. 계속 오류가 나 찾아보니 문법이 바뀜
    models[model.name] = model;
  })

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
})

models.sequelize = sequelize
models.Sequelize = Sequelize


export default models
// export {
//   models
// }