import fastify from "fastify";

const app = fastify()

app.get('/hello', async ()=>{
  return 'hello! Welcome to my server Daily Diet!'
})

app.listen({
  port: 3001
}).then(()=>{
  console.log('Server running on port 3001')
})