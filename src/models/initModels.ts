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
import { initDriver } from './Delivery/Driver/Driver'
import { initRouteDriver } from './Delivery/RouteDriver/routeDrivers'
import { initDriverDowntime } from './Delivery/DriverDowntime/driverDowntime'
import { initOrderAvailability } from './Delivery/OrderAvailability/orderAvailability'
import { initRouteStop } from './Delivery/RouteStop/routeStop'
import { initRouteStopItem } from './Delivery/RouteStopItem/routeStopItem'
import { initVehicle } from './Delivery/Vehicle/vehicle'
import { initDeliveryMethod } from './Sales/DeliveryMethod/deliveryMethod'
import { initProductSummaryView } from '../views/ProductSummary/productSummary'
import { initTrip } from './Delivery/Trip/Trip'
import { initTripDriver } from './Delivery/TripDriver/TripDriver'
import { initDeliveryItem } from './Delivery/DeliveryItem/DeliveryItem'
import { initDelivery } from './Delivery/Delivery/Delivery'
import { initDeliveryStop } from './Delivery/DeliveryStop/DeliveryStop'
import { initPurchasedSummaryView } from '../views/PurchasedSummary/purchasedSummary'
import { initShippedSummaryView } from '../views/ShippedSummary/shippedSummary'
import { initReceivedSummaryView } from '../views/ReceivedSummary/receivedSummary'

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
  initDeliveryMethod(db)

  // Receiving:
  initCarrier(db)
  initPurchaseOrder(db)
  initPurchaseOrderItem(db)
  initReceivedItem(db)
  initShipment(db)
  initShipmentItem(db)

  // Shipping:
  initDriverDowntime(db)
  initOrderAvailability(db)
  initRouteDriver(db)
  initRouteStop(db)
  initRouteStopItem(db)
  initTripRoute(db)

  initVehicle(db)
  initDriver(db)
  initTrip(db)
  initTripDriver(db)
  initDeliveryItem(db)
  initDelivery(db)
  initDeliveryStop(db)

  // Views:
  initPurchasedSummaryView(db)
  initShippedSummaryView(db)
  initReceivedSummaryView(db)
  initProductSummaryView(db)
}

export default initModels
