import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import rootRouter from './routes'

console.log('running app')
const app = express()
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
