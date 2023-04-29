import { Transaction } from 'sequelize'
import db from '../..'
import type { OrderAddessShape } from '../../models'
import { MagentoOrderAddress } from '../MagentoOrderAddress/magentoOrderAddress'
import { OrderAddress } from './orderAddress'
import { Order } from '../Order/order'
// import { printYellowLine } from '../../../utils/utils'

export default class OrderAddressController {
/**
 * create or update Order Address Record (must have Magento info).
 * @param magentoAddress - Address
 * @param orderInstanceOrId - orderId or Order instance to which to assign the address
 * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
 * @returns Order Address Instance with Magento record or null if there was a rollback and no transaction provided.
 */
  static async upsertMagentoAddress(magentoAddress: OrderAddessShape, orderInstanceOrId?: Order | number, t?: Transaction): Promise<OrderAddress & { magento: MagentoOrderAddress } | null> {
    let transaction: Transaction
    if (t) {
      transaction = t
    } else {
      transaction = await db.transaction()
    }

    // extract orderId if it was provided
    let orderId: number | null = null
    if (orderInstanceOrId instanceof Order) {
      orderId = orderInstanceOrId.id
    }
    if (typeof orderInstanceOrId === 'number' && Number.isFinite(orderInstanceOrId)) {
      orderId = orderInstanceOrId
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

      if (orderId) {
        address.orderId = orderId
      }

      let addressRecord = await OrderAddress.findOne({
        transaction,
        include: [{
          association: 'magento',
          where: {
            externalId: address.magento.externalId,
          },
        }],
      })

      if (addressRecord) {
        // if the address already existed, update it:
        // need to provide address id for upsert to update properly
        address.id = addressRecord.id

        // update order record
        await OrderAddress.update(address, {
          transaction,
          where: {
            id: addressRecord.id,
          },
          // fields: [
          //   'id', 'firstName', 'lastName', 'company', 'street1', 'street2',
          //   'city', 'state', 'zipCode', 'country', 'phone', 'altPhone', 'notes',
          //   'longitude', 'latitude', 'coordinates', 'street', 'orderId', 'customerAddressId'],
        })

        await MagentoOrderAddress.update(address.magento, {
          transaction,
          where: {
            externalId: magentoAddress.magento.externalId,
          },
        })
      } else {
        // create new address
        addressRecord = await OrderAddress.create(magentoAddress, {
          transaction,
          include: 'magento',
        })
        if (!addressRecord) {
          throw new Error('Error encountered while creating the order address')
        }
      }

      addressRecord = await OrderAddress.findOne({
        transaction,
        include: [{
          association: 'magento',
          where: {
            externalId: address.magento.externalId,
          },
        }],
      })

      if (!t) {
        // if no transaction was provided, commit the local transaction:
        await transaction.commit()
      }
      return addressRecord as (OrderAddress & { magento: MagentoOrderAddress }) | null
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