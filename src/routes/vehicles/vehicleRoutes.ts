import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import VehicleController from '../../models/Delivery/Vehicle/vehicleController'

const vehicleRouter = express.Router()

// create Vehicle record
vehicleRouter.post('/', (req, res) => {
  try {
    const vehicleData = req.body as unknown
    VehicleController.create(vehicleData)
      .then((result) => {
        const vehicleResult = VehicleController.toJSON(result)
        handleResponse(res, vehicleResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get All Vehicle records
vehicleRouter.get('/all', (req, res) => {
  try {
    VehicleController.getAll()
      .then((result) => {
        const vehicleResult = VehicleController.toJSON(result)
        handleResponse(res, vehicleResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get Vehicle record
vehicleRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    VehicleController.get(id)
      .then((result) => {
        const vehicleResult = VehicleController.toJSON(result)
        handleResponse(res, vehicleResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update Vehicle record
vehicleRouter.patch('/:id', (req, res) => {
  try {
    const { id } = req.params
    const vehicleUpdateData = req.body as unknown
    VehicleController.update(id, vehicleUpdateData)
      .then((result) => {
        const vehicleResult = VehicleController.toJSON(result)
        handleResponse(res, vehicleResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// delete Vehicle record
vehicleRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    VehicleController.delete(id)
      .then((result) => {
        const deletedVehicleRecord = VehicleController.toJSON(result)
        handleResponse(res, deletedVehicleRecord)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default vehicleRouter
