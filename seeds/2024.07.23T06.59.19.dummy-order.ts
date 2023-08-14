/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import db from '../src/models'
import { DeliveryMethod } from '../src/models/Sales/DeliveryMethod/deliveryMethod'
import { printYellowLine, readJsonFromFile } from '../src/utils/utils'
import type { Seeder } from '../umzug'
import { CustomerRead } from '../src/models/Sales/Customer/customerController'
import { OrderRead } from '../src/models/Sales/Order/orderController'
import { Order } from '../src/models/Sales/Order/order'
import { OrderAddressRead } from '../src/models/Sales/OrderAddress/orderAddressContoller'
import { OrderCommentRead } from '../src/models/Sales/OrderComment/orderCommentController'
import { OrderComment } from '../src/models/Sales/OrderComment/orderComment'
import { Product } from '../src/models/Sales/Product/product'
import { ProductRead } from '../src/models/Sales/Product/productController'
import { ProductConfiguration } from '../src/models/Sales/ProductConfiguration/productConfiguration'
import { ProductConfigurationRead } from '../src/models/Sales/ProductConfiguration/productConfigurationController'
import { ProductOption } from '../src/models/Sales/ProductOption/productOption'
import { ProductOptionRead } from '../src/models/Sales/ProductOption/productOptionController'

const dummyOrder = readJsonFromFile('./seeds/json/dummy-order.json') as any

export const up: Seeder = async ({ context: queryInterface }) => {
  // for (const method of deliveryMethods) {
  // use transaction to ensure that all or none of the data is inserted
  await queryInterface.sequelize.transaction(async (t) => {
    const customer = dummyOrder.customer as CustomerRead
    await queryInterface.sequelize.models.Customer.create(customer, { transaction: t, include: 'magento' })

    const orderInstance = await queryInterface.sequelize.models.Order.create(dummyOrder as OrderRead, { transaction: t, include: 'magento' }) as Order

    const billAddrInstance = await orderInstance.createAddress(dummyOrder.billingAddress as OrderAddressRead, {
      transaction: t,
      include: 'magento',
    })

    await orderInstance.setBillingAddress(billAddrInstance, { transaction: t })

    const shipAddrInst = await orderInstance.createAddress(dummyOrder.shippingAddress as OrderAddressRead, {
      transaction: t,
      include: 'magento',
    })

    await orderInstance.setShippingAddress(shipAddrInst, { transaction: t })

    printYellowLine()
    console.log('creating options')
    await OrderComment.bulkCreate(
      dummyOrder.comments.map((x) => ({
        ...x,
        orderId: orderInstance.id,
      })) as OrderCommentRead[],
      {
        transaction: t,
      },
    )

    const allProducts = dummyOrder.products.map((product) => {
      const result = {
        ...product,
        brandId: product?.brand?.id || null,
        id: product.mainProductId,
      }
      delete result.brand
      delete result.configuration
      return result
    })

    const allConfigs = dummyOrder.products.map((product) => {
      const result = {
        ...product.configuration,
        id: product.configurationId,
        orderId: orderInstance.id,
        productId: product.mainProductId,
      }
      return result
    })

    const allOptions = dummyOrder.products
      .filter((x) => x?.configuration?.options)
      .map((x) => x.configuration.options.map((option) => {
        const result = {
          ...option,
          configId: x.configurationId,
        }
        return result
      }))
      .reduce((acc, cur) => {
        cur.forEach((o) => acc.push(o))
        return acc
      }, [])

    printYellowLine('PRODUCTS:')
    console.log(allProducts)
    for (const product of allProducts) {
      await Product.upsert(
        product as ProductRead,
        {
          transaction: t,
        },
      )
    }

    printYellowLine('CONFIGS:')
    await ProductConfiguration.bulkCreate(
      allConfigs as ProductConfigurationRead[],
      {
        transaction: t,
      },
    )
    printYellowLine('OPTIONS:')
    await ProductOption.bulkCreate(
      allOptions as ProductOptionRead[],
      {
        transaction: t,
      },
    )
    // throw new Error('hahhahah')
  })
}

export const down: Seeder = async ({ context: queryInterface }) => {
  // await queryInterface.bulkDelete('DeliveryMethods', { id: deliveryMethods.map((method) => method.id) })
  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.sequelize.models.Order.destroy({
      transaction: t,
      where: {
        id: dummyOrder.id,
      },
    })

    await queryInterface.sequelize.models.Product.destroy({
      transaction: t,
      where: {
        id: dummyOrder.products.map((x) => x.mainProductId),
      },
    })

    const customerId = dummyOrder.customer.id
    await queryInterface.sequelize.models.Customer.destroy({
      transaction: t,
      where: {
        id: customerId,
      },
    })
    console.log('dummy seed down')
  })
}
