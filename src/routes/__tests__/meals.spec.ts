import {afterAll, beforeAll, describe, expect, it, beforeEach} from "vitest"
import { app } from "../../app"
import { execSync } from "node:child_process"
import request from "supertest"

describe("MealsRoutes", ()=>{
  let cookies : null | string[] = null

  beforeAll(()=>{
    app.ready()
  })

  beforeEach(async ()=>{
    execSync('npm run knex migrate:rollback -all')
    execSync('npm run knex migrate:latest')

    const createdUser = await request(app.server)
      .post('/users/register')
      .send({
        name: "Test user",
        email: "test@test.com"
    })

    cookies = createdUser.get('Set-Cookie')!
  })

  afterAll(()=>{
    app.close()
  })

  it("should be to able to create a new meal", async()=>{

    const response = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: "Test meal",
        description: "Test description",
        date: "01/01/2022",
        time: "10:00",
        is_on_diet: true
      })

    expect(response.statusCode).toEqual(201)
  })

  
  it("should be able to edit a meal", async()=>{
    
    await request(app.server)
    .post('/meals')
    .set('Cookie', cookies!)
    .send({
      name: "Test meal",
      description: "Test description",
      date: "01/01/2022",
      time: "10:00",
      is_on_diet: true
    })
    expect(201)
    
    const allMeals = await request(app.server)
    .get('/meals')
    .set('Cookie', cookies!)
    
    const mealId = allMeals.body.meals[0].id
    
    await request(app.server)
    .put(`/meals/${mealId}`)
    .set('Cookie', cookies!)
    .send({
      name: "Test meal 2",
      description: "Test description",
      date: "01/01/2022",
      time: "10:00",
      is_on_diet: false
    })
    .expect(200)
    
    const updatedAllMeals = await request(app.server)
    .get('/meals')
    .set('Cookie', cookies!)
    
    expect(updatedAllMeals.body.meals[0].name).not.toEqual(allMeals.body.meals[0].name)
  })
  
  it("should be able to list all meals", async()=>{
    

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: "Test meal",
        description: "Test description",
        date: "01/01/2022",
        time: "10:00",
        is_on_diet: true
      })

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!)

    expect(response.body.meals).toHaveLength(1)
    expect(response.body.meals).toEqual([
      expect.objectContaining({
        name: "Test meal",
        description: "Test description",
        date: "01/01/2022",
        time: "10:00",
        is_on_diet: 1 //true
      })
    ])
  })

  it("should be able to delete a meal", async()=>{

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: "Test meal",
        description: "Test description",
        date: "01/01/2022",
        time: "10:00",
        is_on_diet: true
      })
      expect(201)
    
    const allMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!)
    
    const mealId = allMeals.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies!)
      .send({
        name: "Test meal 2",
        description: "Test description",
        date: "01/01/2022",
        time: "10:00",
        is_on_diet: false
      })
      .expect(204)

    const updatedAllMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!)

    expect(updatedAllMeals.body.meals).toHaveLength(0)
  })

  it("should be able to see metrics about meals", async()=>{

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
          name: "Test meal",
          description: "Test description",
          date: "01/01/2022",
          time: "10:00",
          is_on_diet: true
        })
      expect(201)

      await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
          name: "Test meal 2",
          description: "Test description",
          date: "01/01/2022",
          time: "10:00",
          is_on_diet: false
        })
      expect(201)
    
    const response = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies!)
    

    expect(response.body).toEqual(
      expect.objectContaining({
        total: 2,
        on_diet: 1,
        off_diet: 1
      })
    )
  })
})