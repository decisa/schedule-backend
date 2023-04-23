// OrderAvailability/orderAvailability.ts
// 19. OrderAvailability:
// id (PK)
// order_id (FK from Orders)
// start_date
// end_date
// start_time (nullable)
// end_time (nullable)
// recurring (boolean)
// days_of_week (nullable, comma-separated values, e.g., 'Mon,Tue,Wed')
// notes
// created_at
// updated_at

// One-to-many relationship between Orders and OrderAvailability.
