// TODO: how do you track which items and quantities from the order are being delivered? how do you check if there are any outstanding items on the order?
// planning to have a pool of routeStops that are pending to be scheduled (i.e added to the deliveryRoute)

// RouteStop/routeStop.ts
// 15-2 RouteStops:
// id (PK)
// delivery_route_id (FK from DeliveryRoutes)
// order_id (FK from Orders, nullable)
// address_id (FK from CustomerAddresses, nullable)
// status (e.g., 'Scheduled', 'In Progress', 'Completed', 'Cancelled' , 'Pending')

// stop_type (e.g., 'Order Delivery', 'Lunch Break', 'Hotel Stop')
// stop_number nullable
// estimated_arrival_time
// estimated_duration
// actual_arrival_time (nullable)
// notes
// created_at
// updated_at

// One-to-many relationship between DeliveryRoutes and RouteStops.
// One-to-many relationship between Orders and RouteStops.
// One-to-one relationship between RouteStops and OrderAddresses. (nullable)
