import * as yup from 'yup'
import { Transaction } from 'sequelize'
import { isId, useTransaction } from '../../../utils/utils'
import { CarrierType, carrierTypes } from './carrier'

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

// FIXME: CONTINUE HERE

// // type RequiredExceptFor<T, K extends keyof T> = Omit<T, K> & {
// //   [P in K]+?: T[P]
// // };

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
   * get Carrier record by id from DB. Will include magento record if available
   * @param {unknown} id - carrierId
   * @returns {Carrier} Carrier object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Carrier | null> {
    const carrierId = isId.validateSync(id)
    const final = await Carrier.findByPk(carrierId, {
      // include: 'magento',
      transaction: t,
    })
    return final
  }

  static async getByExternalId(id: number | unknown, t?: Transaction): Promise<Carrier | null> {
    const externalId = isId.validateSync(id)
    const final = await Carrier.findOne({
      where: {
        externalId,
      },
      transaction: t,
    })
    return final
  }

  /**
   * get all carriers   *
   * @returns {Address | Address[] | null} All carriers
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
   * update carrier record in DB. Will update magento record if provided.If magento record does not exist in DB, it will be created
   * @param {number | unknown} carrierId - id of the carrier record to update in DB
   * @param {unknown} carrier - update data for carrier record
   * @returns {Carrier} updated Carrier object or throws error
   */
  static async update(carrierId: number | unknown, carrier: unknown, t?: Transaction): Promise<Carrier> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedCarrierUpdate = validateCarrierUpdate(carrier)

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
   * upsert(insert or create) Carrier record in DB. magento Carrier externalId is required
   * @param {unknown | CarrierCreate} carrierData - update data for Carrier record
   * @returns {Carrier} updated or created Carrier object with Magento Record if available
   */
  static async upsert(carrierData: unknown, t?: Transaction): Promise<Carrier> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedCarrier = validateCarrierPartial(carrierData)
      if (!parsedCarrier.externalId) {
        throw new Error('externalId is required for upsert')
      }
      const carrierRecord = await Carrier.findOne({
        where: {
          externalId: parsedCarrier.externalId,
        },
        transaction,
      })

      let result: Carrier
      if (!carrierRecord) {
        result = await this.create(carrierData, transaction)
      } else {
        result = await this.update(carrierRecord.id, carrierData, transaction)
      }

      await commit()
      return result
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete Carrier record with a given id from DB.
   * @param {unknown} id - carrierId
   * @returns {boolean} true if object was deleted.
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const carrierId = isId.validateSync(id)
      const final = await Carrier.destroy({
        where: {
          id: carrierId,
        },
        transaction,
      })
      await commit()
      return final === 1
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
// done: get carrier (by id)
// done: get by magento id
// done: get all
// done: create carrier
// done: update carrier
// done: delete carrier

// done: upsert carrier (externalID is required)
