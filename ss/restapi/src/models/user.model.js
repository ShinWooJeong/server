'use strict'

import bcrypt from 'bcrypt'
import {
  uuid
} from '../utils/uuid'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    uuid: {
      allowNull: false,
      unique: true,
      type: 'bytea',
      defaultValue: () => Buffer.from(uuid(), 'hex'),
      get: function () {
        return Buffer.from(this.getDataValue('uuid')).toString('hex')
      }
    },
    email: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    }
  }, {
    tableName: 'users',
    timestamps: true,
  })

  User.associate = function (models) {
    // associations
  }

  // hooks
  User.beforeSave(async (user, options) => {
    if (user.changed('password')){
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // print
  User.prototype.toWeb = function () {
    const values = Object.assign({}, this.get())  // this -> this.get()

    delete values.id
    delete values.password

    return values
  }

  return User
}

/////////////////////////////////////////.toWeb 이란 함수를 써서 id 와 pw를 제거하기 전
// 'use strict'

// import {
//     uuid
// } from '../utils/uuid'

// module.exports = (sequelize, DataTypes) => {
//     const User = sequelize.define('User', {  // 모델을 정의하는 method는 define(),,sequelize.define('객체 이름', 스키마 정의, 테이블 설정)로 사용
        
//         uuid: {
//             allowNull: false,
//             unique: true,
//             type: 'bytea',
//             defaultValue: () => Buffer(uuid(), 'hex'), // uuid()로부터 생성된 hex문자열을 defaultValue로
//             get: function() {
//                 return Buffer.from(this.getDataValue('uuid')).toString('hex') // Byte Buffer로 변화시켜 넣음 // mysql에서 unhex()와 같음
//             }
//         },    
//         email: {
//             allowNull: false,
//             unique: true,
//             type: DataTypes.STRING,
//             validate: {
//                 isEmail: true,
//             },
//         },
//         password: {
//             allowNull: false,
//             type: DataTypes.STRING,
//         }
//     },
//     {
//         tableName: 'users',
//         timestamps: true,
//     })

//     User.associate = function (models) {
//         // associations
//     }

//     // hooks


//     //print
//     User.prototype.toWeb = function() {
//         const values = Object.assign({}, this)

//         delete values.id 
//         delete values.password

//         return values

//     }

//     return User
// }