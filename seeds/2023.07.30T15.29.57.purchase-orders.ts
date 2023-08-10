import type { Seeder } from '../umzug'
import { PurchaseOrder } from '../src/models/Receiving/PurchaseOrder/purchaseOrder'
import { readJsonFromFile } from '../src/utils/utils'
import { PurchaseOrderItem } from '../src/models/Receiving/PurchaseOrderItem/purchaseOrderItem'

const purchaseOrders = readJsonFromFile<PurchaseOrder[]>('./seeds/json/purchase-orders.json')

const purchaseOrderItems = readJsonFromFile<PurchaseOrderItem[]>('./seeds/json/purchase-order-items.json')

export const up: Seeder = async ({ context: queryInterface }) => {
  try {
    // use transaction to ensure that all or none of the data is inserted
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkInsert('PurchaseOrders', purchaseOrders, { transaction: t })
      await queryInterface.bulkInsert('PurchaseOrderItems', purchaseOrderItems, { transaction: t })
      console.log('up')
    })
  } catch (error) {
    console.log('error encountered during purchase order seeder: ', error)
    throw error
  }
}

export const down: Seeder = async ({ context: queryInterface }) => {
  try {
    // use transaction to ensure that all or none of the data is inserted
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkDelete('PurchaseOrders', { id: purchaseOrders.map((po) => po.id) })
    })
  } catch (error) {
    console.log('error encountered during purchase order seeder down: ')
    throw error
  }
}
