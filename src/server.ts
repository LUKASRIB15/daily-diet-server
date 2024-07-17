import fastify from "fastify";
import { env } from "./env";
import { knex } from "./database";

const app = fastify()

app.get('/hello', async ()=>{
  const tables = await knex('sqlite_schema').select('*')
  return tables
})

app.listen({
  port: env.PORT
}).then(()=>{
  console.log('Server running on port 3001')
})