import { Transaction } from 'sequelize'
import db from '../..'

export default class OrderAddressController {
  static async upsertMagentoAddress(magentoAddress, t?: Transaction) {
    let transaction: Transaction
    if (t) {
      transaction = t
    } else {
      transaction = await db.transaction()
    }

    try {

    } catch (error) {
      // if the t transaction was passed to the method, throw error again
      // to be processed by another 
      if (t)
    }
  }
}
