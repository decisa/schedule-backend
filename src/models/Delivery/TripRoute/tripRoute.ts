// TripRoute/tripRoute.ts
// 15. TripRoute:
// id (PK)
// route_name
// start_date
// end_date (nullable, for multi-day trips)
// delivery_start_time // included in start and end ?
// delivery_end_time // included in start and end ?
// status (e.g., 'Scheduled', 'In Progress', 'Completed', 'Cancelled')  ??

// vehicle_id (FK from Vehicles)
// created_at
// updated_at

// todo: Many-to-many relationship between TripRoute and Drivers (through the routeDrivers table).
// todo: One-to-many relationship between Vehicles and TripRoute.
// todo: One-to-many relationship between TripRoute and RouteStops.
import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin,
} from 'sequelize'
import type { Driver } from '../Driver/driver'
// import type { RouteDriver } from '../RouteDriver/routeDrivers'

type TripRouteStatus = 'scheduled' | 'in progress' | 'completed' | 'cancelled'
export class TripRoute extends Model<InferAttributes<TripRoute>, InferCreationAttributes<TripRoute>> {
  declare id: CreationOptional<number>

  declare name?: string

  declare startDate: Date

  declare endDate: Date

  declare startTime: number

  declare endTime: number

  declare status: TripRouteStatus

  // associations

  declare drivers?: NonAttribute<Driver[]>

  // declare orderId: ForeignKey<Order['id']>
  declare public static associations: {
    drivers: Association<TripRoute, Driver>,
  }

  // MIXINS
  // products:
  declare createDriver: BelongsToManyCreateAssociationMixin<Driver>

  declare setDrivers: BelongsToManySetAssociationsMixin<Driver, number>

  declare removeDriver: BelongsToManyRemoveAssociationMixin<Driver, number>

  declare removeDrivers: BelongsToManyRemoveAssociationsMixin<Driver, number>

  declare hasDrivers: BelongsToManyHasAssociationsMixin<Driver, number>

  declare hasDriver: BelongsToManyHasAssociationMixin<Driver, number>

  declare getDrivers: BelongsToManyGetAssociationsMixin<Driver>

  declare countDrivers: BelongsToManyCountAssociationsMixin

  declare addDrivers: BelongsToManyAddAssociationsMixin<Driver, number>

  declare addDriver: BelongsToManyAddAssociationMixin<Driver, number>
}

export function initTripRoute(db: Sequelize) {
  TripRoute.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      startTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize: db,
    },
  )
}
