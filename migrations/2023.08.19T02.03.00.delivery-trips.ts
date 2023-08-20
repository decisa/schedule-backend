import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('Trips', {
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
    // foreign keys:
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Vehicles',
        key: 'id',
      },
      // if vehicle is deleted, set this field to null
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
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
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('Trips')
}
