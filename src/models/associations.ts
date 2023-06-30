import { Address } from './Sales/Address/address'
import { Brand } from './Brand/brand'
import { Customer } from './Sales/Customer/customer'
import { MagentoAddress } from './Sales/MagentoAddress/magentoAddress'
import { MagentoCustomer } from './Sales/MagentoCustomer/magentoCustomer'
import { MagentoOrder } from './Sales/MagentoOrder/magentoOrder'
import { MagentoOrderAddress } from './Sales/MagentoOrderAddress/magentoOrderAddress'
import { Order } from './Sales/Order/order'
import { OrderAddress } from './Sales/OrderAddress/orderAddress'
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
import { TripRoute } from './Delivery/TripRoute/tripRoute'
import { Driver } from './Delivery/Driver/driver'
import { RouteDriver } from './Delivery/RouteDriver/routeDrivers'
import { DriverDowntime } from './Delivery/DriverDowntime/driverDowntime'
import { OrderAvailability } from './Delivery/OrderAvailability/orderAvailability'
import { RouteStop } from './Delivery/RouteStop/routeStop'
import { Vehicle } from './Delivery/Vehicle/vehicle'
import { RouteStopItem } from './Delivery/RouteStopItem/routeStopItem'
import { DeliveryMethod } from './Sales/DeliveryMethod/deliveryMethod'

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

  Order.belongsTo(OrderAddress, {
    as: 'shippingAddress',
    targetKey: 'id',
    foreignKey: 'shippingAddressId',
    // onDelete: 'NO ACTION',
    constraints: false,
  })

  // BILLING ADDRESS FOR ORDER:
  Order.belongsTo(OrderAddress, {
    as: 'billingAddress',
    foreignKey: 'billingAddressId',
    // onDelete: 'NO ACTION',
    constraints: false,
  })

  // One-to-many relationship between Orders and OrderAddresses.
  OrderAddress.belongsTo(Order, {
    as: 'order',
    targetKey: 'id',
    foreignKey: 'orderId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })

  Order.hasMany(OrderAddress, {
    as: 'addresses',
    sourceKey: 'id',
    foreignKey: 'orderId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })

  // some addresses have a magento record:
  // One-to-one relationship between OrderAddresses and MagentoOrderAddresses
  OrderAddress.hasOne(MagentoOrderAddress, {
    as: 'magento',
    sourceKey: 'id',
    foreignKey: 'orderAddressId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  MagentoOrderAddress.belongsTo(OrderAddress, {
    as: 'orderAddress',
    foreignKey: 'orderAddressId',
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
    foreignKey: 'productConfigurationId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  PurchaseOrderItem.belongsTo(ProductConfiguration, {
    as: 'productConfiguration',
    foreignKey: 'productConfigurationId',
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
  // One-to-many relationship between PurchaseOrderItems and ReceivedItems.
  PurchaseOrderItem.hasMany(ReceivedItem, {
    as: 'receivedItems',
    foreignKey: 'purchaseOrderItemId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ReceivedItem.belongsTo(PurchaseOrderItem, {
    as: 'purchaseOrderItem',
    foreignKey: 'purchaseOrderItemId',
  })
  // One-to-many relationship between Shipments and ReceivedItems (nullable).
  Shipment.hasMany(ReceivedItem, {
    as: 'receivedItems',
    foreignKey: 'shipmentId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ReceivedItem.belongsTo(Shipment, {
    as: 'shipment',
    foreignKey: 'shipmentId',
  })
  // One-to-many relationship between Shipments and ShipmentItems.
  Shipment.hasMany(ShipmentItem, {
    as: 'shipmentItems',
    foreignKey: 'shipmentId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ShipmentItem.belongsTo(Shipment, {
    as: 'shipment',
    foreignKey: 'shipmentId',
  })

  // note: *************  SHIPPING ****************
  // Many-to-many relationship between TripRoutes and Drivers (through the RouteDrivers table)
  TripRoute.belongsToMany(Driver, {
    through: RouteDriver,
    foreignKey: 'tripRouteId',
    otherKey: 'driverId',
  })
  Driver.belongsToMany(TripRoute, {
    through: RouteDriver,
    foreignKey: 'driverId',
    otherKey: 'tripRouteId',
  })
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
  // One-to-many relationship between TripRoute and RouteStops.
  TripRoute.hasMany(RouteStop, {
    as: 'routeStops',
    foreignKey: 'tripRouteId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  RouteStop.belongsTo(TripRoute, {
    as: 'tripRoute',
    foreignKey: 'tripRouteId',
  })
  // One-to-many relationship between Orders and RouteStops.
  Order.hasMany(RouteStop, {
    as: 'routeStops',
    foreignKey: 'orderId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  RouteStop.belongsTo(Order, {
    as: 'order',
    foreignKey: 'orderId',
  })
  // One-to-many relationship between OrderAddresses and RouteStops. (nullable)
  OrderAddress.hasMany(RouteStop, {
    as: 'routeStops',
    foreignKey: 'orderAddressId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  RouteStop.belongsTo(OrderAddress, {
    as: 'orderAddress',
    foreignKey: 'orderAddressId',
  })
  // Many-to-many relationship between RouteStops and ProductConfigurations through RouteStopItems
  RouteStop.belongsToMany(ProductConfiguration, {
    through: RouteStopItem,
    foreignKey: 'routeStopId',
    otherKey: 'productConfigurationId',
  })
  ProductConfiguration.belongsToMany(RouteStop, {
    through: RouteStopItem,
    foreignKey: 'productConfigurationId',
    otherKey: 'routeStopId',
  })
  // One-to-many relationship between Vehicles and TripRoutes.
  Vehicle.hasMany(TripRoute, {
    as: 'tripRoutes',
    foreignKey: 'vehicleId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  TripRoute.belongsTo(Vehicle, {
    as: 'vehicle',
    foreignKey: 'vehicleId',
  })

  // note: for "super M:N relationship" need to add:
  // note: one-to-many between RouteStops and RouteStopItems
  // note: one-to-many between ProductConfigurations and RouteStopItems"
}

export default createAssociations
