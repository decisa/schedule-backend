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

// DONE: One-to-many relationship between Drivers and DriverDowntime.
import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes, ForeignKey,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from 'sequelize'
import type { Driver } from '../Driver/driver'

export class DriverDowntime extends Model<InferAttributes<DriverDowntime>, InferCreationAttributes<DriverDowntime>> {
  declare id: CreationOptional<number>
  // id (PK)

  declare startDate?: Date

  declare endDate?: Date

  declare startTime?: number // in minutes (nullable)

  declare endTime?: number // in minutes (nullable)

  declare recurring?: boolean

  declare daysOfWeek?: string // (nullable, comma-separated values, e.g., 'Mon,Tue,Wed')

  declare notes?: string

  // associations
  declare driverId: ForeignKey<Driver['id']>

  declare driver?: NonAttribute<Driver>

  declare public static associations: {
    driver: Association<DriverDowntime, Driver>,
  }

  // MIXINS
  // driver:
  declare getDriver: BelongsToGetAssociationMixin<Driver>

  declare setDriver: BelongsToSetAssociationMixin<Driver, number>

  declare createDriver: BelongsToCreateAssociationMixin<Driver>
}

export function initDriverDowntime(db: Sequelize) {
  DriverDowntime.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      startTime: DataTypes.INTEGER,
      endTime: DataTypes.INTEGER,
      recurring: DataTypes.BOOLEAN,
      daysOfWeek: DataTypes.STRING,
      notes: DataTypes.STRING,
    },
    {
      sequelize: db,
    },
  )
}
