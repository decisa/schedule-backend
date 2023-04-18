import type { Sequelize } from 'sequelize'
import { initMagentoOrder } from './MagentoOrder/magentoOrder'
import { initOrder } from './Order/order'
import { initCustomer } from './Customer/customer'
import { initMagentoCustomer } from './MagentoCustomer/magentoCustomer'
import { initAddress } from './Address/address'
import { initMagentoAddress } from './MagentoAddress/magentoAddress'
import { initOrderAddress } from './OrderAddress/orderAddress'
import { initMagentoOrderAddress } from './MagentoOrderAddress/magentoOrderAddress'
import { initOrderComment } from './OrderComment/orderComment'
import { initBrands } from './Brand/brand'
import { initProducts } from './Product/product'
import { initProductConfigurations } from './ProductConfiguration/productConfiguration'
import { initProductOptions } from './ProductOption/productOption'

function initModels(db: Sequelize) {
  initMagentoOrder(db)
  initOrderAddress(db)
  initOrder(db)
  initCustomer(db)
  initMagentoCustomer(db)
  initAddress(db)
  initMagentoAddress(db)
  initMagentoOrderAddress(db)
  initOrderComment(db)
  initBrands(db)
  initProducts(db)
  initProductConfigurations(db)
  initProductOptions(db)
}

export default initModels
