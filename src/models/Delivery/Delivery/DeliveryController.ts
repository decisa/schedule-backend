import * as yup from 'yup'
import { ForeignKeyConstraintError, Transaction } from 'sequelize'
import { de } from 'date-fns/locale'
import { Delivery } from './Delivery'
import { isId, useTransaction } from '../../../utils/utils'
import OrderController, { OrderRead } from '../../Sales/Order/orderController'
import OrderAddressController, { OrderAddressMagentoRead } from '../../Sales/OrderAddress/orderAddressContoller'
import DeliveryItemController, { DeliveryItemRead } from '../DeliveryItem/DeliveryItemController'
import { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'
import { ProductOption } from '../../Sales/ProductOption/productOption'
import { DeliveryItem } from '../DeliveryItem/DeliveryItem'

export const deliveryStatuses = ['pending', 'scheduled', 'confirmed'] as const
export type DeliveryStatus = typeof deliveryStatuses[number]

type DeliveryCreational = {
  id: number
}

type DeliveryRequired = {
  status: DeliveryStatus
}

type DeliveryOptional = {
  estimatedDurationString?: string | null
  estimatedDuration?: [number, number] | null
  notes: string | null
}

type DeliveryTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type DeliveryFK = {
  orderId: number
  shippingAddressId: number
  deliveryStopId: number | null
}

type DeliveryAssociations = {
  order: OrderRead
  shippingAddress: OrderAddressMagentoRead
  // deliveryStop: DeliveryStopRead
  items: DeliveryItemRead[]
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

export type DeliveryRead = Omit<Required<DeliveryCreate>, 'estimatedDurationString'> & {
  // items?: DeliveryItem[],
  estimatedDuration: [number, number] | null
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
  // required
  status: yup.mixed<DeliveryStatus>()
    .oneOf(deliveryStatuses)
    .nonNullable()
    .default('pending')
    .required()
    .label('Malformed data: status'),
  // optional
  // estimatedDurationString: string | null
  // notes: string | null
  estimatedDurationString: yup.string()
    .nullable()
    .label('Delivery malformed data: estimatedDurationString'),
  estimatedDuration: yup.tuple([yup.number().required(), yup.number().required()])
    .nullable()
    .label('Delivery malformed data: estimatedDuration'),
  notes: yup.string().nullable().label('Delivery malformed data: notes'),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Delivery malformed data: id'),
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('Delivery malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Delivery malformed data: updatedAt'),
})

// create a copy and remove required fields for update operations.
const deliverySchemaUpdate: yup.ObjectSchema<DeliveryUpdate> = deliverySchemaCreate.clone()
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
    status: yup.mixed<DeliveryStatus>()
      .oneOf(deliveryStatuses)
      .nonNullable()
      .label('Malformed data: status'),
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
    delivery.estimatedDurationString = delivery.estimatedDuration.join(',')
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

export function validateDeliveryUpdate(object: unknown): Omit<Partial<DeliveryCreate>, 'estimatedDuration'> {
  const delivery = deliverySchemaUpdate
    .omit(['createdAt', 'updatedAt', 'id'])
    .validateSync(object, {
      stripUnknown: true,
      abortEarly: false,
    }) satisfies Partial<DeliveryCreate>

  // check if estimatedDuration was provided. if provided, then use it as a source of truth, convert to estimatedDurationString and delete the virtual field estimatedDuration
  if (delivery.estimatedDuration) {
    delivery.estimatedDurationString = delivery.estimatedDuration.join(',')
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
  return delivery
}

function deliveryToJson(deliveryRaw: Delivery): DeliveryRead {
  const { estimatedDurationString, ...deliveryData } = deliveryRaw.toJSON()
  const result: DeliveryRead = {
    ...deliveryData,
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
  // delete deliveryData.estimatedDurationString
  // const result = {
  //   ...purchaseOrderData,
  //   products,
  //   magento,
  // }
  // return result

  return result
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
          association: 'items',
          include: [
            {
              association: 'product',
              include: [
                {
                  association: 'product',
                  include: [{
                    association: 'brand',
                  }],
                },
                {
                  model: ProductOption,
                  as: 'options',
                },
              ],
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
      transaction: t,
    })
    return final
  }

  // /**
  //  * get PurchaseOrder record by id from DB.
  //  * @param {unknown} id - purchaseOrderId
  //  * @returns {PurchaseOrder} PurchaseOrder object or null
  //  */
  // static async getFullPO(id: number | unknown, t?: Transaction): Promise<PurchaseOrder | null> {
  //   const purchaseOrderId = isId.validateSync(id)
  //   const final = await PurchaseOrder.findByPk(purchaseOrderId, {
  //     attributes: ['id', 'poNumber', 'dateSubmitted', 'productionWeeks', 'status', 'createdAt', 'updatedAt'],
  //     include: [
  //       {
  //         model: Brand,
  //         as: 'brand',
  //       },
  //       {
  //         model: PurchaseOrderItem,
  //         as: 'items',
  //         attributes: {
  //           exclude: ['purchaseOrderId', 'createdAt', 'updatedAt'],
  //         },
  //         include: [
  //           {
  //             model: ProductConfiguration,
  //             as: 'product',
  //             attributes: ['qtyOrdered', 'qtyRefunded', 'qtyShippedExternal', 'sku'],
  //             include: [
  //               {
  //                 model: Product,
  //                 as: 'product',
  //                 attributes: ['name', 'sku'],
  //               },
  //               {
  //                 model: ProductOption,
  //                 as: 'options',
  //                 attributes: ['label', 'value'],
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //       {
  //         model: Order,
  //         as: 'order',
  //         attributes: ['orderNumber', 'id'],
  //         include: [{
  //           model: Customer,
  //           as: 'customer',
  //           attributes: {
  //             exclude: ['defaultShippingId', 'createdAt', 'updatedAt'],
  //           },
  //         },
  //         ],
  //       },
  //     ],
  //     transaction: t,
  //   })
  //   return final
  // }

  /**
   * insert Delivery record to DB. orderId and orderId are required.
   * @param {DeliveryCreate | unknown} deliveryData -  Delivery record to insert to DB
   * @returns {Delivery} Delivery object or throws error
   */
  static async create(deliveryData: DeliveryCreate | unknown, t?: Transaction): Promise<Delivery> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedDelivery = validateDeliveryCreate(deliveryData)

      const result = await Delivery.create(parsedDelivery, {
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

  // /**
  //  * create a PurchaseOrder with PurchaseOrderItems
  //  * @param {PurchaseOrderCreate | unknown} purchaseOrderData - purchaseOrder data along with purchaseOrderItems
  //  * @returns {PurchaseOrder} PurchaseOrder object or throws error
  //  */
  // static async createPurchaseOrder(purchaseOrderData: PurchaseOrderCreate | unknown, t?: Transaction): Promise<PurchaseOrder> {
  //   const [transaction, commit, rollback] = await useTransaction(t)
  //   try {
  //     const parsedPurchaseOrder = purchaseOrderRequestCreate.validateSync(purchaseOrderData, {
  //       stripUnknown: true,
  //       abortEarly: false,
  //     }) satisfies PurchaseOrderRequest

  //     const newPurchaseOrderRecord = await PurchaseOrder.create(parsedPurchaseOrder, {
  //       transaction,
  //     })

  //     const items = await PurchaseOrderItemController.bulkCreate(newPurchaseOrderRecord.id, parsedPurchaseOrder.items, transaction)

  //     newPurchaseOrderRecord.items = items
  //     if (!newPurchaseOrderRecord) {
  //       throw new Error('Internal Error: PurchaseOrder was not created')
  //     }
  //     await commit()
  //     return newPurchaseOrderRecord
  //   } catch (error) {
  //     await rollback()
  //     // rethrow the error for further handling
  //     throw error
  //   }
  // }

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

      await deliveryRecord.update(parsedDeliveryUpdate, { transaction })

      await commit()
      return deliveryRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  // /**
  //  * upsert(insert or create) purchaseOrder record in DB. poNumber is required
  //  * @param {unknown} purchaseOrderData - update/create data for productConfiguration record
  //  * @returns {productConfiguration} updated or created productConfiguration object with Brand Record if available
  //  */
  // static async upsert(purchaseOrderData: unknown, t?: Transaction): Promise<PurchaseOrder> {
  //   const [transaction, commit, rollback] = await useTransaction(t)
  //   try {
  //     const parsedPurchaseOrder = validatePurchaseOrderCreate(purchaseOrderData)
  //     const purchaseOrderRecord = await PurchaseOrder.findOne({
  //       where: {
  //         poNumber: parsedPurchaseOrder.poNumber,
  //       },
  //       transaction,
  //     })

  //     let result: PurchaseOrder
  //     if (!purchaseOrderRecord) {
  //       result = await this.create(purchaseOrderData, transaction)
  //     } else {
  //       result = await this.update(purchaseOrderRecord.id, purchaseOrderData, transaction)
  //     }

  //     await commit()
  //     return result
  //   } catch (error) {
  //     await rollback()
  //     // rethrow the error for further handling
  //     throw error
  //   }
  // }

  /**
   * delete Delivery record with a given id from DB.
   * @param {unknown} id - deliveryId
   * @returns {boolean} true if Delivery was deleted
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const deliveryId = isId.validateSync(id)
      const final = await Delivery.destroy({
        where: {
          id: deliveryId,
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

  // static async searchPurchaseOrders(term: string, t?: Transaction) {
  //   const wildCardTerm = `%${term}%`
  //   const purchaseOrders = await PurchaseOrder.findAll({
  //     include: [
  //       {
  //         association: 'customer',
  //         attributes: ['email', 'firstName', 'lastName'],
  //       },
  //       {
  //         association: 'shippingAddress',
  //         attributes: ['firstName', 'lastName'],
  //       },
  //       {
  //         association: 'billingAddress',
  //         attributes: ['firstName', 'lastName'],
  //       },
  //       {
  //         model: ProductConfiguration,
  //         as: 'products',
  //         attributes: ['qtyPurchaseOrdered', 'qtyRefunded', 'qtyShippedExternal'],
  //         include: [
  //           {
  //             model: Product,
  //             as: 'product',
  //             attributes: ['name'],
  //             include: [
  //               {
  //                 model: Brand,
  //                 as: 'brand',
  //                 attributes: ['name'],
  //               },
  //             ],
  //           },
  //         ],

  //         // include: [
  //         //   {
  //         //     association: 'product',
  //         //     attributes: ['name'],
  //         //     include: [
  //         //       {
  //         //         association: 'brand',
  //         //         attributes: ['name'],
  //         //       },
  //         //     ],
  //         //   },
  //         // ],
  //       },
  //     ],
  //     where: {
  //       [Op.or]: [
  //         {
  //           '$customer.firstName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         {
  //           '$customer.lastName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         {
  //           '$shippingAddress.firstName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         {
  //           '$shippingAddress.lastName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         {
  //           '$billingAddress.firstName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         {
  //           '$billingAddress.lastName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         Sequelize.where(
  //           Sequelize.fn('concat', Sequelize.col('customer.firstName'), ' ', Sequelize.col('customer.lastName')),
  //           {
  //             [Op.like]: wildCardTerm,
  //           },
  //         ),
  //         Sequelize.where(
  //           Sequelize.fn('concat', Sequelize.col('billingAddress.firstName'), ' ', Sequelize.col('billingAddress.lastName')),
  //           {
  //             [Op.like]: wildCardTerm,
  //           },
  //         ),
  //         Sequelize.where(
  //           Sequelize.fn('concat', Sequelize.col('shippingAddress.firstName'), ' ', Sequelize.col('shippingAddress.lastName')),
  //           {
  //             [Op.like]: wildCardTerm,
  //           },
  //         ),
  //         {
  //           purchaseOrderNumber: {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //       ],
  //     },
  //     attributes: ['id', 'purchaseOrderNumber'],
  //     transaction: t,
  //   })
  //   return purchaseOrders.map((purchaseOrder) => this.toJSON(purchaseOrder)).filter((x) => x)
  // }
}
