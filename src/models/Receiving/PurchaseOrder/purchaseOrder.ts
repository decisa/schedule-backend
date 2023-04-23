// PurchaseOrders:
// id (PK)
// order_id (FK from Orders)
// brand_id (FK from Brands)
// status (e.g. 'Pending', 'In Production', 'Shipped', 'Received')
// submitted-date
// created_at
// updated_at

// One-to-many relationship between Orders and PurchaseOrders.
// One-to-many relationship between PurchaseOrders and PurchaseOrderItems.
// One-to-many relationship between Brands and PurchaseOrders.
