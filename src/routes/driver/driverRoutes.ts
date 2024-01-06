import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import DriverController from '../../models/Delivery/Driver/driverController'

const driverRouter = express.Router()

// create Driver record
driverRouter.post('/', (req, res) => {
  try {
    const driverData = req.body as unknown
    DriverController.create(driverData)
      .then((result) => {
        const driverResult = DriverController.toJSON(result)
        handleResponse(res, driverResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get All Driver records
driverRouter.get('/all', (req, res) => {
  try {
    DriverController.getAll()
      .then((result) => {
        const driverResult = DriverController.toJSON(result)
        handleResponse(res, driverResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get Driver record
driverRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    DriverController.get(id)
      .then((result) => {
        const driverResult = DriverController.toJSON(result)
        handleResponse(res, driverResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update Driver record
driverRouter.patch('/:id', (req, res) => {
  try {
    const { id } = req.params
    const driverUpdateData = req.body as unknown
    DriverController.update(id, driverUpdateData)
      .then((result) => {
        const driverResult = DriverController.toJSON(result)
        handleResponse(res, driverResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// delete Driver record
driverRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    DriverController.delete(id)
      .then((result) => {
        const deletedDriverRecord = DriverController.toJSON(result)
        handleResponse(res, deletedDriverRecord)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default driverRouter
