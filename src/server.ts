import fastify from "fastify";
import { env } from "./env";
import { knex } from "./database";
import cookie from "@fastify/cookie"
import { authentication } from "./middlewares/authentication";
import { usersRoutes } from "./routes/users";

const app = fastify()

app.register(cookie)
app.register(usersRoutes, {
  prefix: '/users'
})


app.listen({
  port: env.PORT
}).then(()=>{
  console.log('Server running on port 3001')
})