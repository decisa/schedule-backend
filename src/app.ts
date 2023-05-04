import express from 'express'
import { parseCommentShape } from './models/Sales/OrderComment/orderCommentController'

console.log('running app')
const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('hi')
})

app.post('/order/import', (req, res) => {
  try {
    const comment = parseCommentShape(req.body)
    res.status(201).json(comment)
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(400).json({ error: 'unknown error' })
    }
  }
})

// app.post('/search', (req, res) => {
//   res.send(req.body)
// })

export default app
