// DriverDowntime/driverDowntime.ts
// 20. DriverDowntime:
// id (PK)
// driver_id (FK from Drivers)
// start_date
// end_date
// start_time (nullable)
// end_time (nullable)
// recurring (boolean)
// days_of_week (nullable, comma-separated values, e.g., 'Mon,Tue,Wed')
// notes
// created_at

// One-to-many relationship between Drivers and DriverDowntime.
