import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

const tableName = 'PurchaseOrderItems'
const oldColumnName = 'qtyOrdered'
const newColumnName = 'qtyPurchased'

export const up: Migration = async ({ context: queryIterface }) => {
  console.log(`up: changing column name from ${oldColumnName} to ${newColumnName} on table ${tableName}`)
  await queryIterface.renameColumn(tableName, oldColumnName, newColumnName)
  console.log('up: complete')
}

export const down: Migration = async ({ context: queryIterface }) => {
  console.log(`down: reverting column rename from ${newColumnName} back to ${oldColumnName}on table ${tableName}`)
  await queryIterface.renameColumn(tableName, newColumnName, oldColumnName)
  console.log('down: complete')
}
