import {
  CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model,
  Sequelize,
  DataTypes,
} from 'sequelize'
import { Trip } from '../Trip/Trip'
import { Driver } from '../Driver/Driver'

export class TripDriver extends Model<InferAttributes<TripDriver>, InferCreationAttributes<TripDriver>> {
  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // associations
  declare driverId: ForeignKey<Driver['id']>

  declare tripId: ForeignKey<Trip['id']>

  // declare drivers?: NonAttribute<Driver[]>

  // declare trip?: NonAttribute<Trip>

  // declare public static associations: {
  //   vehicle: Association<Trip, Vehicle>,
  // }

  // mixins
}

export function initTripDriver(db: Sequelize) {
  TripDriver.init(
    {
      tripId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Trips',
          key: 'id',
        },
      },
      driverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Drivers',
          key: 'id',
        },
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
