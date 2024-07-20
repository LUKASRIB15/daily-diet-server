import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";

export async function usersRoutes(app:FastifyInstance){
  app.post('/register', async(request, reply)=>{
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const {name, email} = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    reply.clearCookie('sessionId')

    
    sessionId = crypto.randomUUID()

    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
      session_id: sessionId
    })

    return reply.status(201).send()
  })

  app.post('/',async (request, reply)=>{
    const loggedUserBodySchema = z.object({
      email: z.string().email()
    })

    const {email} = loggedUserBodySchema.parse(request.body)

    const user = await knex('users').where({email}).first()

    if(!user){
      return reply.status(400).send({error: "User not found"})
    }

    let sessionId = request.cookies.sessionId

    reply.clearCookie('sessionId')

    
    sessionId = crypto.randomUUID()

    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    await knex('users').update({session_id: sessionId}).where({id: user.id})
    

    return reply.status(200).send()
  })
}