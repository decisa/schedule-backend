import express from 'express'
import commentRouter from './comments/commentRoutes'

const rootRouter = express.Router()

rootRouter.get('/', (req, res) => {
  res.send('hi')
})

rootRouter.use('/comment', commentRouter)
export default rootRouter
