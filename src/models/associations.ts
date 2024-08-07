import { Address } from './Sales/Address/Address'
import { Brand } from './Brand/brand'
import { Customer } from './Sales/Customer/customer'
import { MagentoAddress } from './Sales/MagentoAddress/magentoAddress'
import { MagentoCustomer } from './Sales/MagentoCustomer/magentoCustomer'
import { MagentoOrder } from './Sales/MagentoOrder/magentoOrder'
import { Order } from './Sales/Order/order'
import { OrderComment } from './Sales/OrderComment/orderComment'
import { Product } from './Sales/Product/product'
import { ProductConfiguration } from './Sales/ProductConfiguration/productConfiguration'
import { ProductOption } from './Sales/ProductOption/productOption'
import { Carrier } from './Receiving/Carrier/carrier'
import { Shipment } from './Receiving/Shipment/shipment'
import { PurchaseOrder } from './Receiving/PurchaseOrder/purchaseOrder'
import { PurchaseOrderItem } from './Receiving/PurchaseOrderItem/purchaseOrderItem'
import { ShipmentItem } from './Receiving/ShipmentItem/shipmentItem'
import { ReceivedItem } from './Receiving/ReceivedItems/receivedItems'
import { Driver } from './Delivery/Driver/driver'
import { DriverDowntime } from './Delivery/DriverDowntime/driverDowntime'
import { OrderAvailability } from './Delivery/OrderAvailability/orderAvailability'
import { Vehicle } from './Delivery/Vehicle/vehicle'
import { DeliveryMethod } from './Sales/DeliveryMethod/deliveryMethod'
import { ProductSummaryView } from '../views/ProductSummary/productSummary'
import { Trip } from './Delivery/Trip/Trip'
import { TripDriver } from './Delivery/TripDriver/TripDriver'
import { Delivery } from './Delivery/Delivery/Delivery'
import { DeliveryItem } from './Delivery/DeliveryItem/DeliveryItem'
import { DeliveryStop } from './Delivery/DeliveryStop/DeliveryStop'
import { POSummaryView } from '../views/PurchaseOrders/poSummary'
import { ShipmentItemReceivedSummaryView } from '../views/ShipmentItemReceivedSummary/shipmentItemReceivedSummary'

function createAssociations() {
  // some orders have a magento record
  Order.hasOne(MagentoOrder, {
    as: 'magento',
    sourceKey: 'id',
    foreignKey: {
      name: 'orderId',
      allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  MagentoOrder.belongsTo(Order, {
    as: 'order',
    foreignKey: 'orderId',
  })

  // some customers will have a magento record:
  Customer.hasOne(MagentoCustomer, {
    as: 'magento',
    sourceKey: 'email',
    foreignKey: 'email',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  MagentoCustomer.belongsTo(Customer, {
    as: 'customer',
    foreignKey: 'email',
  })

  // every order belongs to a customer
  // One-to-many relationship between Customers and Orders.
  Order.belongsTo(Customer, {
    as: 'customer',
    foreignKey: {
      name: 'customerId',
      allowNull: false,
    },
    onDelete: 'NO ACTION',
  })
  Customer.hasMany(Order, {
    as: 'orders',
    foreignKey: 'customerId',
    sourceKey: 'id',
  })

  Order.belongsTo(Address, {
    as: 'shippingAddress',
    targetKey: 'id',
    foreignKey: 'shippingAddressId',
    // onDelete: 'NO ACTION',
    constraints: false,
  })

  // BILLING ADDRESS FOR ORDER:
  Order.belongsTo(Address, {
    as: 'billingAddress',
    foreignKey: 'billingAddressId',
    // onDelete: 'NO ACTION',
    constraints: false,
  })

  // One-to-many relationship between Orders and Addresses.
  Address.belongsTo(Order, {
    as: 'order',
    targetKey: 'id',
    foreignKey: 'orderId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })

  Order.hasMany(Address, {
    as: 'addresses',
    sourceKey: 'id',
    foreignKey: 'orderId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })

  // Customer has many Addresses
  // One-to-many relationship between Customers and Addresses.
  Customer.hasMany(Address, {
    as: 'addresses',
    foreignKey: 'customerId',
  })
  Address.belongsTo(Customer, {
    as: 'customer',
    foreignKey: 'customerId',
  })

  // some addresses have a magento record:
  // One-to-one relationship between Address and MagentoAddress.
  Address.hasOne(MagentoAddress, {
    as: 'magento',
    sourceKey: 'id',
    foreignKey: 'addressId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  MagentoAddress.belongsTo(Address, {
    as: 'address',
    foreignKey: 'addressId',
  })

  // ORDER COMMENTS
  // One-to-many relationship between Orders and OrderComments.
  Order.hasMany(OrderComment, {
    as: 'comments',
    foreignKey: 'orderId',
  })
  OrderComment.belongsTo(Order, {
    as: 'order',
    foreignKey: 'orderId',
  })

  // One-to-many relationship between Brands and Products.
  Brand.hasMany(Product, {
    as: 'prdoducts',
    foreignKey: 'brandId',
  })
  Product.belongsTo(Brand, {
    as: 'brand',
    foreignKey: 'brandId',
  })

  // PRODUCT CONFIGURATIONS:
  /**
   * belongsTo:
   * 'foreignKey' << added to SOURCE object
   * 'as' - how the target will be called on source object
   */

  /**
   * hasMany:
   * 'foreignKey' >> added to TARGET object
   * 'as' - how the target will be called on source in PLURAL form
   */
  // One-to-many relationship between Products and ProductConfigurations.
  Product.hasMany(ProductConfiguration, {
    as: 'configurations',
    foreignKey: 'productId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ProductConfiguration.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
  })

  // One-to-many relationship between Orders and ProductConfigurations.
  Order.hasMany(ProductConfiguration, {
    as: 'products',
    foreignKey: 'orderId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ProductConfiguration.belongsTo(Order, {
    as: 'order',
    foreignKey: 'orderId',
  })

  // One-to-many relationship between ProductConfigurations and ProductOptions.
  ProductConfiguration.hasMany(ProductOption, {
    as: 'options',
    foreignKey: 'configId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  ProductOption.belongsTo(ProductConfiguration, {
    as: 'product',
    foreignKey: 'configId',
  })

  // One-to-many relationship between DeliveryMethod and Orders
  DeliveryMethod.hasMany(Order, {
    as: 'orders',
    foreignKey: 'deliveryMethodId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  Order.belongsTo(DeliveryMethod, {
    as: 'deliveryMethod',
    foreignKey: 'deliveryMethodId',
  })

  // note: *************  RECEIVING ****************
  // One-to-many relationship between Carriers and Shipments.
  Carrier.hasMany(Shipment, {
    as: 'shipments',
    foreignKey: 'carrierId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  Shipment.belongsTo(Carrier, {
    as: 'carrier',
    foreignKey: 'carrierId',
  })

  //  One-to-many relationship between Orders and PurchaseOrders.
  Order.hasMany(PurchaseOrder, {
    as: 'purchaseOrders',
    foreignKey: 'orderId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  PurchaseOrder.belongsTo(Order, {
    as: 'order',
    foreignKey: 'orderId',
  })
  //  One-to-many relationship between PurchaseOrders and PurchaseOrderItems.
  PurchaseOrder.hasMany(PurchaseOrderItem, {
    as: 'items',
    foreignKey: 'purchaseOrderId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  PurchaseOrderItem.belongsTo(PurchaseOrder, {
    as: 'purchaseOrder',
    foreignKey: 'purchaseOrderId',
  })
  //  One-to-many relationship between Brands and PurchaseOrders.
  Brand.hasMany(PurchaseOrder, {
    as: 'purchaseOrders',
    foreignKey: 'brandId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  PurchaseOrder.belongsTo(Brand, {
    as: 'brand',
    foreignKey: 'brandId',
  })
  // One-to-many relationship between ProductConfigurations and PurchaseOrderItems.
  ProductConfiguration.hasMany(PurchaseOrderItem, {
    as: 'purchaseOrderItems',
    foreignKey: 'configurationId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  PurchaseOrderItem.belongsTo(ProductConfiguration, {
    as: 'product',
    foreignKey: 'configurationId',
  })

  // One-to-many relationship between ShipmentItem and ReceivedItems (nullable).
  ShipmentItem.hasMany(ReceivedItem, {
    as: 'receivedItems',
    foreignKey: 'shipmentItemId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ReceivedItem.belongsTo(ShipmentItem, {
    as: 'shipmentItem',
    foreignKey: 'shipmentItemId',
  })

  // One-to-one relationship between ShipmentItem and ShipmentItemReceivedSummaryView (nullable).
  ShipmentItem.hasOne(ShipmentItemReceivedSummaryView, {
    as: 'receivedSummary',
    foreignKey: 'shipmentItemId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ShipmentItemReceivedSummaryView.belongsTo(ShipmentItem, {
    as: 'shipmentItem',
    foreignKey: 'shipmentItemId',
  })

  // One-to-many relationship between PurchaseOrderItems and ShipmentItems.
  PurchaseOrderItem.hasMany(ShipmentItem, {
    as: 'shipmentItems',
    foreignKey: 'purchaseOrderItemId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ShipmentItem.belongsTo(PurchaseOrderItem, {
    as: 'purchaseOrderItem',
    foreignKey: 'purchaseOrderItemId',
  })

  // One-to-one relationship between PurchaseOrderItems and POSummaryView.
  PurchaseOrderItem.hasOne(POSummaryView, {
    as: 'summary',
    foreignKey: 'purchaseOrderItemId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  POSummaryView.belongsTo(PurchaseOrderItem, {
    as: 'purchaseOrderItem',
    foreignKey: 'purchaseOrderItemId',
  })

  // One-to-many relationship between Shipments and ShipmentItems.
  Shipment.hasMany(ShipmentItem, {
    as: 'items',
    foreignKey: 'shipmentId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ShipmentItem.belongsTo(Shipment, {
    as: 'shipment',
    foreignKey: 'shipmentId',
  })

  // note: *************  SHIPPING ****************

  // One-to-many relationship between Drivers and DriverDowntime.
  Driver.hasMany(DriverDowntime, {
    as: 'driverDowntimes',
    foreignKey: 'driverId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  DriverDowntime.belongsTo(Driver, {
    as: 'driver',
    foreignKey: 'driverId',
  })
  // One-to-many relationship between Orders and OrderAvailability.
  Order.hasMany(OrderAvailability, {
    as: 'orderAvailabilities',
    foreignKey: 'orderId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  OrderAvailability.belongsTo(Order, {
    as: 'order',
    foreignKey: 'orderId',
  })

  // associations for the Product Summary View:
  ProductConfiguration.hasOne(ProductSummaryView, {
    as: 'summary',
    sourceKey: 'id',
    foreignKey: 'configurationId',
  })
  ProductSummaryView.belongsTo(ProductConfiguration, {
    as: 'product',
    foreignKey: 'configurationId',
  })

  // note: new Delivery Relations:
  // One-to-many relationship between Vehicle and Trips
  Vehicle.hasMany(Trip, {
    as: 'trips',
    foreignKey: 'vehicleId',
  })
  Trip.belongsTo(Vehicle, {
    as: 'vehicle',
    foreignKey: 'vehicleId',
  })

  // Many-to-many relationship between Trips and Drivers (through the TripDrivers table)
  Trip.belongsToMany(Driver, {
    through: TripDriver,
    foreignKey: 'tripId',
    otherKey: 'driverId',
    as: 'drivers',
  })
  Driver.belongsToMany(Trip, {
    through: TripDriver,
    foreignKey: 'driverId',
    otherKey: 'tripId',
    as: 'trips',
  })

  // One-to-many relationship between Delivery and DeliveryItems
  Delivery.hasMany(DeliveryItem, {
    as: 'items',
    foreignKey: 'deliveryId',
  })
  DeliveryItem.belongsTo(Delivery, {
    as: 'delivery',
    foreignKey: 'deliveryId',
  })

  // One-to-many relationship between ProductConfiguration and DeliveryItems
  ProductConfiguration.hasMany(DeliveryItem, {
    as: 'deliveryItems',
    foreignKey: 'configurationId',
  })
  DeliveryItem.belongsTo(ProductConfiguration, {
    as: 'product',
    foreignKey: 'configurationId',
  })

  // one-to-many relationship between DeliveryStop and Delivery
  DeliveryStop.hasMany(Delivery, {
    as: 'deliveries',
    foreignKey: 'deliveryStopId',
  })
  Delivery.belongsTo(DeliveryStop, {
    as: 'deliveryStop',
    foreignKey: 'deliveryStopId',
  })

  // one-to-many relationship between DeliveryMethod and Delivery
  DeliveryMethod.hasMany(Delivery, {
    as: 'deliveries',
    foreignKey: 'deliveryMethodId',
  })
  Delivery.belongsTo(DeliveryMethod, {
    as: 'deliveryMethod',
    foreignKey: 'deliveryMethodId',
  })

  // one-to-many relationship between Address and Delivery
  Address.hasMany(Delivery, {
    as: 'deliveries',
    foreignKey: 'shippingAddressId',
  })
  Delivery.belongsTo(Address, {
    as: 'shippingAddress',
    foreignKey: 'shippingAddressId',
  })

  // done: one-to-many relationship between Order and Delivery
  Order.hasMany(Delivery, {
    as: 'deliveries',
    foreignKey: 'orderId',

  })
  Delivery.belongsTo(Order, {
    as: 'order',
    foreignKey: 'orderId',
  })

  // done: one-to-many relationship between Address and DeliveryStops
  Address.hasMany(DeliveryStop, {
    as: 'deliveryStops',
    foreignKey: 'shippingAddressId',
  })
  DeliveryStop.belongsTo(Address, {
    as: 'shippingAddress',
    foreignKey: 'shippingAddressId',
  })

  // done: one-to-many relationship between Trip and DeliveryStops
  Trip.hasMany(DeliveryStop, {
    as: 'deliveryStops',
    foreignKey: 'tripId',
  })
  DeliveryStop.belongsTo(Trip, {
    as: 'trip',
    foreignKey: 'tripId',
  })

  // note: for "super M:N relationship" need to add:
  // note: one-to-many between RouteStops and RouteStopItems
  // note: one-to-many between ProductConfigurations and RouteStopItems"
}

export default createAssociations
