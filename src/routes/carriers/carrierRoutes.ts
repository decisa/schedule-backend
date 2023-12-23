import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import CarrierController from '../../models/Receiving/Carrier/carrierController'

const carrierRouter = express.Router()

// create Brand record
carrierRouter.post('/', (req, res) => {
  try {
    const carrier = req.body as unknown
    CarrierController.create(carrier)
      .then((result) => {
        const carrierResult = CarrierController.toJSON(result)
        handleResponse(res, carrierResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get all carriers
carrierRouter.get('/all', (req, res) => {
  try {
    CarrierController.getAll()
      .then((result) => {
        const carrierResult = CarrierController.toJSON(result)
        handleResponse(res, carrierResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get carrier by id
carrierRouter.get('/:id', (req, res) => {
  try {
    CarrierController.get(req.params.id)
      .then((result) => {
        const carrierResult = CarrierController.toJSON(result)
        handleResponse(res, carrierResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// delete carrier by id
carrierRouter.delete('/:id', (req, res) => {
  try {
    CarrierController.delete(req.params.id)
      .then((result) => {
        const deletedCarrier = CarrierController.toJSON(result)
        handleResponse(res, deletedCarrier)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update carrier
carrierRouter.patch('/:id', (req, res) => {
  try {
    const carrierUpdate = req.body as unknown
    CarrierController.update(req.params.id, carrierUpdate)
      .then((result) => {
        const carrierResult = CarrierController.toJSON(result)
        handleResponse(res, carrierResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default carrierRouter
