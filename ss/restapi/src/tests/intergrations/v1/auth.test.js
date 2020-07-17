import request from 'supertest'
import randomString from 'random-string'
import models from '../../../models'
import userRepo from '../../../repositories/user.repository'

const app = require('../../../app')

afterAll( () => models.sequelize.close())

describe('로그인 테스트', () => {

    let userData;

    beforeAll(async () => {
        userData = {
            email: randomString() + '@test.com',
            password: randomString()
        }

        //테스트용 사용자 생성
        await userRepo.store(userDate)
    })

    test('실제 로그인 테스트. | 200', async () => {
        let response = await request(app)
            .post('/v1/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            })

        expect(response.statuseCode).toBe(200)
        expect(response.body.data.token).toBeTruthy()
    })
})