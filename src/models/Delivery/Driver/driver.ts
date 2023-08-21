// done: Many-to-many relationship between Tris and Drivers (through the TripDrivers table).
// todo: One-to-many relationship between Drivers and DriverDowntime.
import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes,
  // HasManyCreateAssociationMixin,
  // HasManyGetAssociationsMixin,
  // HasManyCountAssociationsMixin,
  // HasManyHasAssociationMixin,
  // HasManyHasAssociationsMixin,
  // HasManySetAssociationsMixin,
  // HasManyAddAssociationMixin,
  // HasManyAddAssociationsMixin,
  // HasManyRemoveAssociationMixin,
  // HasManyRemoveAssociationsMixin,
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
import type { Trip } from '../Trip/Trip'

type DriverRole = 'Helper' | 'Master Installer'
export class Driver extends Model<InferAttributes<Driver>, InferCreationAttributes<Driver>> {
  declare id: CreationOptional<number>

  declare firstName: string

  declare lastName: string

  declare phoneNumber: string | null

  declare email: string | null

  declare licenceNumber: string | null

  declare driverRole: DriverRole

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // associations
  // fixme: UPDATE ALL ASSOCIATIONS

  // declare driverDowntimes?: NonAttribute<DriverDowntime[]>

  declare trips?: NonAttribute<Trip[]>

  declare public static associations: {
    // driverDowntimes: Association<Driver, DriverDowntime>,
    trips: Association<Driver, Trip>
  }

  // MIXINS
  // done: many-to-many relationship between Drivers and Trips (through the TripDrivers table).
  // trips:
  declare createTrip: BelongsToManyCreateAssociationMixin<Trip>

  declare setTrips: BelongsToManySetAssociationsMixin<Trip, number>

  declare removeTrip: BelongsToManyRemoveAssociationMixin<Trip, number>

  declare removeTrips: BelongsToManyRemoveAssociationsMixin<Trip, number>

  declare hasTrips: BelongsToManyHasAssociationsMixin<Trip, number>

  declare hasTrip: BelongsToManyHasAssociationMixin<Trip, number>

  declare getTrips: BelongsToManyGetAssociationsMixin<Trip>

  declare countTrips: BelongsToManyCountAssociationsMixin

  declare addTrips: BelongsToManyAddAssociationsMixin<Trip, number>

  declare addTrip: BelongsToManyAddAssociationMixin<Trip, number>
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
        allowNull: true,
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
        allowNull: true,
      },
      driverRole: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize: db,
    },
  )
}
