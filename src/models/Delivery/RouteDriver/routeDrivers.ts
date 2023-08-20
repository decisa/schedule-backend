// RouteDriver/routeDrivers.ts
// 16. RouteDrivers
// id (PK)
// trip_route_id (FK from TripRoutes)
// driver_id (FK from Drivers)
// created_at
// updated_at
// done: Many-to-many relationship between TripRoutes and Drivers (through the RouteDrivers table).
import {
  InferAttributes, InferCreationAttributes, Model, Sequelize, ForeignKey,
} from 'sequelize'
import type { Driver } from '../Driver/Driver'
import type { TripRoute } from '../TripRoute/tripRoute'

export class RouteDriver extends Model<InferAttributes<RouteDriver>, InferCreationAttributes<RouteDriver>> {
  // associations
  declare driverId: ForeignKey<Driver['id']>

  declare tripRouteId: ForeignKey<TripRoute['id']>
}

export function initRouteDriver(db: Sequelize) {
  RouteDriver.init(
    {},
    {
      sequelize: db,
      timestamps: false,
    },
  )
}
