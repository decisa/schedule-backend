import { Transaction } from 'sequelize'
import db from '../..'
import type { OrderAddessShape } from '../../models'
import { MagentoOrderAddress } from '../MagentoOrderAddress/magentoOrderAddress'
import { OrderAddress } from './orderAddress'
import { Order } from '../Order/order'
import { printYellowLine } from '../../../utils/utils'

export default class OrderAddressController {
  static async upsertMagentoAddress(magentoAddress: OrderAddessShape, orderInstance?: Order, t?: Transaction) {
    let transaction: Transaction
    if (t) {
      transaction = t
    } else {
      transaction = await db.transaction()
    }

    try {
      if (!magentoAddress.magento) {
        throw new Error('magento record was not provided')
      }

      const address: OrderAddessShape = {
        ...magentoAddress,
        magento: {
          ...magentoAddress.magento,
        },
      }

      if (!address.magento) {
        throw new Error('magento record was not provided')
      }

      if (orderInstance) {
        address.orderId = orderInstance.id
      }

      let addressRecord = await OrderAddress.findOne({
        include: [{
          association: 'magento',
          where: {
            externalId: address.magento.externalId,
          },
        }],
      })

      printYellowLine()

      console.log('found order :', addressRecord?.toJSON())
      if (addressRecord) {
        // if the address already existed, update it:
        address.id = addressRecord.id

        await OrderAddress.upsert(address, {
          transaction,
          fields: [
            'id',
            'firstName',
            'lastName',
            'company',
            'street1',
            'street2',
            'city',
            'state',
            'zipCode',
            'country',
            'phone',
            'altPhone',
            'notes',
            'longitude',
            'latitude',
            'coordinates',
            'street',
            'orderId',
            'customerAddressId'],
        })

        // addressRecord = await OrderAddress.findOne({
        //   include: [{
        //     association: 'magento',
        //     where: {
        //       externalId: address.magento.externalId,
        //     },
        //   }],
        // })
        if (addressRecord) {
          console.log('FINAL:', addressRecord.toJSON())
        }
      } else {
        // create new address
        addressRecord = await OrderAddress.create(magentoAddress, {
          include: 'magento',
          transaction,
        })
        if (!addressRecord) {
          throw new Error('Error encountered while creating the order address')
        }
      }
      // see if magento record exists
      // const orderAddressMagentoRecord = await MagentoOrderAddress.findByPk(magentoAddress?.magento?.externalId)
      // let orderAddressRecord: OrderAddress | null
      // // printYellowLine('billing:')
      // if (orderAddressMagentoRecord) {
      //   console.log('magento record:', orderAddressMagentoRecord.toJSON())
      //   // update the magento record:
      //     // eslint-disable-next-line no-unexpected-multiline, @typescript-eslint/no-unsafe-member-access
      //     [orderAddressMagentoRecord as any] = await MagentoOrderAddress.upsert(magentoAddress.magento, {
      //       transaction,
      //       fields: ['addressType', 'externalCustomerAddressId', 'externalOrderId', 'orderAddressId'],
      //     })

      //   console.log('magento record:', orderAddressMagentoRecord.toJSON())

      //   if (orderAddressMagentoRecord.orderAddressId) {
      //     [orderAddressRecord] = await OrderAddress.upsert({
      //       ...magentoAddress,
      //       id: orderAddressMagentoRecord.orderAddressId,
      //     }, {
      //       transaction,
      //       fields: ['orderId', 'firstName', 'lastName', 'notes', 'company', 'street1', 'street2', 'city', 'state', 'zipCode', 'country', 'phone', 'altPhone', 'longitude', 'latitude', 'coordinates', 'street', 'customerAddressId'],
      //     })

      //     printYellowLine()
      //     console.log('order:', orderAddressRecord.toJSON())
      //     await orderAddressRecord.reload({ include: 'magento' })
      //     console.log('order on reload:', orderAddressRecord.toJSON())
      //   } else {
      //     orderAddressRecord = null
      //   }

      //   // orderAddressMagentoRecord.orderAddressId

      //   // find the order record
      //   // orderAddressRecord = await orderAddressMagentoRecord.getOrderAddress()
      //   // orderAddressRecord.update()
      //   // await orderAddressRecord.reload()
      // } else {
      // // console.log('could not find magento address, CREATING NEW ONE')
      //   if (orderInstance) {
      //     orderAddressRecord = await orderInstance.createAddress(magentoAddress, {
      //       include: 'magento',
      //       transaction,
      //     })
      //   } else {
      //     orderAddressRecord = await OrderAddress.create(magentoAddress, {
      //       include: 'magento',
      //       transaction,
      //     })
      //   }

      //   console.log('bla bla bla')
      // }

      if (!t) {
        // if no transaction was provided, commit the local transaction:
        await transaction.commit()
      }
      return await OrderAddress.findOne({
        include: [{
          association: 'magento',
          where: {
            externalId: address.magento.externalId,
          },
        }],
      })
      // return orderAddressRecord
    } catch (error) {
      // if the t transaction was passed to the method, throw error again
      // to be processed by another
      if (t) {
        throw error
      }
      console.log('error occured: ', error, 'rolling back transaction')
      await transaction.rollback()
      return null
    }
  }
}
