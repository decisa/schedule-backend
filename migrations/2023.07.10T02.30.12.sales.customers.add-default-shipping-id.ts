import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.addColumn('Customers', 'defaultShippingId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Addresses',
      key: 'id',
    },
    // if address is deleted, set defaultShippingId to null
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.removeColumn('Customers', 'defaultShippingId')
}
