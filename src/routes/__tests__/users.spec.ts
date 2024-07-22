import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest"
import request from "supertest"
import { app } from "../../app"
import {execSync} from "node:child_process"

describe("UsersRoutes", ()=>{
  beforeAll(()=>{
    app.ready()
  })

  beforeEach(()=>{
    execSync('npm run knex migrate:rollback -all')
    execSync('npm run knex migrate:latest')
  })

  afterAll(()=>{
    app.close()
  })

  it("should be able to create a new user", async ()=>{
    const response = await request(app.server)
      .post('/users/register')
      .send({
        name: "Test user",
        email: "test@test.com"
      })

    expect(response.statusCode).toEqual(201)
  })

  it("should be able to login", async()=>{
    await request(app.server)
      .post('/users/register')
      .send({
        name: "Test user",
        email: "test@test.com"
    })

    const response = await request(app.server)
      .post('/users')
      .send({
        email: "test@test.com"
      })

    expect(response.statusCode).toEqual(200)
  })

  it("should be not able to login with wrong email", async()=>{
    const response = await request(app.server)
      .post('/users')
      .send({
        email: "wrong@test.com"
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toHaveProperty('error', 'User not found')
  })
})