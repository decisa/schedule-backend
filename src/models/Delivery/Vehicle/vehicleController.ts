import * as yup from 'yup'
import { Transaction } from 'sequelize'
import { Vehicle, VehicleType, vehicleTypes } from './vehicle'
import { isId, useTransaction } from '../../../utils/utils'
import { DBError } from '../../../ErrorManagement/errors'

type VehicleCreational = {
  id: number
}

type VehicleRequired = {
  name: string
  semi: boolean // default false
  hazMat: boolean // default false
  type: VehicleType
}

type VehicleOptional = {
  maxVolume: number | null
  make: string | null
  model: string | null
  year: number | null
  vin: string | null
  height: number | null // inches
  width: number | null
  length: number | null
  gvw: number | null
  axles: number | null
}

type VehicleTimeStamps = {
  createdAt: Date
  updatedAt: Date
}
// type VehicleAssociations = {
//   trips?: trip[] | null
// }

// Note: DATA TYPES
export type VehicleCreate =
  Partial<VehicleCreational>
  & Required<VehicleRequired>
  & Partial<VehicleOptional>
  & Partial<VehicleTimeStamps>
  // & Partial<VehicleAssociations>

export type VehicleRead = Required<VehicleCreate>

const vehicleSchemaCreate: yup.ObjectSchema<VehicleCreate> = yup.object({
  // required
  // name: string
  // semi: boolean // default false
  // hazMat: boolean // default false
  // type: VehicleType
  name: yup.string()
    .required()
    .nonNullable()
    .label('Vehicle malformed data: name'),
  semi: yup.boolean()
    .default(false)
    .nonNullable()
    .required()
    .label('Vehicle malformed data: semi'),
  hazMat: yup.boolean()
    .default(false)
    .nonNullable()
    .required()
    .label('Vehicle malformed data: hazMat'),
  type: yup.mixed<VehicleType>()
    .oneOf(vehicleTypes)
    .nonNullable()
    .default('truck')
    .required()
    .label('Vehicle malformed data: type'),
  // optional
  // maxVolume: number | null
  // make: string | null
  // model: string | null
  // year: number | null
  // vin: string | null
  // height: number | null // inches
  // width: number | null
  // length: number | null
  // gvw: number | null
  // axles: number | null
  maxVolume: yup.number()
    .integer()
    .min(0)
    .nullable()
    .label('Vehicle malformed data: maxVolume'),
  make: yup.string()
    .nullable()
    .label('Vehicle malformed data: make'),
  model: yup.string()
    .nullable()
    .label('Vehicle malformed data: model'),
  year: yup.number()
    .integer()
    .min(0)
    .nullable()
    .label('Vehicle malformed data: year'),
  vin: yup.string()
    .nullable()
    .label('Vehicle malformed data: vin'),
  height: yup.number()
    .integer()
    .min(0)
    .nullable()
    .label('Vehicle malformed data: height'),
  width: yup.number()
    .integer()
    .min(0)
    .nullable()
    .label('Vehicle malformed data: width'),
  length: yup.number()
    .integer()
    .min(0)
    .nullable()
    .label('Vehicle malformed data: length'),
  gvw: yup.number()
    .integer()
    .min(0)
    .nullable()
    .label('Vehicle malformed data: gvw'),
  axles: yup.number()
    .integer()
    .min(2)
    .max(6)
    .nullable()
    .label('Vehicle malformed data: axles'),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Vehicle malformed data: id'),
  // timestamps
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('Vehicle malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Vehicle malformed data: updatedAt'),
})

const vehicleSchemaUpdate: yup.ObjectSchema<Partial<VehicleCreate>> = vehicleSchemaCreate.clone()
  .shape({
    // remove required or default instructions
    name: yup.string()
      .nonNullable()
      .label('Vehicle malformed data: name'),
    semi: yup.boolean()
      .nonNullable()
      .label('Vehicle malformed data: semi'),
    hazMat: yup.boolean()
      .nonNullable()
      .label('Vehicle malformed data: hazMat'),
    type: yup.mixed<VehicleType>()
      .oneOf(vehicleTypes)
      .nonNullable()
      .label('Vehicle malformed data: type'),
    // id: number
    id: yup
      .number()
      .integer()
      .positive()
      .nonNullable()
      .label('Vehicle malformed data: id'),
  })

export function validateVehicleCreate(object: unknown): VehicleCreate {
  const vehicle = vehicleSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies VehicleCreate
  return vehicle
}

export function validateVehicleUpdate(object: unknown): Omit<Partial<VehicleCreate>, 'id'> {
  // restrict update of id, and creation or modification dates
  const vehicle = vehicleSchemaUpdate.omit(['id', 'createdAt', 'updatedAt']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<VehicleCreate>

  return vehicle
}

function vehicleToJson(vehicle: Vehicle): VehicleRead {
  const result = vehicle.toJSON()
  return result
}

export default class VehicleController {
  /**
   * convert VehicleInstance(s) to a regular JSON object
   * @param data - Vehicle, array of Vehicles or null
   * @returns {VehicleRead | VehicleRead[] | null} JSON format nullable.
   */
  static toJSON(data: Vehicle | Vehicle[] | null): VehicleRead | VehicleRead[] | null {
    try {
      if (data instanceof Vehicle) {
        return vehicleToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(vehicleToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get Vehicle record by id from DB
   * @param {unknown} id - vehicleId
   * @returns {Vehicle} Vehicle object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Vehicle | null> {
    const vehicleId = isId.validateSync(id)
    const final = await Vehicle.findByPk(vehicleId, {
      transaction: t,
    })
    return final
  }

  /**
   * get all vehicles   *
   * @returns {Vehicle[] | null} All vehicles
   */
  static async getAll(t?: Transaction): Promise<Vehicle[] | null> {
    const final = await Vehicle.findAll({
      transaction: t,
    })
    return final
  }

  /**
   * insert vehicle record to DB.
   * @param {unknown} vehicle - Vehicle record to insert to DB
   * @returns {Vehicle} Vehicle object or throws error
   */
  static async create(vehicle: unknown, t?: Transaction): Promise<Vehicle> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedVehicle = validateVehicleCreate(vehicle)
      const vehicleRecord = await Vehicle.create(parsedVehicle, {
        transaction,
      })

      await commit()
      return vehicleRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * update vehicle record in DB.
   * @param {number | unknown} vehicleId - id of the vehicle record to update in DB
   * @param {unknown} vehicleUpdateData - update data for vehicle record
   * @returns {Vehicle} updated Vehicle object or throws not found error
   */
  static async update(vehicleId: number | unknown, vehicleUpdateData: unknown, t?: Transaction): Promise<Vehicle> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedVehicleUpdate = validateVehicleUpdate(vehicleUpdateData)

      const id = isId.validateSync(vehicleId)
      const vehicleRecord = await Vehicle.findByPk(id, { transaction })
      if (!vehicleRecord) {
        throw DBError.notFound(new Error(`Vehicle with id ${id} was not found`))
      }

      await vehicleRecord.update(parsedVehicleUpdate, { transaction })
      await commit()
      return vehicleRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete Vehicle record with a given id from DB.
   * @param {unknown} id - vehicleId
   * @returns {Vehicle} Vehicle object that was deleted or throws not found error
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<Vehicle> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const vehicleId = isId.validateSync(id)
      const vehicleRecord = await Vehicle.findByPk(vehicleId, { transaction })
      if (!vehicleRecord) {
        throw DBError.notFound(new Error(`Vehicle with id ${vehicleId} was not found`))
      }

      await Vehicle.destroy({
        where: {
          id: vehicleId,
        },
        transaction,
      })
      await commit()
      return vehicleRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
