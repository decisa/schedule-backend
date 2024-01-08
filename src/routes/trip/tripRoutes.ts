import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import TripController from '../../models/Delivery/Trip/tripController'
import DriverController from '../../models/Delivery/Driver/driverController'

const tripRouter = express.Router()

// create Trip record
tripRouter.post('/', (req, res) => {
  try {
    const tripData = req.body as unknown
    TripController.create(tripData)
      .then((result) => {
        const tripResult = TripController.toJSON(result)
        handleResponse(res, tripResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get All Trip records
// tripRouter.get('/all', (req, res) => {
//   try {
//     TripController.getAll()
//       .then((result) => {
//         const tripResult = TripController.toJSON(result)
//         handleResponse(res, tripResult)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// get Trip record
tripRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    TripController.getFull(id)
      .then((result) => {
        const tripResult = TripController.toJSON(result)
        handleResponse(res, tripResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update Trip record
tripRouter.patch('/:id', (req, res) => {
  try {
    const { id } = req.params
    const tripUpdateData = req.body as unknown
    TripController.update(id, tripUpdateData)
      .then((result) => {
        const tripResult = TripController.toJSON(result)
        handleResponse(res, tripResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// delete Trip record
tripRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    TripController.delete(id)
      .then((result) => {
        const deletedTripRecord = TripController.toJSON(result)
        handleResponse(res, deletedTripRecord)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// note: manage drivers on the trip:
// add driver to the trip
tripRouter.post('/:tripId/drivers/:driverId', (req, res) => {
  try {
    const { tripId, driverId } = req.params
    TripController.addDriver(tripId, driverId)
      .then((result) => {
        const tripResult = DriverController.toJSON(result)
        handleResponse(res, tripResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})
// remove driver from the trip
tripRouter.delete('/:tripId/drivers/:driverId', (req, res) => {
  try {
    const { tripId, driverId } = req.params
    TripController.removeDriver(tripId, driverId)
      .then((result) => {
        const tripResult = DriverController.toJSON(result)
        handleResponse(res, tripResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// set/replace drivers on the trip
tripRouter.patch('/:tripId/drivers', (req, res) => {
  try {
    const { tripId } = req.params
    TripController.setDrivers(tripId, req.body)
      .then((result) => {
        const tripResult = DriverController.toJSON(result)
        handleResponse(res, tripResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get all drivers on the trip
tripRouter.get('/:tripId/drivers', (req, res) => {
  try {
    const { tripId } = req.params
    TripController.getDrivers(tripId)
      .then((result) => {
        const tripResult = DriverController.toJSON(result)
        handleResponse(res, tripResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})
export default tripRouter
