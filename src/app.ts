import express from 'express'

console.log('running app')
const app = express()

app.get('/', (req, res) => {
  res.send('hi')
})

export default app