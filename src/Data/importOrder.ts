import { CreationAttributes, InferCreationAttributes } from 'sequelize'
import { parseISO } from 'date-fns'
import { Address } from '../models/Sales/Address/address'
import { Customer } from '../models/Sales/Customer/customer'
import { MagentoAddress } from '../models/Sales/MagentoAddress/magentoAddress'
import { isEmptyObject, isNotEmptyObject, printYellowLine } from '../utils/utils'
import data from './data'
import { MagentoOrderAddress } from '../models/Sales/MagentoOrderAddress/magentoOrderAddress'
import { OrderAddress } from '../models/Sales/OrderAddress/orderAddress'
import { Order } from '../models/Sales/Order/order'
import { MagentoOrder, OrderStatus } from '../models/Sales/MagentoOrder/magentoOrder'
import { MagentoCustomer } from '../models/Sales/MagentoCustomer/magentoCustomer'
import { CommentType, OrderComment } from '../models/Sales/OrderComment/orderComment'
import { Product } from '../models/Sales/Product/product'
import { Brand } from '../models/Brand/brand'
import { ProductConfiguration } from '../models/Sales/ProductConfiguration/productConfiguration'
import { ProductOption } from '../models/Sales/ProductOption/productOption'

type CustomerAddressShape = CreationAttributes<Address> & {
  magento: CreationAttributes<MagentoAddress>
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

async function upsertOptions(configInstance: ProductConfiguration, options?: ProductOptionShape[]): Promise<ProductOption[]> {
  if (configInstance.id === 4) {
    printYellowLine()
    console.log(configInstance.toJSON())
    console.log('options:', options)
  }
  if (!options?.length) {
    return []
  }

  const result: ProductOption[] = []

  for (let i = 0; i < options?.length; i += 1) {
    const option = options[i]
    let productOptionRecord: ProductOption | null
    // eslint-disable-next-line no-await-in-loop
    productOptionRecord = await ProductOption.findOne({
      where: {
        externalId: option.externalId,
        configId: configInstance.id,
      },
    })
    if (!productOptionRecord) {
      // eslint-disable-next-line no-await-in-loop
      productOptionRecord = await ProductOption.create({
        ...option,
        configId: configInstance.id,
      })
    } else {
      // update option record:
      const updatedOptionValues: ProductOptionShape = {
        sortOrder: option.sortOrder,
        externalId: option.externalId,
        externalValue: option.externalValue,
        label: productOptionRecord.label || option.label,
        value: productOptionRecord.value || option.value,
        configId: configInstance.id,
      }
      // eslint-disable-next-line no-await-in-loop
      await productOptionRecord.update(updatedOptionValues)
    }
    result.push(productOptionRecord)
  }

  return result
}

function parseBrandObject(obj: Record<string, string | number | undefined> | undefined): BrandShape | null {
  let result: BrandShape
  if (obj?.name) {
    result = {
      name: String(obj.name),
    }
    if (typeof obj?.externalId === 'string') {
      const externalId = parseInt(obj.externalId, 10)
      if (Number.isFinite(externalId)) {
        result.externalId = externalId
      }
    }
    if (typeof obj?.externalId === 'number') {
      if (Number.isFinite(obj.externalId)) {
        result.externalId = obj.externalId
      }
    }
    return result
  }
  return null
}

function getOrderStatus(status: string): OrderStatus {
  if (
    status === 'pending'
    || status === 'processing'
    || status === 'in_production'
    || status === 'in_transit'
    || status === 'preparing_shipment'
    || status === 'complete'
    || status === 'closed'
  ) {
    return status
  }
  return 'unknown'
}
/**
 * Takes order address, checks if this address should be saved in customer's record
 * and saves it if it does not exist yet
 * @param {OrderAddessShape} orderAddress - properly formatted magento order address.
 * @returns {void}
 */
async function customerAddressCreateIfNotExists(customerInstance: Customer, orderAddress: OrderAddessShape): Promise<void> {
  const customerExtAddressId = orderAddress.magento.externalCustomerAddressId
  if (customerExtAddressId) {
    // console.log('id exists, checking if record exists')
    const magentoAddressRecord = await MagentoAddress.findByPk(customerExtAddressId)
    // console.log('magento address record;', magentoAddressRecord)
    if (!magentoAddressRecord) {
      // create address for the customer
      const addressRecord: CustomerAddressShape = { ...orderAddress }
      addressRecord.magento = {
        externalId: customerExtAddressId,
        addressType: orderAddress.magento.addressType,
      }
      await customerInstance.createAddress(addressRecord, {
        include: 'magento',
      })
    } else {
      console.log('customer address already exists')
    }
  }
}

export default async function importOrder() {
  // CUSTOMER INFO
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
  if (isEmptyObject(customerRecord.magento) && !isEmptyObject(customerInfo.magento)) {
    await customerRecord.createMagento(customerInfo.magento)
  }

  // CUSTOMER ADDRESSES

  const { billingAddress, shippingAddress } = data
  // check if billing address is saved to customer record
  await customerAddressCreateIfNotExists(customerRecord, billingAddress)
  await customerAddressCreateIfNotExists(customerRecord, shippingAddress)

  // ORDER

  const orderInfo: OrderShape = {
    orderDate: parseISO(data.orderDate),
    orderNumber: data.orderNumber,
    paymentMethod: data.paymentMethod,
    shippingCost: data.shippingCost,
    taxRate: data.taxRate,
    magento: {
      ...data.magento,
      updatedAt: parseISO(data.magento.updatedAt),
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

  // ORDER ADDRESSES

  // see if magento record exists for billing
  const billingMagentoRecord = await MagentoOrderAddress.findByPk(billingAddress?.magento?.externalId)
  let billingRecord: OrderAddress
  // printYellowLine('billing:')
  if (billingMagentoRecord) {
    // console.log('magento address record found')
    billingRecord = await billingMagentoRecord.getOrderAddress()
  } else {
    // console.log('could not find magento address, CREATING NEW ONE')
    billingRecord = await orderRecord.createAddress(billingAddress, {
      include: 'magento',
    })
  }
  // check if billing address already assigned to the order, if not - assign
  if (!orderRecord.billingAddressId && billingRecord) {
    await orderRecord.setBillingAddress(billingRecord)
  }

  // see if magento record exists for billing
  const shippingMagentoRecord = await MagentoOrderAddress.findByPk(shippingAddress?.magento?.externalId)
  let shippingRecord: OrderAddress
  // printYellowLine('billing:')
  if (shippingMagentoRecord) {
    // console.log('magento address record found')
    shippingRecord = await shippingMagentoRecord.getOrderAddress()
  } else {
    // console.log('could not find magento address, CREATING NEW ONE')
    shippingRecord = await orderRecord.createAddress(shippingAddress, {
      include: 'magento',
    })
  }
  // check if billing address already assigned to the order, if not - assign
  if (!orderRecord.shippingAddressId && shippingRecord) {
    await orderRecord.setShippingAddress(shippingRecord)
  }

  // COMMENTS

  if (data?.comments?.length > 0) {
    // printYellowLine('comments')
    for (let i = 0; i < data.comments.length; i += 1) {
      const parsedComment: CreationAttributes<OrderComment> = {
        ...data.comments[i],
        createdAt: parseISO(data.comments[i].createdAt),
        type: data.comments[i].type as CommentType,
        orderId: orderRecord?.id,
      }
      // eslint-disable-next-line no-await-in-loop
      await OrderComment.upsert(parsedComment)
    }
  }

  // PRODUCTS

  if (data?.products?.length > 0) {
    printYellowLine('products')
    for (let i = 0; i < data.products.length; i += 1) {
      const {
        configuration: {
          options,
          ...productConfiguration
        },
        brand,
        ...product
      } = data.products[i]

      const parsedProduct: ProductShape = {
        ...product,
      }

      if (isNotEmptyObject(parsedProduct)) {
        const parsedBrand = parseBrandObject(brand)
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

        let productRecord: Product | null
        // eslint-disable-next-line no-await-in-loop
        productRecord = await Product.findOne({
          where: {
            externalId: parsedProduct.externalId,
          },
        })
        if (!productRecord) {
          // eslint-disable-next-line no-await-in-loop
          productRecord = await Product.create(parsedProduct)
        }

        if (productConfiguration) {
          let productConfigRecord: ProductConfiguration | null
          // eslint-disable-next-line no-await-in-loop
          productConfigRecord = await ProductConfiguration.findOne({
            where: {
              externalId: productConfiguration.externalId,
            },
          })
          if (!productConfigRecord) {
            // eslint-disable-next-line no-await-in-loop
            productConfigRecord = await ProductConfiguration.create({
              ...productConfiguration,
              productId: productRecord.id,
              orderId: orderRecord.id,
            })
          } else {
            // eslint-disable-next-line no-await-in-loop
            await productConfigRecord.update({
              ...productConfiguration,
              productId: productRecord.id,
              orderId: orderRecord.id,
            })
          }

          // eslint-disable-next-line no-await-in-loop
          await upsertOptions(productConfigRecord, options)

          // if (isNotEmptyObject(optionRecords)) {
          //   console.log('options:', optionRecords)
          // }

          // printYellowLine(`adding ${productConfiguration.sku} for ${productRecord.name} with id=${productRecord.id}`)
          // // eslint-disable-next-line no-await-in-loop
          // const [productConfigRecord] = await ProductConfiguration.upsert({
          //   ...productConfiguration,
          //   productId: productRecord.id,
          //   orderId: orderRecord.id,
          // })
          // if (productConfigRecord) {
          //   console.log('configID=',productConfigRecord.id.toString())
          // }
        }
      }
    }
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
