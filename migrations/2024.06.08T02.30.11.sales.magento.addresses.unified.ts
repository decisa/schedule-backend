import { DataTypes, QueryTypes } from 'sequelize'
import { Migration } from '../umzug'
// import { tableName } from '../src/models/Sales/MagentoAddress/magentoAddress'
import { consoleLogBlue } from '../src/utils/utils'

// create table for MagentoAddressesUnified

const tableName = 'MagentoAddressesUnified'
export const up: Migration = async ({ context: queryInterface }) => {
  let tableCreated = false
  // start a transaction
  const transaction = await queryInterface.sequelize.transaction()
  try {
    consoleLogBlue(`up: creating ${tableName} table`)
    await queryInterface.createTable(
      tableName,
      {
        externalId: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        addressType: {
          type: DataTypes.STRING,
        },
        // foreign keys:
        addressId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Addresses',
            key: 'id',
          },
          // if original address is deleted, delete this record too
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      { transaction },
    )
    consoleLogBlue(`up: ${tableName} table created`)
    tableCreated = true
    // only one magento address record per addressId
    await queryInterface.addIndex(
      tableName,
      {
        fields: ['addressId'],
        unique: true,
        transaction,
      },
    )
    consoleLogBlue('up: added index for addressId')

    // get all current records from MagentoAddresses and convert them to MagentoAddressesUnified (i.e. make externalId a string by adding 'customer.' prefix)
    const magentoRecords = await queryInterface.sequelize.query<{
      externalId: number
      addressType: string
      addressId: number
    }>('SELECT * FROM MagentoAddresses', {
      type: QueryTypes.SELECT,
      transaction,
    })
    const records = magentoRecords.map((record) => ({
      externalId: `customer.${record.externalId}`,
      addressType: record.addressType,
      addressId: record.addressId,
    }))

    consoleLogBlue('got all MagentoAddresses records and parsed to new format')
    await queryInterface.bulkInsert(tableName, records, { transaction })
    consoleLogBlue(`inserted ${records.length} records into ${tableName}`)
    await transaction.commit()
    consoleLogBlue('up: complete - created MagentoAddressesUnified table and copied data from MagentoAddresses')
  } catch (error) {
    console.error('Error copying data from MagentoAddresses to MagentoAddressesUnified', error)
    if (tableCreated) {
      consoleLogBlue('rolling back table creation')
      await queryInterface.dropTable(tableName, { transaction })
    }
    await transaction.rollback()
    // rethrow error to fail the migration
    throw error
  }
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable(tableName)
  consoleLogBlue(`down: dropped ${tableName} table`)
}
