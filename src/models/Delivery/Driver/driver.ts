// Driver/driver.ts
// 17. Drivers:
// id (PK)
// first_name
// last_name
// phone_number
// email
// DL_number
// driver_role (e.g., 'Helper', 'Master Installer')
// created_at
// updated_at

// TODO: Many-to-many relationship between TripRoutes and Drivers (through the RouteDrivers table).
// DONE: One-to-many relationship between Drivers and DriverDowntime.
import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin
  ,
} from 'sequelize'
import type { DriverDowntime } from '../DriverDowntime/driverDowntime'
import { TripRoute } from '../TripRoute/tripRoute'

type DriverRole = 'Helper' | 'Master Installer'
export class Driver extends Model<InferAttributes<Driver>, InferCreationAttributes<Driver>> {
  declare id: CreationOptional<number>

  declare firstName: string

  declare lastName: string

  declare phoneNumber: string

  declare email?: string

  declare licenceNumber: string

  declare driverRole: DriverRole

  // associations

  declare driverDowntimes?: NonAttribute<DriverDowntime>

  // declare orderId: ForeignKey<Order['id']>
  declare public static associations: {
    driverDowntimes: Association<Driver, DriverDowntime>,
  }

  // MIXINS
  // driverDowntimes:
  declare createDriverDowntime: HasManyCreateAssociationMixin<DriverDowntime, 'driverId'>

  declare getDriverDowntimes: HasManyGetAssociationsMixin<DriverDowntime>

  declare countDriverDowntimes: HasManyCountAssociationsMixin

  declare hasDriverDowntime: HasManyHasAssociationMixin<DriverDowntime, number>

  declare hasDriverDowntimes: HasManyHasAssociationsMixin<DriverDowntime, number>

  declare setDriverDowntimes: HasManySetAssociationsMixin<DriverDowntime, number>

  declare addDriverDowntime: HasManyAddAssociationMixin<DriverDowntime, number>

  declare addDriverDowntimes: HasManyAddAssociationsMixin<DriverDowntime, number>

  declare removeDriverDowntime: HasManyRemoveAssociationMixin<DriverDowntime, number>

  declare removeDriverDowntimes: HasManyRemoveAssociationsMixin<DriverDowntime, number>

  // tripRoutes:
  declare createTripRoute: BelongsToManyCreateAssociationMixin<TripRoute>

  declare setTripRoutes: BelongsToManySetAssociationsMixin<TripRoute, number>

  declare removeTripRoute: BelongsToManyRemoveAssociationMixin<TripRoute, number>

  declare removeTripRoutes: BelongsToManyRemoveAssociationsMixin<TripRoute, number>

  declare hasTripRoutes: BelongsToManyHasAssociationsMixin<TripRoute, number>

  declare hasTripRoute: BelongsToManyHasAssociationMixin<TripRoute, number>

  declare getTripRoutes: BelongsToManyGetAssociationsMixin<TripRoute>

  declare countTripRoutes: BelongsToManyCountAssociationsMixin

  declare addTripRoutes: BelongsToManyAddAssociationsMixin<TripRoute, number>

  declare addTripRoute: BelongsToManyAddAssociationMixin<TripRoute, number>
}

export function initDriver(db: Sequelize) {
  Driver.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: {
            msg: 'Please provide either valid email address or omit it altogether',
          },
        },
      },
      licenceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      driverRole: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize: db,
    },
  )
}
