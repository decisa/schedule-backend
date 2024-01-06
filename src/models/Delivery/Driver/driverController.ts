import * as yup from 'yup'
import { Transaction } from 'sequelize'
import { isId, useTransaction } from '../../../utils/utils'
import { DBError } from '../../../ErrorManagement/errors'
import { Driver, DriverRole, driverRoles } from './driver'

type DriverCreational = {
  id: number
}

type DriverRequired = {
  firstName: string
  lastName: string
  driverRole: DriverRole
}

type DriverOptional = {
  phoneNumber: string | null
  email: string | null
  licenceNumber: string | null
}

type DriverTimeStamps = {
  createdAt: Date
  updatedAt: Date
}
// type DriverAssociations = {
//   trips?: trip[] | null
//   driverDownTimes?: driverDownTime[] | null
// }

// Note: DATA TYPES
export type DriverCreate =
  Partial<DriverCreational>
  & Required<DriverRequired>
  & Partial<DriverOptional>
  & Partial<DriverTimeStamps>
  // & Partial<DriverAssociations>

export type DriverRead = Required<DriverCreate>

const driverSchemaCreate: yup.ObjectSchema<DriverCreate> = yup.object({
  // required
  // firstName: string
  // lastName: string
  // driverRole: DriverRole
  firstName: yup.string()
    .required()
    .nonNullable()
    .label('Driver malformed data: firstName'),
  lastName: yup.string()
    .required()
    .nonNullable()
    .label('Driver malformed data: lastName'),
  driverRole: yup.mixed<DriverRole>()
    .oneOf(driverRoles)
    .nonNullable()
    .default(driverRoles[0])
    .required()
    .label('Driver malformed data: driverRole'),
  // optional
  // phoneNumber: string | null
  // email: string | null
  // licenceNumber: string | null
  phoneNumber: yup.string()
    .nullable()
    .label('Driver malformed data: phoneNumber'),
  email: yup.string()
    .email()
    .nullable()
    .label('Driver malformed data: email'),
  licenceNumber: yup.string()
    .nullable()
    .label('Driver malformed data: licenceNumber'),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Driver malformed data: id'),
  // timestamps
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('Driver malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Driver malformed data: updatedAt'),
})

const driverSchemaUpdate: yup.ObjectSchema<Partial<DriverCreate>> = driverSchemaCreate.clone()
  .shape({
    // remove required or default instructions
    firstName: yup.string()
      .nonNullable()
      .label('Driver malformed data: firstName'),
    lastName: yup.string()
      .nonNullable()
      .label('Driver malformed data: lastName'),
    driverRole: yup.mixed<DriverRole>()
      .oneOf(driverRoles)
      .nonNullable()
      .label('Driver malformed data: driverRole'),
  })

export function validateDriverCreate(object: unknown): DriverCreate {
  const driver = driverSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies DriverCreate
  return driver
}

export function validateDriverUpdate(object: unknown): Omit<Partial<DriverCreate>, 'id'> {
  // restrict update of id, and creation or modification dates
  const driver = driverSchemaUpdate.omit(['id', 'createdAt', 'updatedAt']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<DriverCreate>

  return driver
}

function driverToJson(driver: Driver): DriverRead {
  const result = driver.toJSON()
  return result
}

export default class DriverController {
  /**
   * convert DriverInstance(s) to a regular JSON object
   * @param data - Driver, array of Drivers or null
   * @returns {DriverRead | DriverRead[] | null} JSON format nullable.
   */
  static toJSON(data: Driver | Driver[] | null): DriverRead | DriverRead[] | null {
    try {
      if (data instanceof Driver) {
        return driverToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(driverToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get Driver record by id from DB
   * @param {unknown} id - driverId
   * @returns {Driver} Driver object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Driver | null> {
    const driverId = isId.validateSync(id)
    const final = await Driver.findByPk(driverId, {
      transaction: t,
    })
    return final
  }

  /**
   * get all drivers   *
   * @returns {Driver[] | null} All drivers
   */
  static async getAll(t?: Transaction): Promise<Driver[] | null> {
    const final = await Driver.findAll({
      transaction: t,
    })
    return final
  }

  /**
   * insert driver record to DB.
   * @param {unknown} driver - Driver record to insert to DB
   * @returns {Driver} Driver object or throws error
   */
  static async create(driver: unknown, t?: Transaction): Promise<Driver> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedDriver = validateDriverCreate(driver)
      const driverRecord = await Driver.create(parsedDriver, {
        transaction,
      })

      await commit()
      return driverRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * update driver record in DB.
   * @param {number | unknown} driverId - id of the driver record to update in DB
   * @param {unknown} driverUpdateData - update data for driver record
   * @returns {Driver} updated Driver object or throws not found error
   */
  static async update(driverId: number | unknown, driverUpdateData: unknown, t?: Transaction): Promise<Driver> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedDriverUpdate = validateDriverUpdate(driverUpdateData)

      const id = isId.validateSync(driverId)
      const driverRecord = await Driver.findByPk(id, { transaction })
      if (!driverRecord) {
        throw DBError.notFound(new Error(`Driver with id ${id} was not found`))
      }

      await driverRecord.update(parsedDriverUpdate, { transaction })
      await commit()
      return driverRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete Driver record with a given id from DB.
   * @param {unknown} id - driverId
   * @returns {Driver} Driver object that was deleted or throws not found error
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<Driver> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const driverId = isId.validateSync(id)
      const driverRecord = await Driver.findByPk(driverId, { transaction })
      if (!driverRecord) {
        throw DBError.notFound(new Error(`Driver with id ${driverId} was not found`))
      }

      await Driver.destroy({
        where: {
          id: driverId,
        },
        transaction,
      })
      await commit()
      return driverRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
