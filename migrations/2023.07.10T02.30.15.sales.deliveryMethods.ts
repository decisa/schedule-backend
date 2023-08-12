import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('DeliveryMethods', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,

    // foreign keys: - no fk
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
  await queryIterface.dropTable('DeliveryMethods')
}
