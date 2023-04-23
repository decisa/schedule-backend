// DeliveryRoute/deliveryRoute.ts
// 15. DeliveryRoutes:
// id (PK)
// order_id (FK from Orders) - NO // TODO: REMOVE
// vehicle_id (FK from Vehicles)
// delivery_start_date
// delivery_end_date
// delivery_start_time
// delivery_end_time
// status (e.g., 'Scheduled', 'In Progress', 'Completed', 'Cancelled')
// created_at
// updated_at

// One-to-many relationship between Orders and DeliveryRoutes. // TODO: REMOVE
// Many-to-many relationship between DeliveryRoutes and Drivers (through the DeliveryDrivers table).
// One-to-many relationship between Vehicles and DeliveryRoutes.
// One-to-many relationship between DeliveryRoutes and RouteStops.
