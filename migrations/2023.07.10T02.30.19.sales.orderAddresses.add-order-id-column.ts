import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.addColumn('OrderAddresses', 'orderId', {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: 'Orders',
      key: 'id',
    },
    // if order is deleted, delete all of its addresses too.
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.removeColumn('OrderAddresses', 'orderId')
}
