// 10. PurchaseOrderItems:

// id (PK)
// purchase_order_id (FK from PurchaseOrders)

// TODO: is it productconfiguration_id?
// product_id (FK from Products)
// quantity_ordered
// quantity_received
// created_at
// updated_at

// One-to-many relationship between PurchaseOrders and PurchaseOrderItems.
// One-to-many relationship between ProductConfigurations and PurchaseOrderItems.
// One-to-many relationship between PurchaseOrderItems and ShipmentItems.
// One-to-many relationship between PurchaseOrderItems and ReceivedItems.
