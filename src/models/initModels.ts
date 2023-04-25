import type { Sequelize } from 'sequelize'
import { initMagentoOrder } from './Sales/MagentoOrder/magentoOrder'
import { initOrder } from './Sales/Order/order'
import { initCustomer } from './Sales/Customer/customer'
import { initMagentoCustomer } from './Sales/MagentoCustomer/magentoCustomer'
import { initAddress } from './Sales/Address/address'
import { initMagentoAddress } from './Sales/MagentoAddress/magentoAddress'
import { initOrderAddress } from './Sales/OrderAddress/orderAddress'
import { initMagentoOrderAddress } from './Sales/MagentoOrderAddress/magentoOrderAddress'
import { initOrderComment } from './Sales/OrderComment/orderComment'
import { initBrands } from './Brand/brand'
import { initProducts } from './Sales/Product/product'
import { initProductConfigurations } from './Sales/ProductConfiguration/productConfiguration'
import { initProductOptions } from './Sales/ProductOption/productOption'
import { initCarrier } from './Receiving/Carrier/carrier'
import { initPurchaseOrder } from './Receiving/PurchaseOrder/purchaseOrder'
import { initPurchaseOrderItem } from './Receiving/PurchaseOrderItem/purchaseOrderItem'
import { initReceivedItem } from './Receiving/ReceivedItems/receivedItems'
import { initShipment } from './Receiving/Shipment/shipment'
import { initShipmentItem } from './Receiving/ShipmentItem/shipmentItem'
import { initTripRoute } from './Delivery/TripRoute/tripRoute'
import { initDriver } from './Delivery/Driver/driver'
import { initRouteDriver } from './Delivery/RouteDriver/routeDrivers'

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

  // Receiving:
  initCarrier(db)
  initPurchaseOrder(db)
  initPurchaseOrderItem(db)
  initReceivedItem(db)
  initShipment(db)
  initShipmentItem(db)

  // Shipping:
  initTripRoute(db)
  initDriver(db)
  initRouteDriver(db)
}

export default initModels
