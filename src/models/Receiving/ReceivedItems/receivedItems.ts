// ReceivedItems/receivedItems.ts
// 13. ReceivedItems:
// id (PK)
// purchase_order_item_id (FK from PurchaseOrderItems)
// shipment_id (FK from Shipments, nullable)
// quantity_received
// received_date
// created_at
// updated_at

// One-to-many relationship between PurchaseOrderItems and ReceivedItems.
// One-to-many relationship between Shipments and ReceivedItems (nullable).
