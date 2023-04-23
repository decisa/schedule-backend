// TripRoute/tripRoute.ts
// 15. TripRoute:
// id (PK)
// route_name

// vehicle_id (FK from Vehicles)
// start_date
// end_date (nullable, for multi-day trips)
// delivery_start_time // included in start and end ?
// delivery_end_time // included in start and end ?
// status (e.g., 'Scheduled', 'In Progress', 'Completed', 'Cancelled')  ??
// created_at
// updated_at

// Many-to-many relationship between TripRoute and Drivers (through the DeliveryDrivers table).
// One-to-many relationship between Vehicles and TripRoute.
// One-to-many relationship between TripRoute and RouteStops.
