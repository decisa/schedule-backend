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
import type { Trip } from '../Trip/Trip'

type VehicleType = 'truck' | 'van'
export class Vehicle extends Model<InferAttributes<Vehicle>, InferCreationAttributes<Vehicle>> {
  declare id: CreationOptional<number>

  declare name: string

  declare height: number | null // inches

  declare width: number | null

  declare length: number | null

  declare gvw: number | null

  declare axles: number | null

  declare semi: boolean // default false

  declare hazMat: boolean // default false

  declare maxVolume: number | null

  declare make: string | null

  declare model: string | null

  declare year: number | null

  declare vin: string | null

  declare type: VehicleType

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // associations
  declare trips?: NonAttribute<Trip[]>

  declare public static associations: {
    trips: Association<Vehicle, Trip>,
  }

  // MIXINS
  // One-to-many relationship between Vehicle and Trips
  // Trips:
  declare createTrip: HasManyCreateAssociationMixin<Trip, 'vehicleId'>

  declare getTrips: HasManyGetAssociationsMixin<Trip>

  declare countTrips: HasManyCountAssociationsMixin

  declare hasTrip: HasManyHasAssociationMixin<Trip, number>

  declare hasTrips: HasManyHasAssociationsMixin<Trip, number>

  declare setTrips: HasManySetAssociationsMixin<Trip, number>

  declare addTrip: HasManyAddAssociationMixin<Trip, number>

  declare addTrips: HasManyAddAssociationsMixin<Trip, number>

  declare removeTrip: HasManyRemoveAssociationMixin<Trip, number>

  declare removeTrips: HasManyRemoveAssociationsMixin<Trip, number>
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
