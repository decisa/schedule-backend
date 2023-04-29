import { parseISO } from 'date-fns'
import { CreationAttributes } from 'sequelize'
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
  getDate, getOrderStatus, isEmptyObject, isNotEmptyObject, printYellowLine,
} from '../../../utils/utils'
import OrderAddressController from '../OrderAddress/orderAddressContoller'
import { OrderComment } from '../OrderComment/orderComment'
import OrderCommentController from '../OrderComment/orderCommentController'

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

type BrandShape = CreationAttributes<Brand>

type ProductShape = CreationAttributes<Product>

type ProductConfigurationShape = CreationAttributes<ProductConfiguration>

type ProductOptionShape = CreationAttributes<ProductOption>

type OrderCommentShape = CreationAttributes<OrderComment>

type OrderData = OrderShape & {
  orderDate: Date | string
  customer: CustomerShape,
  billingAddress: OrderAddessShape,
  shippingAddress: OrderAddessShape,
  comments?: OrderCommentShape[],
}

export default class OrderController {
  static async importMagentoOrder(data: OrderData) {
    try { // section: CUSTOMER INFO
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
      // note: No need to save address to customer record when importing the order
      // await customerAddressCreateIfNotExists(customerRecord, billingAddress)
      // await customerAddressCreateIfNotExists(customerRecord, shippingAddress)

      // section: ORDER
      const orderInfo: OrderShape = {
        orderDate: getDate(data.orderDate),
        orderNumber: data.orderNumber,
        paymentMethod: data.paymentMethod,
        shippingCost: data.shippingCost,
        taxRate: data.taxRate,
        magento: {
          ...data.magento,
          updatedAt: getDate(data.magento.updatedAt),
          status: getOrderStatus(data.magento.status),
        },
      }

      let orderRecord = await Order.findOne({
        where: {
          orderNumber: orderInfo.orderNumber,
        },
      })

      if (!orderRecord) {
        orderRecord = await customerRecord.createOrder(orderInfo, {
          include: 'magento',
        })
        console.log('order not found')
      } else {
        console.log('order found', orderRecord.toJSON())
      }

      // section: ORDER ADDRESSES
      // TODO: test if orderId is properly assigned.
      const billingRecord = await OrderAddressController.upsertMagentoAddress(billingAddress, orderRecord)
      const shippingRecord = await OrderAddressController.upsertMagentoAddress(shippingAddress, orderRecord)

      if (!billingRecord || !shippingRecord) {
        throw new Error('error with billing and shipping addresses encountered')
      }

      // COMMENTS

      if (data.comments && data?.comments?.length > 0) {
      // printYellowLine('comments')
        for (let i = 0; i < data.comments.length; i += 1) {
          // const parsedComment: CreationAttributes<OrderComment> = {
          //   ...data.comments[i],
          //   createdAt: parseISO(data.comments[i].createdAt),
          //   type: data.comments[i].type as CommentType,
          //   orderId: orderRecord?.id,
          // }

          // eslint-disable-next-line no-await-in-loop
          await OrderCommentController.upsertMagentoComment(data.comments[i], orderRecord)

          // await OrderComment.upsert(parsedComment)
        }
      }

      // PRODUCTS

      // if (data?.products?.length > 0) {
      //   printYellowLine('products')
      //   for (let i = 0; i < data.products.length; i += 1) {
      //     const {
      //       configuration: {
      //         options,
      //         ...productConfiguration
      //       },
      //       brand,
      //       ...product
      //     } = data.products[i]

      //     const parsedProduct: ProductShape = {
      //       ...product,
      //     }

      //     if (isNotEmptyObject(parsedProduct)) {
      //       const parsedBrand = parseBrandObject(brand)
      //       if (parsedBrand) {
      //       // eslint-disable-next-line no-await-in-loop
      //         const [brandRecord] = await Brand.findOrCreate({
      //           where: {
      //             externalId: parsedBrand.externalId,
      //           },
      //           defaults: parsedBrand,
      //         })
      //         if (brandRecord) {
      //           parsedProduct.brandId = brandRecord.id
      //         }
      //       }

      //       let productRecord: Product | null
      //       // eslint-disable-next-line no-await-in-loop
      //       productRecord = await Product.findOne({
      //         where: {
      //           externalId: parsedProduct.externalId,
      //         },
      //       })
      //       if (!productRecord) {
      //       // eslint-disable-next-line no-await-in-loop
      //         productRecord = await Product.create(parsedProduct)
      //       }

      //       if (productConfiguration) {
      //         let productConfigRecord: ProductConfiguration | null
      //         // eslint-disable-next-line no-await-in-loop
      //         productConfigRecord = await ProductConfiguration.findOne({
      //           where: {
      //             externalId: productConfiguration.externalId,
      //           },
      //         })
      //         if (!productConfigRecord) {
      //         // eslint-disable-next-line no-await-in-loop
      //           productConfigRecord = await ProductConfiguration.create({
      //             ...productConfiguration,
      //             productId: productRecord.id,
      //             orderId: orderRecord.id,
      //           })
      //         } else {
      //         // eslint-disable-next-line no-await-in-loop
      //           await productConfigRecord.update({
      //             ...productConfiguration,
      //             productId: productRecord.id,
      //             orderId: orderRecord.id,
      //           })
      //         }

      //         // eslint-disable-next-line no-await-in-loop
      //         await upsertOptions(productConfigRecord, options)

      //         // if (isNotEmptyObject(optionRecords)) {
      //         //   console.log('options:', optionRecords)
      //         // }

      //       // printYellowLine(`adding ${productConfiguration.sku} for ${productRecord.name} with id=${productRecord.id}`)
      //       // // eslint-disable-next-line no-await-in-loop
      //       // const [productConfigRecord] = await ProductConfiguration.upsert({
      //       //   ...productConfiguration,
      //       //   productId: productRecord.id,
      //       //   orderId: orderRecord.id,
      //       // })
      //       // if (productConfigRecord) {
      //       //   console.log('configID=',productConfigRecord.id.toString())
      //       // }
      //       }
      //     }
      //   }
      // }
    } catch (error) {
      console.log('error encountered while importing order', error)
    }

    // CONFIGURATIONS

    const order = await Order.findByPk(1, {
      include: [{
        model: OrderAddress,
        as: 'billingAddress',
      },
      {
        model: OrderAddress,
        as: 'shippingAddress',
      },
      {
        model: OrderComment,
        as: 'comments',
      },
      {
        model: MagentoOrder,
        as: 'magento',
      },
      {
        model: Customer,
        as: 'customer',
        include: [{
          model: MagentoCustomer,
          as: 'magento',
        }],
      },
      {
        model: ProductConfiguration,
        as: 'products',
        include: [{
          model: Product,
          as: 'product',
        },
        {
          model: ProductOption,
          as: 'options',
        }],
      }],
      attributes: {
        exclude: [
          'billingAddressId',
          'shippingAddressId',
        ],
      },
    })
    if (order) {
      // const {billingAddress, shippingAddress, customer, comments, magento, products} = order
      // const reversedProducts = order.products?.map((configuration) => {
      //   const { product, ...config } = configuration
      //   return {
      //     ...product,
      //     configuration: {
      //       ...config,
      //     },
      //   }
      // })

      // const finalOrder = {
      //   ...order.toJSON(),
      //   products: reversedProducts,
      // }

      const orderFinal = {
        ...order.toJSON(),
      } as OrderShape & {
        products: ProductConfiguration[],

      }

      const result = {
        ...orderFinal,
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
      printYellowLine()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, global-require
      const fs = require('fs')

      const filePath = 'output.json' // the path and filename of the file you want to write to

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      fs.writeFile(filePath, JSON.stringify(result, null, 4), (err) => {
        if (err) {
          console.error(err)
          return
        }
        console.log(`Data written to ${filePath}`)
      })
      // console.log('final order:', order.toJSON())
      // console.log(JSON.stringify(order.toJSON(), null, 4))
    }
    // OPTIONS
  }
}
