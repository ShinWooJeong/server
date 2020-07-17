import express from 'express'
import {
  get
} from '../../controllers/v1/user.controller'

const router = express.Router()

router.route('/:uuid?')
  .get(
    get
  )

export default router


////////////////////////////////////////1
// import express from 'express'
// import {get} from '../../controllers/v1/user.constroller'

// const router = express.Router()

// router.route('/')
//   .get(
//     get
//   )

// export default router