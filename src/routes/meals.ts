import { FastifyInstance } from "fastify";
import { authentication } from "../middlewares/authentication";
import { knex } from "../database";
import { z } from "zod";

export async function mealsRoutes(app:FastifyInstance){
  app.addHook('preHandler', authentication)

  app.post('/', async(request, reply)=>{
    const checkExistsUserSchema = z.object({
      id: z.string().uuid()
    })

    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      is_on_diet: z.boolean()
    })

    const {id} = checkExistsUserSchema.parse(request.user)
    const {name, description, date, time, is_on_diet} = createMealBodySchema.parse(request.body)

    await knex('meals').insert({
      id: crypto.randomUUID(),
      user_id: id,
      name,
      description,
      date,
      time,
      is_on_diet
    })

    return reply.status(201).send()

  })

  app.put('/:id', async(request, reply)=>{
    const checkExistsUserSchema = z.object({
      id: z.string().uuid()
    })

    const updateMealParamsSchema = z.object({
      id: z.string().uuid()
    })

    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      is_on_diet: z.boolean()
    })

    const {id: user_id} = checkExistsUserSchema.parse(request.user)
    const {id} = updateMealParamsSchema.parse(request.params)
    const {name, description, date, time, is_on_diet} = updateMealBodySchema.parse(request.body)

    const meal = await knex('meals').where({id, user_id}).first()

    if(!meal){
      return reply.status(404).send({error: "Meal not found"})
    }

    await knex('meals').update({
      name, 
      description,
      date,
      time,
      is_on_diet,
      updated_at: knex.fn.now()
    }).where({
      id,
      user_id
    })

    return reply.status(200).send()
  })

  app.delete('/:id', async(request, reply)=>{
    const checkExistsUserSchema = z.object({
      id: z.string().uuid()
    })

    const deleteMealParamsSchema = z.object({
      id: z.string().uuid()
    })

    const {id: user_id} = checkExistsUserSchema.parse(request.user)
    const {id} = deleteMealParamsSchema.parse(request.params)

    await knex('meals').where({id, user_id}).delete()

    return reply.status(204).send()
  })

  app.get('/',async(request)=>{
    const checkExistsUserSchema = z.object({
      id: z.string().uuid()
    })

    const {id} = checkExistsUserSchema.parse(request.user)

    const meals = await knex('meals').where({user_id: id})

    return {
      meals
    }
  })

  app.get('/:id', async(request, reply)=>{
    const checkExistsUserSchema = z.object({
      id: z.string().uuid()
    })

    const getMealParamsSchema = z.object({
      id: z.string().uuid()
    })

    const {id: user_id} = checkExistsUserSchema.parse(request.user)
    const {id} = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals').where({id, user_id}).first()

    if(!meal){
      return reply.status(404).send({error: "Meal not found"})
    }

    return {
      meal
    }
  })

  app.get('/metrics', async(request)=>{
    const checkExistsUserSchema = z.object({
      id: z.string().uuid()
    })

    const {id} = checkExistsUserSchema.parse(request.user)

    const meals = await knex('meals').where({user_id: id})

    const allMeals = meals.length
    const mealsOnDiet = meals.filter(meal=>meal.is_on_diet).length
    const mealsOffDiet = allMeals - mealsOnDiet

    return {
      total: allMeals,
      on_diet: mealsOnDiet,
      off_diet: mealsOffDiet,
    }
  })
}