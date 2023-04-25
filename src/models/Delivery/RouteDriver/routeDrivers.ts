// RouteDriver/routeDrivers.ts
// 16. RouteDrivers
// id (PK)
// trip_route_id (FK from TripRoutes)
// driver_id (FK from Drivers)
// created_at
// updated_at
// todo: Many-to-many relationship between TripRoutes and Drivers (through the RouteDrivers table).
import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes, ForeignKey,
} from 'sequelize'
import type { Driver } from '../Driver/driver'

export class RouteDriver extends Model<InferAttributes<RouteDriver>, InferCreationAttributes<RouteDriver>> {
  declare id: CreationOptional<number>

  // associations
  declare driverId: ForeignKey<Driver['id']>

  // declare tripRouteId: ForeignKey<TripRoute['id']>

  // declare public static associations: {
  //   driver: Association<RouteDriver, Driver>,
  // }

  // MIXINS
}

export function initRouteDriver(db: Sequelize) {
  RouteDriver.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },

    },
    {
      sequelize: db,
      timestamps: false,
    },
  )
}
