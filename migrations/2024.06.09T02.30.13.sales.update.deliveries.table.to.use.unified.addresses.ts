import { DataTypes, QueryTypes } from 'sequelize'
import { Migration } from '../umzug'
import { consoleLogBlue } from '../src/utils/utils'

// add new fields to Deliveries table:
// shippingAddressIdNew?: ForeignKey<Address['id']>
// update ids using reference table between oldOrderAddressId and newAddressId
// remove old id columns
// rename new id columns

export const up: Migration = async ({ context: queryInterface }) => {
  // create transaction
  const transaction = await queryInterface.sequelize.transaction()
  let shippingAddressIdNewAdded = false
  let removedOldShippingAddressId = false
  let renamedNewShippingAddressId = false

  try {
    // add new column to Deliveries table

    consoleLogBlue('up: adding "shippingAddressIdNew" column to Deliveries table')
    await queryInterface.addColumn('Deliveries', 'shippingAddressIdNew', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Addresses',
        key: 'id',
      },
    }, {
      transaction,
    })
    shippingAddressIdNewAdded = true

    // update orders with new address ids
    await queryInterface.sequelize.query(
      `UPDATE Deliveries d
       JOIN addressReference ar ON d.shippingAddressId = ar.oldId
       SET d.shippingAddressIdNew = ar.newId`,
      { transaction },
    )

    // get updated records
    const updatedDeliveries = await queryInterface.sequelize.query<{
      id: number
      shippingAddressId: number
      shippingAddressIdNew: number
    }>('SELECT id, shippingAddressId, shippingAddressIdNew FROM Deliveries', {
      type: QueryTypes.SELECT,
      transaction,
    })

    // remove old columns
    await queryInterface.removeColumn('Deliveries', 'shippingAddressId')
    consoleLogBlue('removed shipping addressId column')
    removedOldShippingAddressId = true

    // rename new columns
    await queryInterface.renameColumn('Deliveries', 'shippingAddressIdNew', 'shippingAddressId')
    consoleLogBlue('renamed shippingAddressIdNew to shippingAddressId')
    renamedNewShippingAddressId = true

    consoleLogBlue('updated deliveries: ')
    console.log(updatedDeliveries)

    // throw new Error('Not implemented')
    await transaction.commit()
    consoleLogBlue('up: complete - replaced Order Addresses in Deliveries with unified ones')
  } catch (error) {
    consoleLogBlue('rolling back: ', error)
    await transaction.rollback()
    // if any of the columns were added, remove them as adding columns is not transactional

    // if column was renamed, rename it back
    if (renamedNewShippingAddressId) {
      await queryInterface.renameColumn('Deliveries', 'shippingAddressId', 'shippingAddressIdNew')
      consoleLogBlue('renamed back shippingAddressIdNew')
    }

    // if column was removed, add it back
    if (removedOldShippingAddressId) {
      await queryInterface.addColumn('Deliveries', 'shippingAddressId', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'OrderAddresses',
          key: 'id',
        },
      })
      // restore values of the old IDs
      await queryInterface.sequelize.query(
        `UPDATE Deliveries d
        JOIN addressReference ar ON d.shippingAddressIdNew = ar.newId
        SET d.shippingAddressId = ar.oldId`,
        // { transaction },
      )
      consoleLogBlue('restored shippingAddressId and its values')
    }
    if (shippingAddressIdNewAdded) {
      await queryInterface.removeColumn('Deliveries', 'shippingAddressIdNew')
      consoleLogBlue('removed shippingAddressIdNew column')
    }
    throw error
  }
}

export const down: Migration = async ({ context: queryInterface }) => {
  // fixme: would be nice to add transaction here and boolean flags for each step that is not supported by transaction, and rollback if error. errors may happen on down migrations too.
  await queryInterface.renameColumn('Deliveries', 'shippingAddressId', 'shippingAddressIdNew')
  consoleLogBlue('renamed back shippingAddressIdNew')

  await queryInterface.addColumn('Deliveries', 'shippingAddressId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'OrderAddresses',
      key: 'id',
    },
  })
  // restore values of the old IDs
  await queryInterface.sequelize.query(
    `UPDATE Deliveries d
    JOIN addressReference ar ON d.shippingAddressIdNew = ar.newId
    SET d.shippingAddressId = ar.oldId`,
  )
  consoleLogBlue('restored shippingAddressId and its values')

  await queryInterface.removeColumn('Deliveries', 'shippingAddressIdNew')
  consoleLogBlue('removed shippingAddressIdNew column')

  consoleLogBlue('down: restored Order Addresses in Deliveries with old ones')
}
