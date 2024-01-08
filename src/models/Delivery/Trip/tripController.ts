import * as yup from 'yup'
import { Transaction } from 'sequelize'
import { isId, useTransaction } from '../../../utils/utils'
import { DBError } from '../../../ErrorManagement/errors'
import { VehicleRead } from '../Vehicle/vehicleController'
import { Trip } from './Trip'
import { Vehicle } from '../Vehicle/vehicle'
import { Driver } from '../Driver/driver'
import { DeliveryStop } from '../DeliveryStop/DeliveryStop'
import DeliveryStopController, { DeliveryStopRead } from '../DeliveryStop/deliveryStopController'

// todo: how and when to update start and end times for the trip?
// todo: trip creation should support adding drivers and delivery stops

type TripCreational = {
  id: number
}

type TripRequired = {
  start: Date
  end: Date
}

type TripOptional = {
  name: string | null
}

type TripTimeStamps = {
  createdAt: Date
  updatedAt: Date
}
type TripAssociations = {
  vehicle?: VehicleRead | null
  // fixme: drivers and deliveryStops are not defined yet
  // drivers?: DriverRead[] | null
  deliveryStops: DeliveryStopRead[] | null
}

type TripFK = {
  vehicleId: number | null // nullable
}

// Note: DATA TYPES
export type TripCreate =
  Partial<TripCreational>
  & Required<TripRequired>
  & Partial<TripOptional>
  & Partial<TripTimeStamps>
  & Required<TripFK>
  // & Partial<TripAssociations>

export type TripRead = Required<TripCreate> & Partial<TripAssociations>

const tripSchemaCreate: yup.ObjectSchema<TripCreate> = yup.object({
  // TripFK
  // vehicleId: number | null
  vehicleId: yup.number()
    .integer()
    .positive()
    .default(null)
    .nullable()
    .label('Trip malformed data: vehicleId'),
  // required
  // start: Date
  // end: Date
  start: yup.date()
    .required()
    .nonNullable()
    .label('Trip malformed data: start'),
  end: yup.date()
    .required()
    .nonNullable()
    .label('Trip malformed data: end'),
  // optional
  // name: string | null
  name: yup.string()
    .default(null)
    .nullable()
    .label('Trip malformed data: name'),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Trip malformed data: id'),
  // timestamps
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('Trip malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Trip malformed data: updatedAt'),
})

const tripSchemaUpdate: yup.ObjectSchema<Partial<TripCreate>> = tripSchemaCreate.clone()
  .shape({
    // remove required or default instructions
    vehicleId: yup.number()
      .integer()
      .positive()
      .nullable()
      .label('Trip malformed data: vehicleId'),
    start: yup.date()
      .nonNullable()
      .label('Trip malformed data: start'),
    end: yup.date()
      .nonNullable()
      .label('Trip malformed data: end'),
    name: yup.string()
      .nullable()
      .label('Trip malformed data: name'),
  })

export function validateTripCreate(object: unknown): TripCreate {
  const trip = tripSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies TripCreate
  return trip
}

export function validateTripUpdate(object: unknown): Omit<Partial<TripCreate>, 'id'> {
  // restrict update of id, and creation or modification dates
  const trip = tripSchemaUpdate.omit(['id', 'createdAt', 'updatedAt']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<TripCreate>

  return trip
}

function tripToJson(trip: Trip): TripRead {
  const result: TripRead = trip.toJSON()
  if (trip.deliveryStops) {
    result.deliveryStops = trip.deliveryStops.map((stop) => DeliveryStopController.toJSON(stop))
  }
  return result
}

export default class TripController {
  /**
   * convert TripInstance(s) to a regular JSON object
   * @param data - Trip, array of Trips or null
   * @returns {TripRead | TripRead[] | null} JSON format nullable.
   */
  static toJSON(data: Trip | Trip[] | null): TripRead | TripRead[] | null {
    try {
      if (data instanceof Trip) {
        return tripToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(tripToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get Trip record by id from DB
   * @param {unknown} id - tripId
   * @returns {Trip} Trip object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Trip | null> {
    const tripId = isId.validateSync(id)
    const tripRecord = await Trip.findByPk(tripId, {
      transaction: t,
    })
    if (!tripRecord) {
      throw DBError.notFound(new Error(`Trip with id ${tripId} was not found`))
    }
    return tripRecord
  }

  /**
   * get full Trip record by id from DB
   * @param {unknown} id - tripId
   * @returns {Trip} Trip object or null
   */
  static async getFull(id: number | unknown, t?: Transaction): Promise<Trip | null> {
    const tripId = isId.validateSync(id)
    const tripRecord = await Trip.findByPk(tripId, {
      transaction: t,
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
        },
        {
          model: Driver,
          as: 'drivers',
          through: {
            attributes: [],
          },
        },
        {
          model: DeliveryStop,
          as: 'deliveryStops',
        },
      ],
    })
    if (!tripRecord) {
      throw DBError.notFound(new Error(`Trip with id ${tripId} was not found`))
    }
    return tripRecord
  }

  /**
   * get all trips   *
   * @returns {Trip[] | null} All trips
   */
  // fixme: add pagination
  static async getAll(t?: Transaction): Promise<Trip[] | null> {
    const final = await Trip.findAll({
      transaction: t,
    })
    return final
  }

  /**
   * insert trip record to DB.
   * @param {unknown} trip - Trip record to insert to DB
   * @returns {Trip} Trip object or throws error
   */
  static async create(trip: unknown, t?: Transaction): Promise<Trip> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedTrip = validateTripCreate(trip)
      const tripRecord = await Trip.create(parsedTrip, {
        transaction,
      })

      await commit()
      return tripRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * update trip record in DB.
   * @param {number | unknown} tripId - id of the trip record to update in DB
   * @param {unknown} tripUpdateData - update data for trip record
   * @returns {Trip} updated Trip object or throws not found error
   */
  static async update(tripId: number | unknown, tripUpdateData: unknown, t?: Transaction): Promise<Trip> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedTripUpdate = validateTripUpdate(tripUpdateData)

      const id = isId.validateSync(tripId)
      const tripRecord = await Trip.findByPk(id, { transaction })
      if (!tripRecord) {
        throw DBError.notFound(new Error(`Trip with id ${id} was not found`))
      }

      await tripRecord.update(parsedTripUpdate, { transaction })
      await commit()
      return tripRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete Trip record with a given id from DB.
   * @param {unknown} id - tripId
   * @returns {Trip} Trip object that was deleted or throws not found error
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<Trip> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const tripId = isId.validateSync(id)
      const tripRecord = await Trip.findByPk(tripId, { transaction })
      if (!tripRecord) {
        throw DBError.notFound(new Error(`Trip with id ${tripId} was not found`))
      }

      await Trip.destroy({
        where: {
          id: tripId,
        },
        transaction,
      })
      await commit()
      return tripRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  // manage drivers on the trip:
  // add driver to the trip
  // remove driver from the trip
  // get all drivers on the trip
  // set drivers on the trip

  /**
   * add driver to the trip
   * @param {number | unknown} tripId - id of the trip record to update in DB
   * @param {number | unknown} driverId - id of the driver to add to the trip
   * @returns {Trip}  Trip
   */
  static async addDriver(tripId: number | unknown, driverId: number | unknown, t?: Transaction): Promise<Trip> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const id = isId.validateSync(tripId)
      const tripRecord = await Trip.findByPk(id, { transaction })
      if (!tripRecord) {
        throw DBError.notFound(new Error(`Trip with id ${id} was not found`))
      }

      const driverIdParsed = isId.validateSync(driverId)
      await tripRecord.addDriver(driverIdParsed, { transaction })
      await commit()
      return tripRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
