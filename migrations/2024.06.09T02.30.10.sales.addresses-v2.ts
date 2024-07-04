import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'
import { consoleLogBlue } from '../src/utils/utils'

const tableName = 'Addresses'

// add new fields to Address table:
// type: AddressType
// orderId?: ForeignKey<Order['id']>
// customerAddressId?: ForeignKey<Address['id']>
// to Address model

export const up: Migration = async ({ context: queryInterface }) => {
  const transaction = await queryInterface.sequelize.transaction()

  let typeAdded = false
  let orderIdAdded = false
  let customerAddressIdAdded = false

  try {
    // add type column to Address table and allow null values for now
    consoleLogBlue(`up: adding "type" column to ${tableName} table`)
    await queryInterface.addColumn(tableName, 'type', {
      type: DataTypes.STRING,
      allowNull: true,
    }, {
      transaction,
    })
    typeAdded = true

    consoleLogBlue(`up: adding "orderId" column to ${tableName} table`)
    // add orderId nullable column to Address table
    await queryInterface.addColumn(tableName, 'orderId', {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'Orders',
        key: 'id',
      },
      // if order is deleted, delete all of its addresses too.
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    }, {
      transaction,
    })
    orderIdAdded = true

    consoleLogBlue(`up: adding "customerAddressId" column to ${tableName} table`)
    // add customerAddressId nullable column to Address table
    await queryInterface.addColumn(tableName, 'customerAddressId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: tableName,
        key: 'id',
      },
      // if customer address is deleted, keep the order address and set reference to null
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    }, {
      transaction,
    })
    customerAddressIdAdded = true

    consoleLogBlue(`up: updating "type" column for all current records in ${tableName} table`)
    // Address table was for customer addresses only, so we need to update the type of existing records
    await queryInterface.bulkUpdate(
      tableName,
      // set type to customer
      {
        type: 'customer',
      },
      // where type is null
      {
        type: null,
      },
      {
        transaction,
      },
    )

    consoleLogBlue(`up: changing "type" column to be required for ${tableName} table`)
    // make type column not nullable
    await queryInterface.changeColumn(tableName, 'type', {
      type: DataTypes.STRING,
      allowNull: false,
    }, {
      transaction,
    })

    await transaction.commit()
    consoleLogBlue('up: added column type and prefilled it with "customer" type for all existing records in Address table. complete')
  } catch (error) {
    consoleLogBlue('unable to switch addresses to V2. error occured: ', error)
    await transaction.rollback()
    // if any of the columns were added, remove them as adding columns is not transactional
    if (typeAdded) {
      await queryInterface.removeColumn(tableName, 'type')
      consoleLogBlue('removed type column')
    }
    if (orderIdAdded) {
      await queryInterface.removeColumn(tableName, 'orderId')
      consoleLogBlue('removed orderId column')
    }
    if (customerAddressIdAdded) {
      await queryInterface.removeColumn(tableName, 'customerAddressId')
      consoleLogBlue('removed customerAddressId column')
    }
    throw error
  }
}

export const down: Migration = async ({ context: queryInterface }) => {
  // remove type column
  consoleLogBlue(`down: removing "type" column from ${tableName} table`)
  await queryInterface.removeColumn(tableName, 'type')
  // remove orderId column
  consoleLogBlue(`down: removing "orderId" column from ${tableName} table`)
  await queryInterface.removeColumn(tableName, 'orderId')
  // remove customerAddressId column
  consoleLogBlue(`down: removing "customerAddressId" column from ${tableName} table`)
  await queryInterface.removeColumn(tableName, 'customerAddressId')
  consoleLogBlue('down: complete')
}
