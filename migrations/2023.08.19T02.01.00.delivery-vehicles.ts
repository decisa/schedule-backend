import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('Vehicles', {
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
    type: DataTypes.STRING, // truck or van
    // foreign keys:
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
  await queryIterface.dropTable('Vehicles')
}
