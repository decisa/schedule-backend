import * as yup from 'yup'
import { Transaction } from 'sequelize'
import { isId, useTransaction } from '../../../utils/utils'
import { Carrier, CarrierType, carrierTypes } from './carrier'
import { DBError } from '../../../ErrorManagement/errors'

type CarrierCreational = {
  id: number
}

type CarrierRequired = {
  name: string
  type: CarrierType
}

type CarrierOptional = {
  contactName: string | null
  phone: string | null
  altPhone: string | null
  email: string | null
  accountNumber: string | null
}

// type CarrierAssociations = {
//   shipments?: Shipment[] | null
// }

// Note: DATA TYPES
export type CarrierCreate =
  Partial<CarrierCreational>
  & Required<CarrierRequired>
  & Partial<CarrierOptional>
  // & Partial<CarrierAssociations>

export type CarrierRead = Required<CarrierCreate>

const carrierSchemaCreate: yup.ObjectSchema<CarrierCreate> = yup.object({
  // required
  // name: string
  // type: CarrierType
  name: yup.string()
    .required()
    .label('Carrier malformed data: name'),
  type: yup.mixed<CarrierType>()
    .oneOf(carrierTypes)
    .nonNullable()
    .required()
    .label('Carrier malformed data: type'),
  // optional
  // contactName: string | null
  // phone: string | null
  // altPhone: string | null
  // email: string | null
  // accountNumber: string | null

  contactName: yup.string()
    .nullable()
    .label('Carrier malformed data: contactName'),
  phone: yup.string()
    .nullable()
    .label('Carrier malformed data: phone'),
  altPhone: yup.string()
    .nullable()
    .label('Carrier malformed data: altPhone'),
  email: yup.string()
    .email()
    .nullable()
    .label('Carrier malformed data: email'),
  accountNumber: yup.string()
    .nullable()
    .label('Carrier malformed data: accountNumber'),
  // creational
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: id'),
  // timestamps
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('Malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Malformed data: updatedAt'),
})

const carrierSchemaUpdate: yup.ObjectSchema<Partial<CarrierCreate>> = carrierSchemaCreate
  .clone()
  .shape({
    name: yup.string()
      .label('Carrier malformed data: name')
      .nonNullable(),
    // optional
    // externalId: number | null
    type: yup.mixed<CarrierType>()
      .oneOf(carrierTypes)
      .label('Carrier malformed data: type')
      .nonNullable(),
  })

// FIXM: CONTINUE HERE

export function validateCarrierCreate(object: unknown): CarrierCreate {
  const carrier = carrierSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies CarrierCreate
  return carrier
}

export function validateCarrierUpdate(object: unknown): Omit<Partial<CarrierCreate>, 'id'> {
  // restrict update of id, and creation or modification dates
  const carrier = carrierSchemaUpdate.omit(['id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<CarrierCreate>

  return carrier
}

export function validateCarrierPartial(object: unknown): Partial<CarrierCreate> {
  // restrict update of id, and creation or modification dates
  const carrier = carrierSchemaUpdate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<CarrierCreate>

  return carrier
}

function carrierToJson(carrier: Carrier): CarrierRead {
  const result = carrier.toJSON()
  return result
}

export default class CarrierController {
  /**
   * convert CarrierInstance(s) to a regular JSON object
   * @param data - Carrier, array of Carriers or null
   * @returns {CarrierRead | CarrierRead[] | null} JSON format nullable.
   */
  static toJSON(data: Carrier | Carrier[] | null): CarrierRead | CarrierRead[] | null {
    try {
      if (data instanceof Carrier) {
        return carrierToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(carrierToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get Carrier record by id from DB.
   * @param {unknown} id - carrierId
   * @returns {Carrier} Carrier object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Carrier | null> {
    const carrierId = isId.validateSync(id)
    const final = await Carrier.findByPk(carrierId, {
      transaction: t,
    })
    return final
  }

  /**
   * get all carriers   *
   * @returns {Carrier | Carrier[] | null} All carriers
   */
  static async getAll(t?: Transaction): Promise<Carrier[] | null> {
    const final = await Carrier.findAll({
      transaction: t,
    })
    return final
  }

  /**
   * insert carrier record to DB.
   * @param {unknown} Carrier - Carrier record to insert to DB
   * @returns {Carrier} Carrier object or throws error
   */
  static async create(carrier: unknown, t?: Transaction): Promise<Carrier> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedCarrier = validateCarrierCreate(carrier)
      const carrierRecord = await Carrier.create(parsedCarrier, {
        transaction,
      })

      await commit()
      return carrierRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * update carrier record in DB.
   * @param {number | unknown} carrierId - id of the carrier record to update in DB
   * @param {unknown} carrierUpdateData - update data for carrier record
   * @returns {Carrier} updated Carrier object or throws error
   */
  static async update(carrierId: number | unknown, carrierUpdateData: unknown, t?: Transaction): Promise<Carrier> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedCarrierUpdate = validateCarrierUpdate(carrierUpdateData)

      const id = isId.validateSync(carrierId)
      const carrierRecord = await Carrier.findByPk(id, { transaction })
      if (!carrierRecord) {
        throw new Error('Carrier does not exist')
      }

      await carrierRecord.update(parsedCarrierUpdate, { transaction })

      await commit()
      return carrierRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete Carrier record with a given id from DB.
   * @param {unknown} id - carrierId
   * @returns {Carrier} Carrier object that was deleted or throws error.
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<Carrier> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const carrierId = isId.validateSync(id)
      const carrierRecord = await Carrier.findByPk(carrierId, { transaction })
      if (!carrierRecord) {
        throw DBError.notFound(new Error(`Carrier with id ${carrierId} was not found`))
      }
      await Carrier.destroy({
        where: {
          id: carrierId,
        },
        transaction,
      })
      await commit()
      return carrierRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
