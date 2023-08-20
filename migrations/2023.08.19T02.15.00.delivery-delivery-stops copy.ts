import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  // reference table for drivers on a trip
  await queryIterface.createTable('DeliveryStops', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    stopType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stopNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    estimatedDurationString: DataTypes.STRING,
    notes: DataTypes.STRING,

    // foreign keys:
    // tripId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Trips',
    //     key: 'id',
    //   },
    //   // if trip is deleted, no need to keep record who were the drivers
    //   onDelete: 'CASCADE',
    //   onUpdate: 'CASCADE',
    // },

    // timestamps:
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('DeliveryStops')
}
