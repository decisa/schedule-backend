import { DataTypes, QueryTypes } from 'sequelize'
import { Migration } from '../umzug'
import { consoleLogBlue } from '../src/utils/utils'

// add new fields to Orders table:
// billingAddressIdNew?: ForeignKey<Address['id']>
// shippingAddressIdNew?: ForeignKey<Address['id']>
// update ids using reference table between oldOrderAddressId and newAddressId
// remove old id columns
// rename new id columns

export const up: Migration = async ({ context: queryInterface }) => {
  // create transaction
  const transaction = await queryInterface.sequelize.transaction()
  let billingAddressIdNewAdded = false
  let shippingAddressIdNewAdded = false
  let removedOldShippingAddressId = false
  let removedOldBillingAddressId = false
  let renamedNewShippingAddressId = false
  let renamedNewBillingAddressId = false

  try {
    // add new columns to Orders table
    consoleLogBlue('up: adding "billingAddressIdNew" column to Orders table')
    await queryInterface.addColumn('Orders', 'billingAddressIdNew', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Addresses',
        key: 'id',
      },
    }, {
      transaction,
    })
    billingAddressIdNewAdded = true

    consoleLogBlue('up: adding "shippingAddressIdNew" column to Orders table')
    await queryInterface.addColumn('Orders', 'shippingAddressIdNew', {
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
      `UPDATE Orders o
       JOIN addressReference ar ON o.billingAddressId = ar.oldId
       SET o.billingAddressIdNew = ar.newId`,
      { transaction },
    )
    await queryInterface.sequelize.query(
      `UPDATE Orders o
       JOIN addressReference ar ON o.shippingAddressId = ar.oldId
       SET o.shippingAddressIdNew = ar.newId`,
      { transaction },
    )

    // get updated records
    const updatedOrders = await queryInterface.sequelize.query<{
      id: number
      billingAddressId: number
      billingAddressIdNew: number
    }>('SELECT id, billingAddressId, billingAddressIdNew, shippingAddressId, shippingAddressIdNew FROM Orders', {
      type: QueryTypes.SELECT,
      transaction,
    })

    // remove old columns
    await queryInterface.removeColumn('Orders', 'billingAddressId')
    consoleLogBlue('removed billingAddressId column')
    removedOldBillingAddressId = true

    await queryInterface.removeColumn('Orders', 'shippingAddressId')
    consoleLogBlue('removed shipping addressId column')
    removedOldShippingAddressId = true

    // rename new columns
    await queryInterface.renameColumn('Orders', 'billingAddressIdNew', 'billingAddressId')
    consoleLogBlue('renamed billingAddressIdNew to billingAddressId')
    renamedNewBillingAddressId = true

    await queryInterface.renameColumn('Orders', 'shippingAddressIdNew', 'shippingAddressId')
    consoleLogBlue('renamed shippingAddressIdNew to shippingAddressId')
    renamedNewShippingAddressId = true

    consoleLogBlue('updated orders: ')
    console.log(updatedOrders)

    // throw new Error('Not implemented')
    await transaction.commit()
    consoleLogBlue('up: complete - replaced Order Addresses in Orders with unified ones')
  } catch (error) {
    consoleLogBlue('rolling back: ', error)
    await transaction.rollback()
    // if any of the columns were added, remove them as adding columns is not transactional

    // if column was renamed, rename it back
    if (renamedNewBillingAddressId) {
      await queryInterface.renameColumn('Orders', 'billingAddressId', 'billingAddressIdNew')
      consoleLogBlue('renamed back billingAddressIdNew')
    }

    if (renamedNewShippingAddressId) {
      await queryInterface.renameColumn('Orders', 'shippingAddressId', 'shippingAddressIdNew')
      consoleLogBlue('renamed back shippingAddressIdNew')
    }

    // if column was removed, add it back
    if (removedOldBillingAddressId) {
      await queryInterface.addColumn('Orders', 'billingAddressId', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'OrderAddresses',
          key: 'id',
        },
      })
      // restore values of the old IDs
      await queryInterface.sequelize.query(
        `UPDATE Orders o
        JOIN addressReference ar ON o.billingAddressIdNew = ar.newId
        SET o.billingAddressId = ar.oldId`,
        // { transaction },
      )
      consoleLogBlue('restored billingAddressId and its values')
    }

    if (removedOldShippingAddressId) {
      await queryInterface.addColumn('Orders', 'shippingAddressId', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'OrderAddresses',
          key: 'id',
        },
      })
      // restore values of the old IDs
      await queryInterface.sequelize.query(
        `UPDATE Orders o
        JOIN addressReference ar ON o.shippingAddressIdNew = ar.newId
        SET o.shippingAddressId = ar.oldId`,
        // { transaction },
      )
      consoleLogBlue('restored shippingAddressId and its values')
    }

    if (billingAddressIdNewAdded) {
      await queryInterface.removeColumn('Orders', 'billingAddressIdNew')
      consoleLogBlue('removed billingAddressIdNew column')
    }
    if (shippingAddressIdNewAdded) {
      await queryInterface.removeColumn('Orders', 'shippingAddressIdNew')
      consoleLogBlue('removed shippingAddressIdNew column')
    }
    throw error
  }
}

export const down: Migration = async ({ context: queryInterface }) => {
  // fixme: would be nice to add transaction here and boolean flags for each step that is not supported by transaction, and rollback if error. errors may happen on down migrations too.
  await queryInterface.renameColumn('Orders', 'billingAddressId', 'billingAddressIdNew')
  consoleLogBlue('renamed back billingAddressIdNew')

  await queryInterface.renameColumn('Orders', 'shippingAddressId', 'shippingAddressIdNew')
  consoleLogBlue('renamed back shippingAddressIdNew')

  await queryInterface.addColumn('Orders', 'billingAddressId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'OrderAddresses',
      key: 'id',
    },
  })
  // restore values of the old IDs
  await queryInterface.sequelize.query(
    `UPDATE Orders o
    JOIN addressReference ar ON o.billingAddressIdNew = ar.newId
    SET o.billingAddressId = ar.oldId`,
  )
  consoleLogBlue('restored billingAddressId and its values')

  await queryInterface.addColumn('Orders', 'shippingAddressId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'OrderAddresses',
      key: 'id',
    },
  })
  // restore values of the old IDs
  await queryInterface.sequelize.query(
    `UPDATE Orders o
    JOIN addressReference ar ON o.shippingAddressIdNew = ar.newId
    SET o.shippingAddressId = ar.oldId`,
  )
  consoleLogBlue('restored shippingAddressId and its values')

  await queryInterface.removeColumn('Orders', 'billingAddressIdNew')
  consoleLogBlue('removed billingAddressIdNew column')

  await queryInterface.removeColumn('Orders', 'shippingAddressIdNew')
  consoleLogBlue('removed shippingAddressIdNew column')

  consoleLogBlue('down: restored Order Addresses in Orders with old ones')
}
