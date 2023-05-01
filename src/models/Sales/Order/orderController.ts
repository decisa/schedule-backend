import { parseISO } from 'date-fns'
import { CreationAttributes, Op, Sequelize } from 'sequelize'
import { Address } from '../Address/address'
import { MagentoAddress } from '../MagentoAddress/magentoAddress'
import { Order } from './order'
import { MagentoOrder, OrderStatus } from '../MagentoOrder/magentoOrder'
import { Brand } from '../../Brand/brand'
import { Product } from '../Product/product'
import { ProductConfiguration } from '../ProductConfiguration/productConfiguration'
import { ProductOption } from '../ProductOption/productOption'
import { Customer } from '../Customer/customer'
import { MagentoCustomer } from '../MagentoCustomer/magentoCustomer'
import { MagentoOrderAddress } from '../MagentoOrderAddress/magentoOrderAddress'
import { OrderAddress } from '../OrderAddress/orderAddress'
import {
  getDate, getOrderStatus, isEmptyObject, isNotEmptyObject, parseBrandObject, parseMagentoBrand, printYellowLine,
} from '../../../utils/utils'
import OrderAddressController from '../OrderAddress/orderAddressContoller'
import { OrderComment } from '../OrderComment/orderComment'
import OrderCommentController from '../OrderComment/orderCommentController'
import { BrandShape } from '../../models'
import ProductOptionController from '../ProductOption/productOptionController'

type CustomerAddressShape = CreationAttributes<Address> & {
  magento?: CreationAttributes<MagentoAddress>
}

type CustomerShape = CreationAttributes<Customer> & {
  magento?: CreationAttributes<MagentoCustomer>
}

type OrderAddessShape = CreationAttributes<OrderAddress> & {
  magento: CreationAttributes<MagentoOrderAddress>
}

type OrderShape = CreationAttributes<Order> & {
  magento: CreationAttributes<MagentoOrder>
}

type ProductShape = CreationAttributes<Product>

type ProductConfigurationShape = CreationAttributes<ProductConfiguration>

type ProductOptionShape = CreationAttributes<ProductOption>

type OrderCommentShape = CreationAttributes<OrderComment>

type AppProduct = ProductShape & {
  brand?: BrandShape
  configuration?: Config
}

type Config = ProductConfigurationShape & {
  options?: ProductOptionShape[]
}

type OrderData = OrderShape & {
  orderDate: Date | string
  customer: CustomerShape
  billingAddress: OrderAddessShape
  shippingAddress: OrderAddessShape
  comments?: OrderCommentShape[]
  products?: AppProduct[]
}

export default class OrderController {
  static async importMagentoOrder(data: OrderData) {
    try {
      // section: CUSTOMER INFO
      // info: customer record is find or create
      const customerInfo = data.customer

      let customerRecord: Customer | null
      customerRecord = await Customer.findOne({
        where: {
          email: customerInfo.email,
        },
        include: {
          model: MagentoCustomer,
          as: 'magento',
        },
      })

      if (!customerRecord) {
        customerRecord = await Customer.create(customerInfo, {
          include: 'magento',
        })
      }

      // if customer existed, but magento record was missing.
      if (isEmptyObject(customerRecord.magento) && isNotEmptyObject(customerInfo.magento)) {
        await customerRecord.createMagento(customerInfo.magento)
      }

      // CUSTOMER ADDRESSES

      const { billingAddress, shippingAddress } = data
      // check if billing address is saved to customer record
      // TODO: check if externalCustomerAddressId is provided. if provided - add it too
      // await customerAddressCreateIfNotExists(customerRecord, billingAddress)
      // await customerAddressCreateIfNotExists(customerRecord, shippingAddress)

      // section: ORDER
      const orderInfo: OrderShape = {
        orderDate: getDate(data.orderDate),
        orderNumber: data.orderNumber,
        paymentMethod: data.paymentMethod,
        shippingCost: data.shippingCost,
        taxRate: data.taxRate,
        customerId: customerRecord.id,
        magento: {
          ...data.magento,
          status: getOrderStatus(data.magento.status),
        },
      }
      const [orderRecord] = await Order.upsert(orderInfo)
      if (orderInfo.magento?.externalId) {
        orderInfo.magento.orderId = orderRecord.id
        printYellowLine('UPSERT MAGENTO')
        const [test] = await MagentoOrder.upsert(orderInfo.magento)
        console.log(test && test.toJSON())
      }
      // section: ORDER ADDRESSES
      // done: test if orderId is properly assigned.
      const billingRecord = await OrderAddressController.upsertMagentoAddress(billingAddress, orderRecord)
      const shippingRecord = await OrderAddressController.upsertMagentoAddress(shippingAddress, orderRecord)

      if (!billingRecord || !shippingRecord) {
        throw new Error('error with billing and shipping addresses encountered')
      }

      await orderRecord.setBillingAddress(billingRecord)
      await orderRecord.setShippingAddress(shippingRecord)

      // COMMENTS

      if (data.comments && data?.comments?.length > 0) {
      // printYellowLine('comments')
        for (let i = 0; i < data.comments.length; i += 1) {
          await OrderCommentController.upsertMagentoComment(data.comments[i], orderRecord)
        }
      }

      // PRODUCTS

      if (data.products && data.products?.length > 0) {
        printYellowLine('products')
        for (let i = 0; i < data.products.length; i += 1) {
          const {
            configuration,
            brand,
            ...product
          } = data.products[i]

          const parsedProduct: ProductShape = {
            ...product,
          }

          let productConfiguration: Config | null = null
          let options: ProductOptionShape[] | null = null

          if (configuration) {
            productConfiguration = {
              ...configuration,
            }
            if (productConfiguration.options) {
              options = productConfiguration.options
              delete productConfiguration.options
            }
          }

          if (isNotEmptyObject(parsedProduct)) {
            // parse brand fields, find or create brand record in db
            // assign brand id to the product
            if (brand) {
              const parsedBrand = parseMagentoBrand(brand)
              if (parsedBrand) {
                // eslint-disable-next-line no-await-in-loop
                const [brandRecord] = await Brand.findOrCreate({
                  where: {
                    externalId: parsedBrand.externalId,
                  },
                  defaults: parsedBrand,
                })
                if (brandRecord) {
                  parsedProduct.brandId = brandRecord.id
                }
              }
            }

            if (!parsedProduct.externalId) {
              throw new Error('Product external Id is missing')
            }
            const [productRecord] = await Product.upsert(parsedProduct)

            if (productConfiguration) {
              if (!productConfiguration.externalId) {
                throw new Error('product configuration id is missing')
              }

              productConfiguration.productId = productRecord.id
              productConfiguration.orderId = orderRecord.id

              const [productConfigRecord] = await ProductConfiguration.upsert(productConfiguration)

              if (options) {
                await ProductOptionController.upsertMagentoProductOptions(options, productConfigRecord)
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('error encountered while importing order', error)
    }

    // CONFIGURATIONS)
    return this.getFullOrderByNumber(data.orderNumber)
  }

  static async getFullOrderByNumber(orderNumber: string) {
    const order = await Order.findOne({
      where: {
        orderNumber,
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
      ],
    })
    return this.toJSON(order)
  }

  static async searchOrders(term: string) {
    const wildCardTerm = `%${term}%`
    const orders = await Order.findAll({
      include: [
        {
          association: 'customer',
          // where: {

          // },
        },
      ],
      where: {
        [Op.or]: [
          {
            '$customer.firstName$': {
              [Op.like]: wildCardTerm,
            },
          },
          {
            '$customer.lastName$': {
              [Op.like]: wildCardTerm,
            },
          },
          Sequelize.where(
            Sequelize.fn('concat', Sequelize.col('customer.firstName'), ' ', Sequelize.col('customer.lastName')),
            {
              [Op.like]: wildCardTerm,
            },
          ),
          {
            orderNumber: {
              [Op.like]: wildCardTerm,
            },
          },
        ],
      },
    })
    return orders.map((order) => this.toJSON(order))
  }

  static toJSON(order: Order | null) {
    if (order) {
      const billingAddress = OrderAddressController.toJSON(order.billingAddress)
      const shippingAddress = OrderAddressController.toJSON(order.shippingAddress)

      const orderFinal = {
        ...order.toJSON(),
      } as OrderShape & {
        products: ProductConfiguration[],

      }

      const result = {
        ...orderFinal,
        billingAddress,
        shippingAddress,
        products: orderFinal.products?.map((configuration: ProductConfiguration) => {
          const { product, ...config } = configuration
          return {
            ...product,
            configuration: {
              ...config,
            },
          }
        }),
      }
      return result
    }
    return null
  }
}
