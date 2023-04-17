import type { Sequelize } from 'sequelize'
import { initMagentoOrder } from './MagentoOrder/magentoOrder'
import { initOrder } from './Order/order'
import { initCustomer } from './Customer/customer'
import { initMagentoCustomer } from './MagentoCustomer/magentoCustomer'
import { initAddress } from './Address/address'
import { initMagentoAddress } from './MagentoAddress/magentoAddress'
import { initOrderAddress } from './OrderAddress/orderAddress'
import { initMagentoOrderAddress } from './MagentoOrderAddress/magentoOrderAddress'

function initModels(db: Sequelize) {
  initMagentoOrder(db)
  initOrderAddress(db)
  initOrder(db)
  initCustomer(db)
  initMagentoCustomer(db)
  initAddress(db)
  initMagentoAddress(db)
  initMagentoOrderAddress(db)
}

export default initModels
