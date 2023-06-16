import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import rootRouter from './routes'

console.log('running app')
const app = express()

// FIXME: make cors more restrictive
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})
// app.use(cors())
app.use(express.json())

app.use('/', rootRouter)

// any uncaught errors handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    res.status(400).json({ error: `uncaught error: ${err.message}` })
  } else {
    res.status(500).json({ error: 'Unhandled Internal server error' })
  }
})

export default app
