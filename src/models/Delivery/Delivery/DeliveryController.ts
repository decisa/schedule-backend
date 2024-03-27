import * as yup from 'yup'
import { ForeignKeyConstraintError, Transaction } from 'sequelize'
// import { de } from 'date-fns/locale'
import { Delivery, MinutesInterval, daysToNumber } from './Delivery'
import { isId, printYellowLine, useTransaction } from '../../../utils/utils'
import OrderController, { FullOrder, OrderRead } from '../../Sales/Order/orderController'
import OrderAddressController, { OrderAddressMagentoRead } from '../../Sales/OrderAddress/orderAddressContoller'
import DeliveryItemController, { DeliveryItemRead } from '../DeliveryItem/DeliveryItemController'
import { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'
import { ProductOption } from '../../Sales/ProductOption/productOption'
import { DeliveryItem } from '../DeliveryItem/DeliveryItem'
import { DBError } from '../../../ErrorManagement/errors'
import DeliveryMethodController, { DeliveryMethodRead } from '../../Sales/DeliveryMethod/deliveryMethodController'
import { ProductSummaryView } from '../../../views/ProductSummary/productSummary'
import { Product } from '../../Sales/Product/product'

// TODO: allow to update and create delivery, when availability is nested, same like when reading json. ie. update validateDeliveryCreate and validateDeliveryUpdate

export const deliveryStatuses = ['pending', 'scheduled', 'confirmed'] as const
export type DeliveryStatus = typeof deliveryStatuses[number]

type DeliveryCreational = {
  id: number
}

type DeliveryRequired = {
  status: DeliveryStatus
  title: string
  coiRequired: boolean // in required, because has default value
  coiReceived: boolean // in required, because has default value
  daysAvailability: number // 7-bit integer (0-127) representing days of the week Sunday-Saturday. default 127
  startTime: number // (in minutes) in required, because has default value
  endTime: number // (in minutes) in required, because has default value
}

type DeliveryOptional = {
  estimatedDurationString?: string | null
  estimatedDuration?: MinutesInterval | null
  notes: string | null
  coiNotes: string | null
  amountDue: string | null
  days:[boolean, boolean, boolean, boolean, boolean, boolean, boolean] // virtual

  timePeriod?: MinutesInterval // virtual
}

type DeliveryTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type DeliveryFK = {
  orderId: number
  shippingAddressId: number
  deliveryStopId: number | null
  deliveryMethodId: number
}

type DeliveryAssociations = {
  order: OrderRead
  shippingAddress: OrderAddressMagentoRead
  // deliveryStop: DeliveryStopRead
  items: DeliveryItemRead[]
  deliveryMethod: DeliveryMethodRead
}

// Note: DATA TYPES
export type DeliveryCreate =
  Partial<DeliveryCreational>
  & Required<DeliveryRequired>
  & Partial<DeliveryOptional>
  & Partial<DeliveryTimeStamps>
  & Required<DeliveryFK>
  // & Partial<DeliveryAssociations>

export type DeliveryUpdate = Partial<DeliveryCreate>

export type DeliveryRead = Omit<Required<DeliveryCreate>, 'estimatedDurationString' | 'startTime' | 'endTime' | 'daysAvailability' | 'days' | 'timePeriod'> & {
  // items?: DeliveryItem[],
  estimatedDuration: MinutesInterval | null,
  availability: {
    days: [boolean, boolean, boolean, boolean, boolean, boolean, boolean],
    timePeriod: MinutesInterval,
  }
  // timePeriod: Period,
} & Partial<DeliveryAssociations>

const validateTupleString = (value: string) => {
  const split = value.split(',')
  if (split.length !== 2) {
    throw new Error('Should be a tuple of 2 numbers')
  }
  const [min, max] = split.map((x) => parseInt(x, 10))
  if (Number.isNaN(min) || Number.isNaN(max) || min === undefined || max === undefined) {
    throw new Error('Should be a tuple of 2 numbers')
  }
  return true
}

const deliverySchemaCreate: yup.ObjectSchema<DeliveryCreate> = yup.object({
  // FK
  // orderId: number
  // shippingAddressId: number
  // deliveryStopId: number | null
  orderId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Delivery malformed data: orderId'),
  shippingAddressId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Delivery malformed data: shippingAddressId'),
  deliveryStopId: yup.number()
    .integer()
    .positive()
    .nullable()
    .default(null)
    .label('Delivery malformed data: deliveryStopId'),
  deliveryMethodId: yup.number()
    .integer()
    .positive()
    .required()
    .label('Delivery malformed data: deliveryMethodId'),
  // required
  // status: DeliveryStatus
  // title: string
  status: yup.mixed<DeliveryStatus>()
    .oneOf(deliveryStatuses)
    .nonNullable()
    .default('pending')
    .required()
    .label('Malformed data: status'),
  title: yup.string()
    .default('')
    .defined()
    .label('Delivery malformed data: title'),
  // optional
  // estimatedDurationString: string | null
  // estimatedDuration?: [number, number] | null
  // notes: string | null
  estimatedDurationString: yup.string()
    .nullable()
    .label('Delivery malformed data: estimatedDurationString'),
  estimatedDuration: yup.object({
    start: yup.number()
      .integer()
      .min(0)
      .default(30)
      .nonNullable()
      .required(),
    end: yup.number()
      .integer()
      .min(0)
      .default(60)
      .nonNullable()
      .required(),
  })
    .nullable()
    .label('Delivery malformed data: estimatedDuration'),
  notes: yup.string().nullable().label('Delivery malformed data: notes'),
  // new optional fields
  // coiRequired: boolean
  // coiReceived: boolean
  // coiNotes: string | null
  // amountDue: string | null
  // daysAvailability: number // 7-bit integer (0-127) representing days of the week Sunday-Saturday
  // days:[boolean, boolean, boolean, boolean, boolean, boolean, boolean] // virtual
  // startTime: number // in minutes
  // endTime: number // in minutes
  // timePeriod: [number, number] // virtual
  coiRequired: yup.boolean()
    .default(false)
    .nonNullable()
    .required()
    .label('Delivery malformed data: coiRequired'),
  coiReceived: yup.boolean()
    .default(false)
    .nonNullable()
    .label('Delivery malformed data: coiReceived'),
  coiNotes: yup.string()
    .nullable()
    .label('Delivery malformed data: coiNotes'),
  amountDue: yup.string()
    .nullable()
    .label('Delivery malformed data: amountDue'),
  daysAvailability: yup.number()
    .integer()
    .min(0)
    .max(127)
    .default(127)
    .nonNullable()
    .label('Delivery malformed data: daysAvailability'),
  days: yup.tuple([
    yup.boolean().default(true).label('Sunday'),
    yup.boolean().default(true).label('Monday'),
    yup.boolean().default(true).label('Tuesday'),
    yup.boolean().default(true).label('Wednesday'),
    yup.boolean().default(true).label('Thursday'),
    yup.boolean().default(true).label('Friday'),
    yup.boolean().default(true).label('Saturday'),
  ])
    .nonNullable()
    .label('Delivery malformed data: days'),
  startTime: yup.number()
    .integer()
    .min(0)
    .max(1440)
    .default(420)
    .nonNullable()
    .label('Delivery malformed data: startTime'),
  endTime: yup.number()
    .integer()
    .min(0)
    .max(1440)
    .default(1080)
    .nonNullable()
    .label('Delivery malformed data: endTime'),
  timePeriod: yup.object({
    start: yup.number()
      .integer()
      .min(0)
      .max(1440)
      .default(420)
      .nonNullable()
      .required(),
    end: yup.number()
      .integer()
      .min(0)
      .max(1440)
      .default(1080)
      .nonNullable()
      .required(),
  })
    .default({ start: 420, end: 1080 })
    .nonNullable()
    .required()
    .label('Delivery malformed data: timePeriod'),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Delivery malformed data: id'),
  // timestamps
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('Delivery malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Delivery malformed data: updatedAt'),
})

const periodSchema: yup.ObjectSchema<MinutesInterval> = yup.object({
  start: yup.number()
    .integer()
    .min(0)
    .max(1440)
    .nonNullable()
    .required(),
  end: yup.number()
    .integer()
    .min(0)
    .max(1440)
    .nonNullable()
    .required(),
})

// create a copy and remove required fields for update operations.
const deliverySchemaUpdate: yup.ObjectSchema<Omit<DeliveryUpdate, 'timePeriod'>> = deliverySchemaCreate.clone()
  .omit(['timePeriod'])
  .shape({
    orderId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Delivery malformed data: orderId'),
    shippingAddressId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Delivery malformed data: shippingAddressId'),
    deliveryMethodId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Delivery malformed data: deliveryMethodId'),
    status: yup.mixed<DeliveryStatus>()
      .oneOf(deliveryStatuses)
      .nonNullable()
      .label('Malformed data: status'),
    coiRequired: yup.boolean()
      .nonNullable()
      .label('Delivery malformed data: coiRequired'),
    coiReceived: yup.boolean()
      .nonNullable()
      .label('Delivery malformed data: coiReceived'),
    startTime: yup.number()
      .integer()
      .min(0)
      .max(1440)
      .nonNullable()
      .label('Delivery malformed data: startTime'),
    endTime: yup.number()
      .integer()
      .min(0)
      .max(1440)
      .nonNullable()
      .label('Delivery malformed data: endTime'),
    daysAvailability: yup.number()
      .integer()
      .min(0)
      .max(127)
      .nonNullable()
      .label('Delivery malformed data: daysAvailability'),
    deliveryStopId: yup.number()
      .integer()
      .positive()
      .nullable()
      .label('Delivery malformed data: deliveryStopId'),

  })

export function validateDeliveryCreate(object: unknown): Omit<DeliveryCreate, 'estimatedDuration' | 'estimatedDurationString'> & {
  estimatedDurationString: string | null
} {
  const delivery = deliverySchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies DeliveryCreate

  // if virtual field estimatedDuration was provided, combine it into a single string
  if (delivery.estimatedDuration) {
    const { start, end } = delivery.estimatedDuration
    delivery.estimatedDurationString = `${start},${end}`
    delete delivery.estimatedDuration
  }

  // check validity of the estimatedDurationString:
  if (delivery.estimatedDurationString) {
    try {
      validateTupleString(delivery.estimatedDurationString)
    } catch (error) {
      throw new Error('Delivery malformed data: estimatedDurationString should be a tuple of 2 numbers')
    }
  }

  const result = {
    ...delivery,
    estimatedDurationString: delivery.estimatedDurationString || null,
  }
  return result
}

export function validateDeliveryUpdate(object: unknown): Omit<Partial<DeliveryCreate>, 'estimatedDuration' | 'timePeriod' | 'days'> {
  printYellowLine()
  console.log('received object to check', object)
  const delivery = deliverySchemaUpdate
    .omit(['createdAt', 'updatedAt', 'id'])
    .validateSync(object, {
      stripUnknown: true,
      abortEarly: false,
    }) satisfies Partial<DeliveryCreate>
  console.log('parsed delivery update:', delivery)
  // note: take care of virtual field timePeriod and related fields startTime and endTime
  // if timePeriod was provided, extract it separately and use it as source of truth:
  if (object && typeof object === 'object' && 'timePeriod' in object && object.timePeriod) {
    const timePeriod = periodSchema.validateSync(object.timePeriod, {
      stripUnknown: true,
      abortEarly: false,
    }) satisfies MinutesInterval
    delivery.startTime = timePeriod.start
    delivery.endTime = timePeriod.end
  }

  console.log('checking !! startTime', delivery.startTime, 'endTime', delivery.endTime)
  // check if any of startTime or endTime were provided
  if ((delivery.startTime !== undefined) || (delivery.endTime !== undefined)) {
    // if only one was provided, then throw error
    if ((delivery.startTime === undefined) || (delivery.endTime === undefined)) {
      throw new Error('Delivery malformed data: startTime and endTime should be provided together')
    }
  }

  // check if startTime < endTime
  if (delivery.startTime && delivery.endTime && delivery.startTime > delivery.endTime) {
    console.log('fixing the end time: startTime >= endTime')
    delivery.endTime = delivery.startTime
  }

  // note: take care of virtual field estimatedDuration and its related field estimatedDurationString
  // check if estimatedDuration was provided. if provided, then use it as a source of truth, convert to estimatedDurationString and delete the virtual field estimatedDuration
  if (delivery.estimatedDuration) {
    const { start, end } = delivery.estimatedDuration
    delivery.estimatedDurationString = `${start},${end}`
    delete delivery.estimatedDuration
  }
  // check for null
  if (delivery.estimatedDuration === null) {
    delivery.estimatedDurationString = null
    delete delivery.estimatedDuration
  }

  // check validity of the estimatedDurationString:
  if (delivery.estimatedDurationString) {
    try {
      validateTupleString(delivery.estimatedDurationString)
    } catch (error) {
      throw new Error('Delivery malformed data: estimatedDurationString should be a tuple of 2 numbers')
    }
  }

  // note: take care of virtual field days and its related field daysAvailability
  // if days were provided, convert them to daysAvailability and delete the virtual field days
  if (delivery.days) {
    console.log('days were provided', delivery.days)
    delivery.daysAvailability = daysToNumber(delivery.days)
    delete delivery.days
  }

  return delivery
}

function deliveryToJson(deliveryRaw: Delivery): DeliveryRead {
  // remove backend fields from JSON and keep only their virtual frontend counterparts in deliveryData
  const {
    estimatedDurationString, startTime, endTime, daysAvailability, days, timePeriod, ...deliveryData
  } = deliveryRaw.toJSON()
  const result: DeliveryRead = {
    ...deliveryData,
    availability: {
      days,
      timePeriod,
    },
  }
  // if address record is present in model instance, convert it to JSON using proper controller
  // let shippingAddress: OrderAddressMagentoRead | null = null
  if (deliveryRaw.shippingAddress) {
    result.shippingAddress = OrderAddressController.toJSON(deliveryRaw.shippingAddress)
  }

  // if order record is present in model instance, convert it to JSON using proper controller
  if (deliveryRaw.order) {
    result.order = OrderController.toJSON(deliveryRaw.order)
  }

  // if items are present in model instance, convert it to JSON using proper controller
  if (deliveryRaw.items) {
    result.items = DeliveryItemController.toJSON(deliveryRaw.items)
  }

  return result
}

type DeliverySearchResult = {
  items: Delivery[]
  count: number
  limit: number
}

type EditFormDataResult = {
  delivery: DeliveryRead
  order: FullOrder
  addresses: OrderAddressMagentoRead[]
  deliveryMethods: DeliveryMethodRead[]
}
export default class DeliveryController {
  /**
   * convert Delivery Instance or array of instances to a regular JSON object.
   * @param {Delivery | Delivery[] | null} data - purchase order, array of purchase orders or null
   * @returns {DeliveryMagentoRecord | DeliveryMagentoRecord[] | null} JSON format nullable.
   */
  static toJSON(data: Delivery): DeliveryRead
  static toJSON(data: Delivery | null): DeliveryRead | null
  static toJSON(data: Delivery[]): DeliveryRead[]
  static toJSON(data: Delivery[] | null): DeliveryRead[] | null
  static toJSON(data: null): null
  static toJSON(data: Delivery | Delivery[] | null): DeliveryRead | DeliveryRead[] | null {
    try {
      if (data instanceof Delivery) {
        return deliveryToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(deliveryToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get Delivery record by id from DB.
   * @param {unknown} id - deliveryId
   * @returns {Delivery} Delivery object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Delivery | null> {
    const deliveryId = isId.validateSync(id)
    const final = await Delivery.findByPk(deliveryId, {
      include: [
        {
          association: 'order',
        },
        {
          association: 'shippingAddress',
        },
        {
          association: 'deliveryStop',
        },
        {
          association: 'deliveryMethod',
        },
        {
          association: 'items',
          include: [
            {
              model: ProductConfiguration,
              as: 'product',
              attributes: {
                exclude: ['productId'],
              },
              include: [
                {
                  model: ProductSummaryView,
                  as: 'summary',
                },
                {
                  model: Product,
                  as: 'product',
                  // attributes: {
                  //   exclude: ['brandId'],
                  // },
                  include: [{
                    association: 'brand',
                  }],
                },
                {
                  model: ProductOption,
                  as: 'options',
                  attributes: {
                    exclude: ['configId'],
                  },
                // separate: true,
                // order: [
                //   ['sortOrder', 'ASC'],
                // ],
                }],
            },
          ],
        },
      ],
      order: [
        [
          { model: DeliveryItem, as: 'items' },
          { model: ProductConfiguration, as: 'product' },
          { model: ProductOption, as: 'options' },
          'sortOrder', 'ASC',
        ],
      ],
      // attributes: {
      //   exclude: ['orderId', 'shippingAddressId', 'deliveryStopId'],
      // },
      transaction: t,
    })
    return final
  }

  /**
   * get Delivery record by id from DB.
   * @param {unknown} id - deliveryId
   * @returns {EditFormDataResult} EditFormDataResult
   */
  static async getEditFormData(id: number | unknown, t?: Transaction): Promise<EditFormDataResult> {
    const deliveryId = isId.validateSync(id)
    const delivery = await this.get(deliveryId, t)
    if (!delivery) {
      throw DBError.notFound(new Error('Delivery not found'))
    }
    const order = await OrderController.getFullOrderInfo(delivery.orderId, t)
    if (!order) {
      throw DBError.notFound(new Error('Order associated with the delivery was not found'))
    }
    const orderAddresses = await OrderAddressController.getAllByOrderId(order.id, t)
    if (!orderAddresses) {
      throw DBError.notFound(new Error('Order associated with the delivery has no addresses'))
    }
    const deliveryMethods = await DeliveryMethodController.getAll(t)
    if (!deliveryMethods) {
      throw DBError.notFound(new Error('No delivery methods found'))
    }
    return {
      delivery: this.toJSON(delivery),
      order: OrderController.toJSON(order),
      addresses: OrderAddressController.toJSON(orderAddresses),
      deliveryMethods: DeliveryMethodController.toJSON(deliveryMethods),
    }
  }

  /**
   * get All Delivery records id from DB.
   * @param {unknown} id - deliveryId
   * @returns {DeliverySearchResult} Delivery Search result object
   */
  static async getAll(limit = 1000, t?: Transaction): Promise<DeliverySearchResult> {
    const final = await Delivery.findAll({
      include: [
        {
          association: 'order',
        },
        {
          association: 'shippingAddress',
        },
        {
          association: 'deliveryStop',
        },
        {
          association: 'deliveryMethod',
        },
        {
          association: 'items',
          include: [
            // {
            //   association: 'product',
            //   include: [
            //     {
            //       association: 'product',
            //       include: [{
            //         association: 'brand',
            //       }],
            //     },
            //     {
            //       model: ProductOption,
            //       as: 'options',
            //     },
            //   ],
            // },
            {
              model: ProductConfiguration,
              as: 'product',
              attributes: {
                exclude: ['productId'],
              },
              include: [
                {
                  model: ProductSummaryView,
                  as: 'summary',
                },
                {
                  model: Product,
                  as: 'product',
                  // attributes: {
                  //   exclude: ['brandId'],
                  // },
                  include: [{
                    association: 'brand',
                  }],
                },
                {
                  model: ProductOption,
                  as: 'options',
                  attributes: {
                    exclude: ['configId'],
                  },
                // separate: true,
                // order: [
                //   ['sortOrder', 'ASC'],
                // ],
                }],
            },
          ],
        },
      ],
      order: [
        [
          { model: DeliveryItem, as: 'items' },
          { model: ProductConfiguration, as: 'product' },
          { model: ProductOption, as: 'options' },
          'sortOrder', 'ASC',
        ],
      ],
      attributes: {
        exclude: ['orderId', 'shippingAddressId', 'deliveryStopId'],
      },
      limit,
      transaction: t,
    })
    // if (!final) {
    //   throw DBError.notFound(new Error('Deliveries not found'))
    // }
    return {
      items: final,
      count: final?.length || 0,
      limit,
    }
  }

  /**
   * insert Delivery record to DB. orderId is required.
   * @param {DeliveryCreate | unknown} deliveryData -  Delivery record to insert to DB
   * @returns {Delivery} Delivery object or throws error
   */
  static async create(deliveryData: DeliveryCreate | unknown, t?: Transaction): Promise<Delivery> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      // check if deliveryData is an object
      if (typeof deliveryData !== 'object' || deliveryData === null) {
        throw new Error('Delivery malformed data: data is missing or malformed')
      }
      const parsedDelivery = validateDeliveryCreate(deliveryData)

      const result = await Delivery.create(parsedDelivery, {
        transaction,
      })

      // check if delivery items were included:
      if ('items' in deliveryData && Array.isArray(deliveryData.items)) {
        // create delivery items
        const items = await DeliveryItemController.bulkCreate(result.id, deliveryData.items, transaction)
        result.items = items
      }

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
        errorMsg = `Delivery malformed data: constraint violation error: ${error?.fields?.toString() || ''}`
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
   * insert Delivery record to DB. orderId is required. will throw error if items are not provided
   * @param {DeliveryCreate | unknown} deliveryData -  Delivery record to insert to DB
   * @returns {Delivery} Delivery object or throws error
   */
  static async createWithItems(deliveryData: DeliveryCreate | unknown, t?: Transaction): Promise<Delivery> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      // check if deliveryData is an object
      if (typeof deliveryData !== 'object' || deliveryData === null) {
        throw new Error('Delivery malformed data: data is missing or malformed')
      }
      const parsedDelivery = validateDeliveryCreate(deliveryData)

      const result = await Delivery.create(parsedDelivery, {
        transaction,
      })

      // check if delivery items were not included :
      if (!('items' in deliveryData) || !Array.isArray(deliveryData.items)) {
        // create delivery items
        throw DBError.badData(new Error('Cannot create delivery without items'))
      }
      // const items = await DeliveryItemController.bulkCreate(result.id, deliveryData.items, transaction)
      // result.items = items
      await DeliveryItemController.bulkCreate(result.id, deliveryData.items, transaction)

      // refetch the record to get all fields (including virtuals)
      const final = await this.get(result.id, transaction)
      if (!final) {
        throw DBError.unknown(new Error('Internal Error: Delivery was not created'))
      }

      // now that we have all detailed data, check if any delivery items don't belong to an order
      // and delete them if they don't
      console.log('searching for items to delete, order = ', final?.order?.id)
      const itemsToDelete = final?.items?.filter((item) => item.product?.orderId !== final.order?.id) || []

      console.log('itemsToDelete', itemsToDelete.map((x) => x.toJSON()))

      const deletedItemIds = new Set<number>()
      if (itemsToDelete.length > 0) {
        for (let i = 0; i < itemsToDelete.length; i += 1) {
          const itemToDelete = itemsToDelete[i]
          deletedItemIds.add(itemToDelete.id)
          await itemToDelete.destroy({ transaction })
          console.log('deleted item id = ', itemToDelete?.id)
        }
      }

      // filter out deleted items from final object
      final.items = final?.items?.filter((item) => !deletedItemIds.has(item.id)) || []

      // check if at least one item was created
      if (final.items.length === 0) {
        throw DBError.badData(new Error('Tried to creaate a Delivery without any items or all items belonged to a wrong order'))
      }

      await commit()
      return final
    } catch (error) {
      let errorMsg = ''
      if (error instanceof ForeignKeyConstraintError && error.name === 'SequelizeForeignKeyConstraintError') {
        errorMsg = `Delivery malformed data: constraint violation error: ${error?.fields?.toString() || ''}`
      }
      // console.log('error', error.name)
      await rollback()
      // rethrow the error for further handling
      if (errorMsg !== '') {
        throw DBError.badData(new Error(errorMsg))
      }
      throw error
    }
  }

  /**
     * update Delivery record in DB.
     * @param {number | unknown} deliveryId - id of the Delivery record to update in DB
     * @param {unknown} deliveryData - update data for delivery record
     * @returns {Delivery}  updated delivery object or throws error
     */
  static async update(deliveryId: number | unknown, deliveryData: unknown, t?: Transaction): Promise<Delivery> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedDeliveryUpdate = validateDeliveryUpdate(deliveryData)

      const id = isId.validateSync(deliveryId)
      const deliveryRecord = await Delivery.findByPk(id, { transaction })
      if (!deliveryRecord) {
        throw new Error('Delivery does not exist')
      }

      printYellowLine()
      console.log('parsedDeliveryUpdate', parsedDeliveryUpdate)
      await deliveryRecord.update(parsedDeliveryUpdate, { transaction })

      await commit()
      return deliveryRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete Delivery record with a given id from DB.
   * @param {unknown} id - deliveryId
   * @returns {Delivery} Delivery object that was deleted or throws not found error
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<Delivery> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const deliveryId = isId.validateSync(id)
      const deliveryRecord = await Delivery.findByPk(deliveryId, { transaction })
      if (!deliveryRecord) {
        throw DBError.notFound(new Error(`Delivery with id ${deliveryId} was not found`))
      }

      await Delivery.destroy({
        where: {
          id: deliveryId,
        },
        transaction,
      })
      await commit()
      return deliveryRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
