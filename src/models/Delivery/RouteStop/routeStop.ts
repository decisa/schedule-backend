// TODO: how do you track which items and quantities from the order are being delivered? how do you check if there are any outstanding items on the order?
// planning to have a pool of routeStops that are pending to be scheduled (i.e added to the TripRoute)

// RouteStop/routeStop.ts
// 15-2 RouteStops:
// id (PK)
// trip_route_id (FK from TripRoute)
// order_id (FK from Orders, nullable for non-delivery stops)
// address_id (FK from OrderAddresses, nullable)
// status (e.g., 'Scheduled', 'In Progress', 'Completed', 'Cancelled' , 'Pending')

// stop_type (e.g., 'break', 'hotel', 'delivery', etc.)
// stop_number nullable
// estimated_arrival_time
// estimated_duration
// actual_arrival_time (nullable)
// notes
// created_at
// updated_at

// One-to-many relationship between TripRoute and RouteStops.
// One-to-many relationship between Orders and RouteStops.
// One-to-one relationship between RouteStops and OrderAddresses. (nullable)
// many-to-many relationship between RouteStops and ProductConfigurations through RouteStopItems
