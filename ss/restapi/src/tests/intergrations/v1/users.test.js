import request from 'supertest'
import randomString from 'random-string'
import {
  uuid
} from '../../../utils/uuid'
import models from '../../../models'

const app = require('../../../app')

let user

beforeAll(async () => {
  // 사용자 2명 생성
  await models.User.create({
    email: randomString() + '@test.com',
    password: randomString()
  })

  user = await models.User.create({
    email: randomString() + '@test.com',
    password: randomString()
  })
})

afterAll(() => models.sequelize.close())


// 다음과 같이 Jest의 describe() 함수를 통해 여러 개의 테스트 함수를 묶는 것이 가능합니다.
//여기서 test() 함수 대신에 it()함수사용가능. 이 두 함수는 완전히 동일한 기능을 하는 함수입니다.

describe('GET: /v1/users', () => {

  test('전체 사용자 조회. | 200', async () => {
    let response = await request(app)
      .get(`/v1/users`)

    expect(response.body.length)
      .toBeGreaterThan(1)
    //console.log(response.body[0]);
  })

  test('uuid 로 사용자 조회. | 200', async () => {
    let response = await request(app)
      .get(`/v1/users/${user.uuid}`)

    expect(response.body.email)
      .toEqual(user.email)   ///.toBe ==> .toEqual  // 사실 둘 다 차이가 없다.
  })

  test('잘못된 uuid 로 사용자 조회. | 404', async () => {
    let response = await request(app)
      .get(`/v1/users/${uuid()}`)

    expect(response.statusCode)
      .toBe(404)
  })
})