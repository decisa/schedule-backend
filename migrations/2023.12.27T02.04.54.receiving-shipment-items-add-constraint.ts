import { Migration } from '../umzug'

const tableName = 'ShipmentItems'
const constraintFields = ['shipmentId', 'purchaseOrderItemId'] as const
const constraintName = `${constraintFields.join('_')}_constraint`
const summaryField = 'qtyShipped'

type ConstraintFields = typeof constraintFields[number]
// add constraint to ShipmentItems table to ensure that a PurchaseOrderItem can only be shipped once per Shipment

export const up: Migration = async ({ context: queryInterface }) => {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    console.log('----------------------------------------')
    console.log('up: finding duplicates in', tableName)
    type DuplicateShape = {
      minId: number
      totalQty: number
    } & Record<ConstraintFields, string>
    const duplicates = await queryInterface.sequelize.query(`
      SELECT MIN(id) as minId, ${constraintFields.join(', ')}, SUM(${summaryField}) AS totalQty
      FROM ${tableName} 
      GROUP BY ${constraintFields.join(', ')} 
      HAVING COUNT(*) > 1;    
    `, { type: 'SELECT', transaction }) as DuplicateShape[]
    console.log('up: found', duplicates.length, 'duplicates')
    console.log('duplicates:', duplicates)

    // Consolidate duplicates
    for (let i = 0; i < duplicates.length; i += 1) {
      const duplicate = duplicates[i]
      const {
        minId,
        totalQty,
      } = duplicate

      // Update one of the records with the total quantity
      console.log('up: updating total qty Shipped to', totalQty)
      await queryInterface.sequelize.query(`
        UPDATE ${tableName}
        SET ${summaryField} = ${totalQty}
        WHERE id = ${minId}
      `, {
        type: 'UPDATE',
        transaction,
      })

      // Remove the other duplicate records
      console.log('up: removing duplicates for', duplicate)
      await queryInterface.sequelize.query(`
        DELETE FROM ${tableName}
        WHERE id != ${minId} AND 
              ${constraintFields.map((field) => `${field} = '${duplicate[field]}'`).join(' AND ')}
      `, {
        type: 'DELETE',
        transaction,
      })
    }

    console.log(`up: adding constraint ${constraintName} to table ${tableName}`)
    await queryInterface.addConstraint(tableName, {
      fields: [...constraintFields],
      type: 'unique',
      name: constraintName,
      transaction,
    })
    await transaction.commit()
    console.log('up: complete')
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const down: Migration = async ({ context: queryInterface }) => {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    console.log('----------------------------------------')
    console.log(`down: removing constraint ${constraintName} from table ${tableName}`)
    // await queryInterface.addIndex(tableName, ['shipmentId'], { name: 'shipmentId', transaction })
    // await queryInterface.removeConstraint(tableName, 'shipmentitems_ibfk_1', { transaction })
    await queryInterface.removeConstraint(tableName, constraintName, { transaction })
    // re-add foreign key constraint
    // await queryInterface.addConstraint(tableName, {
    //   fields: ['shipmentId'],
    //   type: 'foreign key',
    //   name: 'shipmentitems_ibfk_1',
    //   references: {
    //     table: 'Shipments',
    //     field: 'id',
    //   },
    //   // if shipment is deleted, delete these records too
    //   onDelete: 'CASCADE',
    //   onUpdate: 'CASCADE',
    //   transaction,
    // })
    console.log('down: complete')
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
