import * as yup from 'yup'
import { ForeignKeyConstraintError, Transaction } from 'sequelize'
import { isId, useTransaction } from '../../../utils/utils'
import { DeliveryStop, StopType, stopTypes } from './DeliveryStop'
import { OrderAddressRead } from '../../Sales/OrderAddress/orderAddressContoller'
import DeliveryController, { DeliveryRead } from '../Delivery/DeliveryController'
import { Delivery } from '../Delivery/Delivery'
import { OrderAddress } from '../../Sales/OrderAddress/orderAddress'
import { DBError } from '../../../ErrorManagement/errors'

type DeliveryStopCreational = {
  id: number
}

type DeliveryStopRequired = {
  stopType: StopType
  stopNumber: number
}

type DeliveryStopOptional = {
  estimatedDurationString: string | null
  estimatedDuration: [number, number] | null
  notes: string | null
}

type DeliveryStopTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type DeliveryStopFK = {
  tripId: number
  shippingAddressId: number | null
}

type DeliveryStopAssociations = {
  shippingAddress: OrderAddressRead
  deliveries: DeliveryRead[]
}

// Note: DATA TYPES
export type DeliveryStopCreate =
  Partial<DeliveryStopCreational>
  & Required<DeliveryStopRequired>
  & Partial<DeliveryStopOptional>
  & Partial<DeliveryStopTimeStamps>
  & Required<DeliveryStopFK>
  // & Partial<DeliveryStopAssociations>

// export type DeliveryStopUpdate = Partial<DeliveryStopCreate>

export type DeliveryStopRead = Required<DeliveryStopCreate> & Partial<DeliveryStopAssociations>
// todo: add logic to control qty update

// forbid id, createdAt, updatedAt updates through API
export type DeliveryStopUpdate = Omit<Partial<DeliveryStopCreate>, 'id' | 'createdAt' | 'updatedAt'>

const deliveryStopSchemaCreate: yup.ObjectSchema<DeliveryStopCreate> = yup.object({
  // FK
  // tripId: number
  // shippingAddressId: number | null
  tripId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('DeliveryStop malformed data: tripId'),
  shippingAddressId: yup.number()
    .integer()
    .positive()
    .nullable()
    .default(null)
    .label('DeliveryStop malformed data: shippingAddressId'),
  // required
  // stopType: StopType
  // stopNumber: number
  stopType: yup.mixed<StopType>()
    .oneOf(stopTypes)
    .nonNullable()
    .required()
    .label('DeliveryStop malformed data: stopType'),
  stopNumber: yup.number()
    .integer()
    .default(-1)
    .required()
    .label('DeliveryStop malformed data: stopNumber'),
  // optional
  // estimatedDurationString: string | null
  // estimatedDuration: [number, number]
  // notes: string | null
  estimatedDurationString: yup.string()
    .nullable()
    .label('DeliveryStop malformed data: estimatedDurationString'),
  estimatedDuration: yup.tuple([yup.number().required(), yup.number().required()])
    .nullable()
    .label('DeliveryStop malformed data: estimatedDuration'),
  notes: yup.string().nullable().label('DeliveryStop malformed data: notes'),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('DeliveryStop malformed data: id'),
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('DeliveryStop malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('DeliveryStop malformed data: updatedAt'),
})

// create a copy and remove required fields for update operations.
const deliveryStopSchemaUpdate: yup.ObjectSchema<DeliveryStopUpdate> = deliveryStopSchemaCreate.clone()
  .shape({
    tripId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('DeliveryStop malformed data: tripId'),
    shippingAddressId: yup.number()
      .integer()
      .positive()
      .nullable()
      .label('DeliveryStop malformed data: shippingAddressId'),
    // required
    // stopType: StopType
    // stopNumber: number
    stopType: yup.mixed<StopType>()
      .oneOf(stopTypes)
      .nonNullable()
      .label('DeliveryStop malformed data: stopType'),
    stopNumber: yup.number()
      .integer()
      .nonNullable()
      .label('DeliveryStop malformed data: stopNumber'),
  })

export function validateDeliveryStopCreate(object: unknown): DeliveryStopCreate {
  const deliveryStop = deliveryStopSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies DeliveryStopCreate

  return deliveryStop
}

export function validateDeliveryStopUpdate(object: unknown): DeliveryStopUpdate {
  const deliveryStop = deliveryStopSchemaUpdate
    // .omit(['createdAt', 'updatedAt', 'id'])>
    .validateSync(object, {
      stripUnknown: true,
      abortEarly: false,
    }) satisfies DeliveryStopUpdate

  return deliveryStop
}

function deliveryStopToJson(deliveryStopRaw: DeliveryStop): DeliveryStopRead {
  const deliveryStopData = deliveryStopRaw.toJSON()
  const result: DeliveryStopRead = {
    ...deliveryStopData,
  }
  // if deliveries are present, use controller to convert to JSON
  if (deliveryStopRaw.deliveries) {
    result.deliveries = DeliveryController.toJSON(deliveryStopRaw.deliveries)
  }

  return result
}

export default class DeliveryStopController {
  /**
   * convert DeliveryStop Instance or array of instances to a regular JSON object.
   * @param {DeliveryStop | DeliveryStop[] | null} data - purchase order, array of purchase orders or null
   * @returns {DeliveryStopMagentoRecord | DeliveryStopMagentoRecord[] | null} JSON format nullable.
   */
  static toJSON(data: DeliveryStop): DeliveryStopRead
  static toJSON(data: DeliveryStop | null): DeliveryStopRead | null
  static toJSON(data: DeliveryStop[]): DeliveryStopRead[]
  static toJSON(data: DeliveryStop[] | null): DeliveryStopRead[] | null
  static toJSON(data: null): null
  static toJSON(data: DeliveryStop | DeliveryStop[] | null): DeliveryStopRead | DeliveryStopRead[] | null {
    try {
      if (data instanceof DeliveryStop) {
        return deliveryStopToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(deliveryStopToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get DeliveryStop record by id from DB.
   * @param {unknown} id - deliveryStopId
   * @returns {DeliveryStop} DeliveryStop object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<DeliveryStop | null> {
    const deliveryStopId = isId.validateSync(id)
    const final = await DeliveryStop.findByPk(deliveryStopId, {
      transaction: t,
    })
    return final
  }

  /**
   * get full DeliveryStop record by id from DB.
   * @param {unknown} id - deliveryStopId
   * @returns {DeliveryStop} DeliveryStop object or null
   */
  static async getFull(id: number | unknown, t?: Transaction): Promise<DeliveryStop | null> {
    const deliveryStopId = isId.validateSync(id)
    const final = await DeliveryStop.findByPk(deliveryStopId, {
      include: [
        {
          model: Delivery,
          as: 'deliveries',
        },
        {
          model: OrderAddress,
          as: 'shippingAddress',
        },
      ],
      transaction: t,
    })
    return final
  }

  /**
   * insert Delivery record to DB. orderId and orderId are required.
   * @param {DeliveryCreate | unknown} deliveryStopData -  Delivery record to insert to DB
   * @returns {Delivery} Delivery object or throws error
   */
  static async create(deliveryStopData: DeliveryStopCreate | unknown, t?: Transaction): Promise<DeliveryStop> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedDeliveryStop = validateDeliveryStopCreate(deliveryStopData)

      const result = await DeliveryStop.create(parsedDeliveryStop, {
        transaction,
      })

      // refetch the record to get all fields (including virtuals)
      const final = await this.get(result.id, transaction)
      if (!final) {
        throw new Error('Internal Error: Delivery was not created')
      }
      await commit()
      return final
    } catch (error) {
      let errorMsg = ''
      if (error instanceof ForeignKeyConstraintError && error.name === 'SequelizeForeignKeyConstraintError') {
        errorMsg = `DeliveryStop malformed data: constraint violation error: ${error?.fields?.toString() || ''}`
      }
      // console.log('error', error.name)
      await rollback()
      // rethrow the error for further handling
      if (errorMsg) {
        throw Error(errorMsg)
      }
      throw error
    }
  }

  /**
   * insert multiple deliveryStop records to DB. tripId is required.
   * @param {number} tripId - id of trip where to add the delivery Stops
   * @param {DeliveryStopCreate[] | unknown[]} deliveryStops - an array of deliveryStops to insert to DB
   * @returns {DeliveryStop[]} array of created deliveryStops or throws error
   */
  static async bulkCreate(tripId: number, deliveryStops: DeliveryStopCreate[] | unknown[], t?: Transaction): Promise<DeliveryStop[]> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const result: DeliveryStop[] = []
      for (let i = 0; i < deliveryStops.length; i += 1) {
        const item = deliveryStops[i]
        if (typeof item !== 'object' || item === null) {
          throw new Error('DeliveryStop malformed data: every item should be an object')
        }
        // create method will take care of all validations:
        const deliveryStop = await this.create({
          ...item,
          tripId,
        }, transaction)
        result.push(deliveryStop)
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
   * update DeliveryStop record in DB.
   * @param {number | unknown} deliveryStopId - id of the DeliveryStop record to update in DB
   * @param {DeliveryStopUpdate | unknown} deliveryStopData - update data for DeliveryStop record
   * @returns {DeliveryStop} DeliveryStop object or throws not found error
   */
  static async update(deliveryStopId: number | unknown, deliveryStopData: DeliveryStopUpdate | unknown, t?: Transaction): Promise<DeliveryStop> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedDeliveryStop = validateDeliveryStopUpdate(deliveryStopData)

      const id = isId.validateSync(deliveryStopId)

      const deliveryStop = await DeliveryStop.findByPk(id, {
        transaction,
      })
      if (!deliveryStop) {
        throw DBError.notFound(new Error(`DeliveryStop with id ${id} was not found`))
      }

      const result = await deliveryStop.update(parsedDeliveryStop, {
        transaction,
      })

      // refetch the record to get all fields (including virtuals)
      const final = await this.get(result.id, transaction)
      if (!final) {
        throw new Error('Internal Error: DeliveryStop was not updated')
      }
      await commit()
      return final
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete DeliveryStop record with a given id from DB.
   * @param {unknown} id - deliveryStopId
   * @returns {DeliveryStop} DeliveryStop object that was deleted or throws error.
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<DeliveryStop> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const deliveryStopId = isId.validateSync(id)
      const deliveryStop = await DeliveryStop.findByPk(deliveryStopId, { transaction })
      if (!deliveryStop) {
        throw DBError.notFound(new Error(`DeliveryStop with id ${deliveryStopId} was not found`))
      }

      await deliveryStop.destroy({ transaction })

      await commit()
      return deliveryStop
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
