import * as yup from 'yup'
import { Transaction } from 'sequelize'
import {
  isId, useTransaction,
} from '../../../utils/utils'
import { DeliveryMethod } from './deliveryMethod'

type DeliveryMethodCreational = {
  id: number
}

type DeliveryMethodRequired = {
  name: string
  description: string
}

type DeliveryMethodTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

// type DeliveryMethodAssociations = {
//   // orders?: Order[]
// }

// Note: DATA TYPES
export type DeliveryMethodCreate =
  Partial<DeliveryMethodCreational>
  & Required<DeliveryMethodRequired>
  & Partial<DeliveryMethodTimeStamps>

const deliveryMethodSchemaCreate: yup.ObjectSchema<DeliveryMethodCreate> = yup.object({
  // required
  // name: string
  // description: string
  name: yup.string()
    .required()
    .label('Comment malformed data: name'),
  description: yup.string()
    .default('')
    .ensure()
    .label('Comment malformed data: name'),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Comment malformed data: id'),
  // timestamps
  createdAt: yup.date().nonNullable().label('Comment malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Comment malformed data: updatedAt'),
})

const deliveryMethodSchemaUpdate: yup.ObjectSchema<Partial<DeliveryMethodCreate>> = deliveryMethodSchemaCreate
  .clone()
  .shape({
    name: yup.string()
      .nonNullable()
      .label('Comment malformed data: name'),
    description: yup.string()
      .nonNullable()
      .label('Comment malformed data: name'),
  })

// type RequiredExceptFor<T, K extends keyof T> = Omit<T, K> & {
//   [P in K]+?: T[P]
// };

export type DeliveryMethodRead = Required<DeliveryMethodCreate>

export function validateDeliveryMethodCreate(object: unknown): DeliveryMethodCreate {
  const deliveryMethod = deliveryMethodSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies DeliveryMethodCreate
  return deliveryMethod
}

export function validateDeliveryMethodUpdate(object: unknown): Partial<DeliveryMethodCreate> {
  // restrict update of id, and creation or modification dates
  const deliveryMethod = deliveryMethodSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<DeliveryMethodCreate>
  return deliveryMethod
}

function deliveryMethodToJson(deliveryMethod: DeliveryMethod): DeliveryMethodRead {
  return deliveryMethod.toJSON() satisfies DeliveryMethodRead
}
export default class DeliveryMethodController {
  /**
   * convert DeliveryMethodInstance to a regular JSON object
   * @param data - DeliveryMethod, array of order Comments or null
   * @returns {DeliveryMethodRead | DeliveryMethodRead[] | null} JSON format nullable.
   */
  static toJSON(data: DeliveryMethod): DeliveryMethodRead
  static toJSON(data: DeliveryMethod | null): DeliveryMethodRead | null
  static toJSON(data: DeliveryMethod[]): DeliveryMethodRead[]
  static toJSON(data: DeliveryMethod[] | null): DeliveryMethodRead[] | null
  static toJSON(data: null): null
  static toJSON(data: DeliveryMethod | DeliveryMethod[] | null): DeliveryMethodRead | DeliveryMethodRead[] | null {
    try {
      if (data instanceof DeliveryMethod) {
        return deliveryMethodToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(deliveryMethodToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get deliveryMethod record by id from DB.
   * @param {unknown} id - deliveryMethodId
   * @returns {DeliveryMethod} DeliveryMethod object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<DeliveryMethod | null> {
    const deliveryMethodId = isId.validateSync(id)
    const final = await DeliveryMethod.findByPk(deliveryMethodId, { transaction: t })
    return final
  }

  /**
   * get All deliveryMethod records from DB.
   * @param {unknown} id - deliveryMethodId
   * @returns {DeliveryMethod} DeliveryMethod object or null
   */
  static async getAll(t?: Transaction): Promise<DeliveryMethod[] | null> {
    const final = await DeliveryMethod.findAll({ transaction: t })
    return final
  }

  /**
   * insert deliveryMethod record to DB.
   * @param {unknown} deliveryMethod - deliveryMethod record to insert to DB
   * @returns {DeliveryMethod} DeliveryMethod object or throws error
   */
  static async create(deliveryMethod: unknown, t?: Transaction): Promise<DeliveryMethod> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedDeliveryMethod = validateDeliveryMethodCreate(deliveryMethod)

      const result = await DeliveryMethod.create(parsedDeliveryMethod, {
        transaction,
      })
      await commit()
      return result
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * update deliveryMethod record in DB.
   * @param {number | unknown} deliveryMethodId - id of the deliveryMethod record to update in DB
   * @param {unknown} deliveryMethod - update data for deliveryMethod record
   * @returns {DeliveryMethod} Updated DeliveryMethod object or throws error
   */
  static async update(deliveryMethodId: number | unknown, deliveryMethod: unknown, t?: Transaction): Promise<DeliveryMethod> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedDeliveryMethod = validateDeliveryMethodUpdate(deliveryMethod)
      const id = isId.validateSync(deliveryMethodId)

      const deliveryMethodRecord = await DeliveryMethod.findByPk(id, { transaction })
      if (!deliveryMethodRecord) {
        throw new Error('deliveryMethod does not exist')
      }

      await deliveryMethodRecord.update(parsedDeliveryMethod, { transaction })

      await commit()
      return deliveryMethodRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete deliveryMethod record with a given id from DB.
   * @param {unknown} id - deliveryMethodId
   * @returns {number} number of objects deleted.
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const deliveryMethodId = isId.validateSync(id)
      const final = await DeliveryMethod.destroy({
        where: {
          id: deliveryMethodId,
        },
        transaction,
      })
      console.log('deletion result: ', final)
      await commit()
      return final === 1
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
