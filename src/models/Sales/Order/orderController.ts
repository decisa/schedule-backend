import * as yup from 'yup'
import { Transaction } from 'sequelize'
import { OrderStatus, orderStatuses, MagentoOrder } from '../MagentoOrder/magentoOrder'
import { Order } from './order'
import { isId, useTransaction, isString } from '../../../utils/utils'
import { OrderAddress } from '../OrderAddress/orderAddress'
import { OrderComment, OrderCommentCreate } from '../OrderComment/orderComment'
import { Customer } from '../Customer/customer'
import { MagentoCustomer } from '../MagentoCustomer/magentoCustomer'
import { ProductConfiguration } from '../ProductConfiguration/productConfiguration'
import { Product } from '../Product/product'
import { ProductOption } from '../ProductOption/productOption'
import ProductConfigurationController, { ConfigurationAsProductRead, productConfigurationSchemaCreate } from '../ProductConfiguration/productConfigurationController'
import { OrderCommentMagentoCreate, commentSchemaCreate } from '../OrderComment/orderCommentController'
import { CustomerCreate, customerSchemaCreate } from '../Customer/customerController'
import { OrderAddressCreate, orderAddressSchemaCreate } from '../OrderAddress/orderAddressContoller'

type OrderCreational = {
  id: number
}

// street1 is required but will be Ordered later
type OrderRequired = {
  orderNumber: string
  orderDate: Date // default now
  shippingCost: number // default 0
  taxRate: number // default 0
}

type OrderOptional = {
  paymentMethod: string | null
}

type OrderTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type OrderFK = {
  customerId: number
  shippingAddressId: number | null
  billingAddressId: number | null
}

// FIXME: add new type for OrderState
type OrderMagentoRecord = {
  externalId: number
  externalQuoteId: number
  state: string
  status: OrderStatus
  updatedAt: Date
  orderId?: number
}

type OrderAssociations = {
  magento: OrderMagentoRecord,
  customer?: CustomerCreate,
  addresses?: OrderAddressCreate[],
  comments?: OrderCommentCreate[],
  billingAddress?: OrderAddressCreate,
  shippingAddress?: OrderAddressCreate,
  products?: ConfigurationAsProductRead,
  // orderAvailabilities?: Association<Order, OrderAvailability>,
}

// Note: DATA TYPES
export type OrderCreate =
  Partial<OrderCreational>
  & Required<OrderRequired>
  & Partial<OrderOptional>
  & Partial<OrderTimeStamps>

export type FullOrder = OrderCreate & Partial<OrderAssociations>

export type OrderRead = Required<OrderCreate> & OrderFK

export type OrderMagentoRead = OrderRead & {
  magento?: Omit<OrderMagentoRecord, 'orderId'>
}

const orderMagentoSchema: yup.ObjectSchema<OrderMagentoRecord> = yup.object({
  // externalId: number
  // externalQuoteId: number
  // state: string
  // status: OrderStatus
  // updatedAt: Date
  // orderId?: number
  externalId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: magento > externalId'),
  externalQuoteId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: magento > externalQuoteId'),
  state: yup.string()
    .label('Malformed data: magento > state')
    .nonNullable()
    .required(),
  status: yup.mixed<OrderStatus>()
    .oneOf(orderStatuses)
    .label('Malformed data: magento > status')
    .nonNullable()
    .required(),
  updatedAt: yup.date()
    .nonNullable()
    .required()
    .label('Malformed data: magento > updatedAt'),
  orderId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: magento > orderId'),
})

const orderMagentoUpdateSchema: yup.ObjectSchema<Partial<Omit<OrderMagentoRecord, 'orderId'>>> = yup.object({
  // externalId: number
  // externalQuoteId: number
  // state: string
  // status: OrderStatus
  // updatedAt: Date
  externalId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: magento > externalId'),
  externalQuoteId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: magento > externalQuoteId'),
  state: yup.string()
    .label('Malformed data: magento > state')
    .nonNullable(),
  status: yup.mixed<OrderStatus>()
    .oneOf(orderStatuses)
    .label('Malformed data: magento > status')
    .nonNullable(),
  updatedAt: yup.date()
    .nonNullable()
    .label('Malformed data: magento > updatedAt'),
})

// when data is sent to DB, all virtual fields like street[] and coordinates, should be converted
// to their respective street1 & street2 and latitude & longitude
const orderSchemaCreate: yup.ObjectSchema<OrderCreate> = yup.object({
  // OrderFK
  // customerId: number
  // shippingAddressId: number | null
  // billingAddressId: number | null
  customerId: yup.number()
    .integer()
    .positive()
    .required()
    .label('Malformed data: customerId'),
  shippingAddressId: yup.number()
    .integer()
    .positive()
    .default(null)
    .nullable()
    .label('Malformed data: shippingAddressId'),
  billingAddressId: yup.number()
    .integer()
    .positive()
    .default(null)
    .nullable()
    .label('Malformed data: billingAddressId'),
  // Order required
  // orderNumber: string
  // orderDate: Date
  orderNumber: yup.string()
    .nonNullable()
    .required()
    .label('Malformed data: orderNumber'),
  orderDate: yup.date()
    .nonNullable()
    .default(new Date())
    .required()
    .label('Malformed data: orderDate'),
  // Order Optional
  // shippingCost: number // default 0
  // paymentMethod: string | null
  // taxRate: number // default 0
  paymentMethod: yup.string()
    .nullable()
    .label('Malformed data: paymentMethod'),
  shippingCost: yup.number()
    .default(0)
    .min(0)
    .label('Malformed data: shippingCost'),
  taxRate: yup.number()
    .default(0)
    .min(0)
    .label('Malformed data: taxRate'),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: id'),
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('Malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Malformed data: updatedAt'),
})

const orderSchemaUpdate = orderSchemaCreate.clone().shape({
  customerId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: customerId'),
  shippingAddressId: yup.number()
    .integer()
    .positive()
    .nullable()
    .label('Malformed data: shippingAddressId'),
  billingAddressId: yup.number()
    .integer()
    .positive()
    .nullable()
    .label('Malformed data: billingAddressId'),
  orderNumber: yup.string()
    .nonNullable()
    .label('Malformed data: orderNumber'),
  orderDate: yup.date()
    .nonNullable()
    .label('Malformed data: orderDate'),
  shippingCost: yup.number()
    .min(0)
    .label('Malformed data: shippingCost'),
  taxRate: yup.number()
    .min(0)
    .label('Malformed data: taxRate'),
})

const fullOrderSchemaCreate: yup.ObjectSchema<FullOrder> = orderSchemaCreate.clone().shape({
  magento: orderMagentoSchema,
  customer: customerSchemaCreate,
  addresses: yup.array().of(orderAddressSchemaCreate),
  comments: yup.array().of(commentSchemaCreate),
  billingAddress: orderAddressSchemaCreate,
  shippingAddress: orderAddressSchemaCreate,
  products: yup.array().of(productConfigurationSchemaCreate),

})

export function validateOrderCreate(object: unknown): OrderCreate {
  const order = orderSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies OrderCreate

  return order
}

export function validateOrderUpdate(object: unknown): Partial<OrderCreate> {
  // restrict update of id, and creation or modification dates
  const order = orderSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<OrderCreate>

  return order
}

export function validateOrderMagento(object: unknown): OrderMagentoRecord {
  const magento = orderMagentoSchema.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies OrderMagentoRecord
  return magento
}

export function validateOrderMagentoUpdate(object: unknown): Partial<Omit<OrderMagentoRecord, 'orderId'>> {
  const magento = orderMagentoUpdateSchema.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<Omit<OrderMagentoRecord, 'orderId'>>
  return magento
}

function orderToJson(order: Order): OrderMagentoRead {
  let magento: OrderMagentoRecord | undefined
  if (order.magento && order.magento instanceof MagentoOrder) {
    magento = order.magento.toJSON()
    delete magento.orderId
  }
  let products: ConfigurationAsProductRead[] | undefined
  if (order.products) {
    products = ProductConfigurationController.toJsonAsProduct(order.products)
  }
  const orderData = order.toJSON()
  const result = {
    ...orderData,
    products,
    magento,
  }

  return result
}

export default class OrderController {
  /**
   * convert Order Instance or array of instances to a regular JSON object.
   * @param {Order | Order[] | null} data - configuration, array of configurations or null
   * @returns {OrderMagentoRecord | OrderMagentoRecord[] | null} JSON format nullable.
   */
  static toJSON(data: Order): OrderMagentoRead
  static toJSON(data: Order | null): OrderMagentoRead | null
  static toJSON(data: Order[]): OrderMagentoRead[]
  static toJSON(data: Order[] | null): OrderMagentoRead[] | null
  static toJSON(data: null): null
  static toJSON(data: Order | Order[] | null): OrderMagentoRead | OrderMagentoRead[] | null {
    try {
      if (data instanceof Order) {
        return orderToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(orderToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get Order record by id from DB. Will include ???
   * @param {unknown} id - orderId
   * @returns {Order} ProductConfiguration object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Order | null> {
    const orderId = isId.validateSync(id)
    const final = await Order.findByPk(orderId, {
      include: [{
        association: 'magento',
      }],
      transaction: t,
    })
    return final
  }

  /**
   * get full Order data by id from DB. Will include ???
   * @param {unknown} id - orderId
   * @returns {Order} Order object with all relevant data, like billing, shipping addresses, products etc. or null
   */
  static async getFullOrderInfo(id: number | unknown, t?: Transaction): Promise<Order | null> {
    const orderId = isId.validateSync(id)
    const order = await Order.findOne({
      where: {
        id: orderId,
      },
      include: [{
        model: OrderAddress,
        as: 'billingAddress',
        include: [
          {
            association: 'magento',
            attributes: {
              exclude: ['orderAddressId'],
            },
          },

        ],
        attributes: {
          exclude: ['orderId', 'customerAddressId'],
        },
      },
      {
        model: OrderAddress,
        as: 'shippingAddress',
        include: [
          {
            association: 'magento',
            attributes: {
              exclude: ['orderAddressId'],
            },
          },

        ],
        attributes: {
          exclude: ['orderId', 'customerAddressId'],
        },
      },
      {
        model: OrderComment,
        as: 'comments',
        attributes: {
          exclude: ['orderId'],
        },
      },
      {
        model: MagentoOrder,
        as: 'magento',
        attributes: {
          exclude: ['orderId'],
        },
      },
      {
        model: Customer,
        as: 'customer',
        include: [{
          model: MagentoCustomer,
          as: 'magento',
        }],
        attributes: {
          exclude: ['defaultShippingId'],
        },
      },
      {
        model: ProductConfiguration,
        as: 'products',
        attributes: {
          exclude: ['productId', 'orderId'],
        },
        include: [{
          model: Product,
          as: 'product',
          attributes: {
            exclude: ['brandId'],
          },
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
      }],
      attributes: {
        exclude: [
          'billingAddressId',
          'shippingAddressId',
        ],
      },
      order: [
        [
          { model: ProductConfiguration, as: 'products' },
          { model: ProductOption, as: 'options' },
          'sortOrder', 'ASC',
        ],
        [
          { model: OrderComment, as: 'comments' },
          'createdAt', 'DESC',
        ],
      ],
    })
    return order
  }

  /**
   * get order by order number.
   * @param {string | unknown} orderNumber - order number
   * @returns {ProductConfiguration | ProductConfiguration[] | null} ProductConfiguration object, array of objects or null
   */
  static async getByOrderNumber(orderNum: string | unknown, t?: Transaction): Promise<Order | null> {
    const orderNumber = isString.validateSync(orderNum)
    const orderRecord = await Order.findOne({
      where: {
        orderNumber,
      },
      include: [{
        association: 'magento',
      }],
      transaction: t,
    })
    if (!orderRecord) {
      return null
    }
    return this.getFullOrderInfo(orderRecord.id, t)
  }

  /**
   * insert Order record to DB. productId and orderId are required. Will include magento record if provided.
   * FK addressId will be ignored on magento record and generated automatically.
   * @param {OrderCreate | unknown} orderData - customer Order record to insert to DB
   * @returns {Order} Order object or throws error
   */
  static async create(orderData: OrderCreate | unknown, t?: Transaction): Promise<Order> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      let magento: OrderMagentoRecord | undefined
      if (orderData && typeof orderData === 'object' && 'magento' in orderData) {
        magento = validateOrderMagento(orderData.magento)
      }
      const parsedOrder = validateOrderCreate(orderData)

      const result = await Order.create(parsedOrder, {
        transaction,
      })

      if (magento) {
        result.magento = await result.createMagento(magento, { transaction })
      }

      const final = await this.get(result.id, transaction)
      if (!final) {
        throw new Error('Internal Error: Order was not created')
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
     * update order record in DB. Will update magento record if provided.If magento record does not exist in DB, it will be created
     * @param {number | unknown} orderId - id of the order record to update in DB
     * @param {unknown} orderData - update data for address record
     * @returns {address} complete Updated address object or throws error
     */
  static async update(orderId: number | unknown, orderData: unknown, t?: Transaction): Promise<Order> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      let magento: Partial<OrderMagentoRecord> | undefined
      if (orderData && typeof orderData === 'object' && 'magento' in orderData) {
        magento = validateOrderMagentoUpdate(orderData.magento)
      }
      const parsedOrderUpdate = validateOrderUpdate(orderData)

      const id = isId.validateSync(orderId)
      const orderRecord = await Order.findByPk(id, { include: 'magento', transaction })
      if (!orderRecord) {
        throw new Error('order does not exist')
      }

      await orderRecord.update(parsedOrderUpdate, { transaction })

      if (magento) {
        if (orderRecord.magento) {
          await orderRecord.magento.update(magento, { transaction })
        } else {
          orderRecord.magento = await this.createMagento(orderRecord.id, magento, transaction)
        }
      }
      await commit()
      return orderRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * create Magento order record for the given ID.
   * @param {number | unknown} orderId id of the address that needs magento data inserted
   * @param {OrderMagentoRecord | unknown} orderMagentoData magento record to add
   * @returns {MagentoOrder} MagentoOrder instance that was created
   */
  static async createMagento(orderId: number | unknown, orderMagentoData: OrderMagentoRecord | unknown, t?: Transaction): Promise<MagentoOrder> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const magento = validateOrderMagento(orderMagentoData)
      const id = isId.validateSync(orderId)
      magento.orderId = id
      const record = await MagentoOrder.create(magento, { transaction })
      await commit()
      return record
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete corresponding order Magento record with a given orderId from DB.
   * @param {number | unknown} orderId - orderAddressId to delete
   * @returns {OrderMagentoRecord | null} AddressMagentoRecord that was deleted or null if record did not exist.
   */
  static async deleteMagento(orderId: number | unknown, t?: Transaction): Promise<OrderMagentoRecord | null> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const id = isId.validateSync(orderId)
      const record = await this.get(id, transaction)
      let magento: OrderMagentoRecord | null = null

      if (record && record.magento) {
        magento = record.magento.toJSON()
        await record.magento.destroy({ transaction })
      }
      await commit()
      return magento
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * upsert(insert or create) order record in DB. magento externalId is required
   * @param {unknown} orderData - update/create data for productConfiguration record
   * @returns {productConfiguration} updated or created productConfiguration object with Brand Record if available
   */
  static async upsert(orderData: unknown, t?: Transaction): Promise<Order> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      let magento: OrderMagentoRecord | undefined
      if (orderData && typeof orderData === 'object' && 'magento' in orderData) {
        magento = validateOrderMagento(orderData.magento)
      }
      if (!magento) {
        throw new Error('Magento record is required for upsert')
      }
      const orderRecord = await Order.findOne({
        include: [{
          association: 'magento',
          where: {
            externalId: magento.externalId,
          },
        }],
        transaction,
      })

      let result: Order
      if (!orderRecord) {
        result = await this.create(orderData, transaction)
      } else {
        result = await this.update(orderRecord.id, orderData, transaction)
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
   * delete Order record with a given id from DB.
   * @param {unknown} id - orderId
   * @returns {boolean} true if configuration was deleted
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const orderId = isId.validateSync(id)
      // delete all configuration options first:
      // await OrderController.deleteConfigurationOptions(id, transaction)
      // then delete the configuration itself
      const final = await Order.destroy({
        where: {
          id: orderId,
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

  /**
   * upsert(insert or create) order record in DB. magento externalId is required
   * @param {unknown} orderData - update/create data for productConfiguration record
   * @returns {productConfiguration} updated or created productConfiguration object with Brand Record if available
   */
  static async importMagentoOrder(orderData: unknown, t?: Transaction): Promise<Order> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      let magento: OrderMagentoRecord | undefined
      if (orderData && typeof orderData === 'object' && 'magento' in orderData) {
        magento = validateOrderMagento(orderData.magento)
      }
      if (!magento) {
        throw new Error('Magento record is required for upsert')
      }
      const orderRecord = await Order.findOne({
        include: [{
          association: 'magento',
          where: {
            externalId: magento.externalId,
          },
        }],
        transaction,
      })

      let result: Order
      if (!orderRecord) {
        result = await this.create(orderData, transaction)
      } else {
        result = await this.update(orderRecord.id, orderData, transaction)
      }

      await commit()
      return result
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}

// todo: review toJSON to incljude all associations
// done: toJSON
// done: get order (by id)
// done: create order
// done: update order
// done: delete order
// done: upsert order (magento record is required)
// done: create magento
// done: delete magento
