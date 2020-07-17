import httpStatus from 'http-status'
import createError from 'http-errors'
import userRepo from '../../repositories/user.repository'

const get = async (req, res, next) => {
  try {
    if (req.params.uuid) {
      const user = await userRepo.find(req.params.uuid)

      if (!user) {
        throw (createError(httpStatus.NOT_FOUND, '사용자를 찾을 수 없습니다.'))
      }

      return res
        .status(httpStatus.OK)
        .json(user.toWeb())
    } else {
      const users = await userRepo.all()

      return res.json(users.map(user => user.toWeb()))
    }
  } catch (e) {
    next(e)
  }
}

export {
  get
}


//////////////////////////////////////////////////사용자 id 와 pw를 가려줌..
// import httpStatus from 'http-status'
// import createError from 'http-errors'
// import userRepo from '../../repositories/user.repository'

// const get = async (req, res, next) => {
//   try {
//     if (req.params.uuid) {
//       const user = await userRepo.find(req.params.uuid)

//       if (!user) {
//         throw (createError(httpStatus.NOT_FOUND, '사용자를 찾을 수 없습니다.'))
//       }

//       return res
//         .status(httpStatus.OK)
//         .json(user)
//     } else {
//       const users = await userRepo.all()

//       return res.json(users)
//     }
//   } catch (e) {
//     next(e)
//   }
// }

// export {
//   get
// }


////////////////////////////////////////////////////uuid적용 전
// import {models} from '../../models'

// const get = async (req, res, next) => {
//   try {
//     const users = await models.User.findAll() // models 폴더에 있는 스키마 가져옴 User는 user.model.js 에서 return이 User이라는 스키마

//     return res.json(users) // 위에서 받아온 값들을 리턴
//   } catch (e) {
//     next(e)
//   }
// }

// export {  // 이 모든 일(?)들을 겟으로 날림
//   get
// }


///////////////////////////////////////////////////// 디비연결 전 ////////////////////////
// const get = (req, res, next) => {

//   console.log(req.query.rest)
//   try {
//     return res.json({message: 'users get ggg'});
//   } 
//   catch (e) {
//     next(e)
//   }
// }
  
// export {
//     get
// }