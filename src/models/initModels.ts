import type { Sequelize } from 'sequelize'
import { initMagentoOrder } from './Sales/MagentoOrder/magentoOrder'
import { initOrder } from './Sales/Order/order'
import { initCustomer } from './Sales/Customer/customer'
import { initMagentoCustomer } from './Sales/MagentoCustomer/magentoCustomer'
import { initAddress } from './Sales/Address/Address'
import { initMagentoAddress } from './Sales/MagentoAddress/magentoAddress'
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
import { initDriver } from './Delivery/Driver/driver'
import { initDriverDowntime } from './Delivery/DriverDowntime/driverDowntime'
import { initOrderAvailability } from './Delivery/OrderAvailability/orderAvailability'
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
import { initPOReceivedView } from '../views/PurchaseOrders/poReceived'
import { initPOShippedView } from '../views/PurchaseOrders/poShipped'
import { initPOSummaryView } from '../views/PurchaseOrders/poSummary'
import { initShipmentItemReceivedSummaryView } from '../views/ShipmentItemReceivedSummary/shipmentItemReceivedSummary'
import { initDeliverySummaryView } from '../views/DeliverySummary/deliverySummary'

function initModels(db: Sequelize) {
  initMagentoOrder(db)
  initOrder(db)
  initCustomer(db)
  initMagentoCustomer(db)
  initAddress(db)
  initMagentoAddress(db)
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
  initPOReceivedView(db)
  initPOShippedView(db)
  initPOSummaryView(db)
  initShipmentItemReceivedSummaryView(db)
  initDeliverySummaryView(db)
}

export default initModels
