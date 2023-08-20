import {
  CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
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
  Association,
  Sequelize,
  DataTypes,
} from 'sequelize'
import type { Vehicle } from '../Vehicle/vehicle'
import type { Driver } from '../Driver/Driver'
import type { DeliveryStop } from '../DeliveryStop/DeliveryStop'

// done: One-to-many relationship between Vehicle and Trips
// done: many-to-many relationship between Trip and Drivers

export class Trip extends Model<InferAttributes<Trip>, InferCreationAttributes<Trip>> {
  declare id: CreationOptional<number>

  declare name: string | null

  declare start: Date

  declare end: Date

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // associations
  declare vehicleId: ForeignKey<Vehicle['id']>

  declare vehicle?: NonAttribute<Vehicle>

  declare drivers?: NonAttribute<Driver[]>

  declare deliveryStops?: NonAttribute<DeliveryStop[]>

  declare public static associations: {
    vehicle: Association<Trip, Vehicle>,
    deliveryStops: Association<Trip, DeliveryStop>,
  }

  // mixins
  // done: one-to-many relationship between Trip and DeliveryStops
  // DeliveryStops:
  declare createDeliveryStop: HasManyCreateAssociationMixin<DeliveryStop, 'tripId'>

  declare getDeliveryStops: HasManyGetAssociationsMixin<DeliveryStop>

  declare countDeliveryStops: HasManyCountAssociationsMixin

  declare hasDeliveryStop: HasManyHasAssociationMixin<DeliveryStop, number>

  declare hasDeliveryStops: HasManyHasAssociationsMixin<DeliveryStop, number>

  declare setDeliveryStops: HasManySetAssociationsMixin<DeliveryStop, number>

  declare addDeliveryStop: HasManyAddAssociationMixin<DeliveryStop, number>

  declare addDeliveryStops: HasManyAddAssociationsMixin<DeliveryStop, number>

  declare removeDeliveryStop: HasManyRemoveAssociationMixin<DeliveryStop, number>

  declare removeDeliveryStops: HasManyRemoveAssociationsMixin<DeliveryStop, number>

  // vehicle one-to-many relationship between Vehicle and Trips
  // vehicle:
  declare getVehicle: BelongsToGetAssociationMixin<Vehicle>

  declare setVehicle: BelongsToSetAssociationMixin<Vehicle, number>

  declare createVehicle: BelongsToCreateAssociationMixin<Vehicle>

  // drivers: many-to-many
  // drivers:
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

export function initTrip(db: Sequelize) {
  Trip.init(
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
      start: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      end: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      // timestamps:
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
