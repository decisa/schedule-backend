// Vehicle/vehicle.ts
// 18. Vehicles:
// id (PK)
// type (e.g., 'truck', 'van')
// make
// model
// year
// maxVolume
// gvw
// size_restrictions (e.g., 'height', 'width', 'length')
// created_at
// updated_at

// done: One-to-many relationship between Vehicles and TripRoutes.
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
} from 'sequelize'
import type { TripRoute } from '../TripRoute/tripRoute'

type VehicleType = 'truck' | 'van'
export class Vehicle extends Model<InferAttributes<Vehicle>, InferCreationAttributes<Vehicle>> {
  declare id: CreationOptional<number>

  declare name: string

  declare height?: string

  declare width?: number

  declare length?: number

  declare gvw?: number

  declare axles?: number

  declare semi?: boolean

  declare hazMat?: boolean

  declare maxVolume?: number

  declare make?: string

  declare model?: string

  declare year?: number

  declare vin?: string

  declare type: VehicleType

  // associations
  declare tripRoutes?: NonAttribute<TripRoute[]>

  declare public static associations: {
    tripRoutes: Association<Vehicle, TripRoute>,
  }

  // MIXINS
  // tripRoutes:
  declare createTripRoute: HasManyCreateAssociationMixin<TripRoute, 'vehicleId'>

  declare getTripRoutes: HasManyGetAssociationsMixin<TripRoute>

  declare countTripRoutes: HasManyCountAssociationsMixin

  declare hasTripRoute: HasManyHasAssociationMixin<TripRoute, number>

  declare hasTripRoutes: HasManyHasAssociationsMixin<TripRoute, number>

  declare setTripRoutes: HasManySetAssociationsMixin<TripRoute, number>

  declare addTripRoute: HasManyAddAssociationMixin<TripRoute, number>

  declare addTripRoutes: HasManyAddAssociationsMixin<TripRoute, number>

  declare removeTripRoute: HasManyRemoveAssociationMixin<TripRoute, number>

  declare removeTripRoutes: HasManyRemoveAssociationsMixin<TripRoute, number>
}

export function initVehicle(db: Sequelize) {
  Vehicle.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      height: DataTypes.INTEGER,
      width: DataTypes.INTEGER,
      length: DataTypes.INTEGER,
      gvw: DataTypes.INTEGER,
      axles: DataTypes.INTEGER,
      semi: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      hazMat: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      maxVolume: DataTypes.INTEGER,
      make: DataTypes.STRING,
      model: DataTypes.STRING,
      year: DataTypes.INTEGER,
      vin: DataTypes.STRING,
      type: DataTypes.STRING,
    },
    {
      sequelize: db,
    },
  )
}
