// 12. ShipmentItems:
// id (PK)
// shipment_id (FK from Shipments)
// purchase_order_item_id (FK from PurchaseOrderItems)
// created_at
// updated_at

// ok One-to-many relationship between Shipments and ShipmentItems.
// ok One-to-many relationship between PurchaseOrderItems and ShipmentItems.

// One-to-many relationship between Customers and CustomerAddresses.
// One-to-many relationship between Customers and Orders.
// One-to-many relationship between Orders and OrderComments.
// One-to-many relationship between Orders and ProductConfigurations.
// One-to-many relationship between Products and ProductConfigurations.
// One-to-many relationship between ProductConfigurations and ConfigurationOptions.
// One-to-many relationship between Brands and Products.

// One-to-many relationship between Orders and PurchaseOrders.

// ok One-to-many relationship between Brands and PurchaseOrders.
// ok One-to-many relationship between PurchaseOrders and PurchaseOrderItems.

// ok One-to-many relationship between ProductConfigurations and PurchaseOrderItems.
// ok One-to-many relationship between PurchaseOrderItems and ShipmentItems.
// ok One-to-many relationship between PurchaseOrderItems and ReceivedItems.
// ok One-to-many relationship between Shipments and ReceivedItems (nullable).

// ok One-to-many relationship between Carriers and Shipments.
// ok One-to-many relationship between Shipments and ShipmentItems.

// ok One-to-many relationship between Vehicles and TripRoute.

// ok One-to-many relationship between TripRoute and RouteStops.
// ok One-to-many relationship between Orders and RouteStops. (nullable)
// ok One-to-one relationship between RouteStops and Order Addresses. (nullable)

// ok Many-to-many relationship between TripRoute and Drivers (through the RouteDrivers table).
// ok One-to-many relationship between Driver and DriverDowntime.
// ok One-to-many relationship between Order and OrderAvailability.
