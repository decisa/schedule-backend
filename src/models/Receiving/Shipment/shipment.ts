// 11 Shipments:

// id (PK)
// shipment_number
// shipper_id (FK from Carriers)
// eta (nullable)
// actual_arrival_date (nullable)
// created_at
// updated_at

// One-to-many relationship between Carriers and Shipments.
// One-to-many relationship between Shipments and ShipmentItems.
// One-to-many relationship between Shipments and ReceivedItems (nullable).
