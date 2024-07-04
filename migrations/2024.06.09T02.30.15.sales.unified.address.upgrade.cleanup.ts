import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'
import { Migration } from '../umzug'
import { consoleLogBlue } from '../src/utils/utils'

// migrate up:

// remove OrderAddressReferences table
// remove MagentoOrderAddresses table
// remove OrderAddresses table
// remove MagentoAddresses table
// rename MagentoAddressesUnified table to MagentoAddresses

async function createOrderAddressesTable(queryInterface: QueryInterface) {
  await queryInterface.createTable('OrderAddresses', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: DataTypes.STRING,
    street1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    altPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: DataTypes.STRING,
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 7),
      allowNull: true,
    },

    // foreign keys:
    // orderId: DataTypes.INTEGER.UNSIGNED, - will be added later
    customerAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Addresses',
        key: 'id',
      },
      // if customerAddressId is deleted, set this field to null
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    // timestamps:
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'Orders',
        key: 'id',
      },
      // if order is deleted, delete all of its addresses too.
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  })
}

async function createMagentoOrderAddressesTable(queryInterface: QueryInterface) {
  await queryInterface.createTable('MagentoOrderAddresses', {
    externalId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    externalCustomerAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    externalOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    addressType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // foreign keys:
    orderAddressId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'OrderAddresses',
        key: 'id',
      },
      // if orderAddress is deleted, delete this record too
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    // timestamps: - none
    // createdAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
    // updatedAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
  })

  // only one MagentoOrderAddress record per orderAddressId
  await queryInterface.addIndex('MagentoOrderAddresses', {
    fields: ['orderAddressId'],
    unique: true,
  })
}

async function createMagentoAddressTable(queryInterface: QueryInterface) {
  await queryInterface.createTable('MagentoAddresses', {
    externalId: {
      type: DataTypes.INTEGER,
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
  })

  // only one magento address record per addressId
  await queryInterface.addIndex('MagentoAddresses', {
    fields: ['addressId'],
    unique: true,
  })
}

async function createOrderAddressReferencesTable(queryInterface: QueryInterface) {
  await queryInterface.createTable('AddressReference', {
    oldId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // primaryKey: true,
      references: {
        model: 'OrderAddresses',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    newId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Addresses',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  })
}

async function restoreMagentoAddressRecords(queryInterface: QueryInterface) {
  const magentoRecords = await queryInterface.sequelize.query<{
    externalId: string
    addressType: string
    addressId: number
  }>('SELECT * FROM MagentoAddressesUnified WHERE externalId LIKE "customer.%"', {
    type: QueryTypes.SELECT,
  })

  const records = magentoRecords.map((record) => ({
    externalId: parseInt(record.externalId.replace('customer.', ''), 10),
    addressType: record.addressType,
    addressId: record.addressId,
  }))
  // insert records into MagentoAddresses table
  await queryInterface.bulkInsert('MagentoAddresses', records)
}

async function getOldAddresses(queryInterface: QueryInterface) {
  const orderAddresses = await queryInterface.sequelize.query<OrderAddressUnifiedRaw>(
    `SELECT a.*, mau.*, mo.externalId AS 'externalOrderId' 
          FROM Addresses a
          LEFT JOIN MagentoAddresses mau ON a.id = mau.addressId
          LEFT JOIN MagentoOrders mo ON a.orderId = mo.orderId
          WHERE a.type = 'order'
          `,
    {
      type: QueryTypes.SELECT,
    },
  )

  const parsedAddresses = orderAddresses.map((address) => {
    // externalId?: string
    // externalOrderId?: number
    // addressType?: string
    // addressId?: number
    const {
      id, type, externalId, externalOrderId, addressType, addressId, ...rest
    } = address

    const magento: MagentoOrderAddressOld | undefined = externalId ? {
      externalId: Number(externalId.replace('customer.', '')),
      addressType: addressType || 'shipping',
      externalOrderId: externalOrderId || null,
      orderAddressId: id,
    } : undefined

    return {
      id,
      ...rest,
      magento,
    } satisfies OrderAddressOld
  })
  return parsedAddresses
}

// insert address into Order Address table and return the id of the new record
async function insertOrderAddress(address: OrderAddressOld, queryInterface: QueryInterface): Promise<number> {
  const [newAddressId] = await queryInterface.sequelize.query(
    `INSERT INTO OrderAddresses (orderId, firstName, lastName,company, street1, street2,  city, state, zipCode, country, phone, altPhone, customerAddressId, notes, latitude, longitude, createdAt, updatedAt)
     VALUES (:orderId, :firstName, :lastName, :company, :street1, :street2, :city, :state, :zipCode, :country, :phone, :altPhone, :customerAddressId, :notes, :latitude, :longitude, :createdAt, :updatedAt)
    `,
    {
      replacements: address,
      type: QueryTypes.INSERT,
    },
  )
  return newAddressId
}

// insert magento record into MagentoOrderAddresses table
async function insertOrderMagentoRecord(parsedMagentoRecord: MagentoOrderAddressOld, queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    'INSERT INTO MagentoOrderAddresses (externalId, externalOrderId, addressType, orderAddressId) VALUES (:externalId, :externalOrderId, :addressType, :orderAddressId)',
    {
      replacements: parsedMagentoRecord,
      type: QueryTypes.INSERT,
    },
  )
}

// insert address into  OrderAddress table, including Magento record if exists and return the id of the new record
async function insertAddress(address: OrderAddressOld, queryInterface: QueryInterface): Promise<number> {
  const newAddressId = await insertOrderAddress(address, queryInterface)

  if (!newAddressId) {
    throw new Error('failed to copy address to OrderAddress table')
  }

  if (address.magento) {
    // assign new ID to the magento record
    const parsedMagentoRecord: MagentoOrderAddressOld = {
      externalOrderId: address.magento.externalOrderId,
      externalId: address.magento.externalId,
      addressType: address.magento.addressType || 'shipping',
      orderAddressId: newAddressId,
    }
    await insertOrderMagentoRecord(parsedMagentoRecord, queryInterface)
  }

  return newAddressId
}

async function saveIdReference(oldId:number, newId: number, queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(
    'INSERT INTO AddressReference (oldId, newId) VALUES (:oldId, :newId)',
    {
      replacements: { oldId, newId },
      type: QueryTypes.INSERT,
    },
  )
}

type OrderAddressUnifiedRaw = {
  type: string
  id: number
  firstName: string
  lastName: string
  company: string | null
  street1: string
  street2: string | null
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  altPhone: string | null
  customerAddressId: number | null
  notes: string | null
  latitude: number | null
  longitude: number | null
  createdAt: Date
  updatedAt: Date
  orderId: number
  // magento record fields
  externalId?: string
  externalOrderId?: number
  addressType?: string
  addressId?: number
}

type OrderAddressOld = {
  id: number
  firstName: string
  lastName: string
  company: string | null
  street1: string
  street2: string | null
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  altPhone: string | null
  customerAddressId: number | null
  notes: string | null
  latitude: number | null
  longitude: number | null
  createdAt: Date
  updatedAt: Date
  magento?: MagentoOrderAddressOld
}

type MagentoOrderAddressOld = {
  externalId: number
  externalOrderId: number | null
  addressType: string
  orderAddressId: number
}

export const up: Migration = async ({ context: queryInterface }) => {
  let removedAddressReference = false
  let removedMagentoOrderAddresses = false
  let removedOrderAddresses = false
  let removedMagentoAddresses = false
  let renamedMagentoAddresses = false

  try {
    // remove AddressReference table
    consoleLogBlue('up: removing AddressReference table')
    await queryInterface.dropTable('AddressReference', {
      force: true,
    })
    removedAddressReference = true

    // remove MagentoOrderAddresses table
    consoleLogBlue('up: removing MagentoOrderAddresses table')
    await queryInterface.dropTable('MagentoOrderAddresses', {
      force: true,
    })
    removedMagentoOrderAddresses = true

    // remove OrderAddresses table
    consoleLogBlue('up: removing OrderAddresses table')
    await queryInterface.dropTable('OrderAddresses', {
      force: true,
    })
    removedOrderAddresses = true

    // remove MagentoAddresses table
    consoleLogBlue('up: removing MagentoAddresses table')
    await queryInterface.dropTable('MagentoAddresses', {
      force: true,
    })
    removedMagentoAddresses = true

    // rename MagentoAddressesUnified table to MagentoAddresses
    consoleLogBlue('up: renaming MagentoAddressesUnified to MagentoAddresses')
    await queryInterface.renameTable('MagentoAddressesUnified', 'MagentoAddresses')
    renamedMagentoAddresses = true
  } catch (error) {
    if (renamedMagentoAddresses) {
      await queryInterface.renameTable('MagentoAddresses', 'MagentoAddressesUnified')
      consoleLogBlue('renamed back MagentoAddresses to MagentoAddressesUnified')
    }
    if (removedMagentoAddresses || removedOrderAddresses || removedMagentoOrderAddresses || removedAddressReference) {
      // if any of the tables were removed, drop the rest and recreate them, then restore data
      // note: drop tables
      await queryInterface.dropTable('MagentoAddresses', {
        force: true,
      })
      consoleLogBlue('dropped MagentoAddresses table')
      await queryInterface.dropTable('OrderAddresses', {
        force: true,
      })
      consoleLogBlue('dropped OrderAddresses table')
      await queryInterface.dropTable('MagentoOrderAddresses', {
        force: true,
      })
      consoleLogBlue('dropped MagentoOrderAddresses table')
      await queryInterface.dropTable('AddressReference', {
        force: true,
      })
      consoleLogBlue('dropped AddressReference table')

      // note: recreate tables
      // create MagentoAddresses table
      await createMagentoAddressTable(queryInterface)
      consoleLogBlue('created MagentoAddresses table')

      // create OrderAddresses table
      await createOrderAddressesTable(queryInterface)
      consoleLogBlue('created OrderAddresses table')

      // create MagentoOrderAddresses table
      await createMagentoOrderAddressesTable(queryInterface)
      consoleLogBlue('created MagentoOrderAddresses table')

      // create OrderAddressReferences table
      await createOrderAddressReferencesTable(queryInterface)
      consoleLogBlue('created OrderAddressReferences table')

      // note: restore data
      // get al magento records where external id contains 'customer' and parse them to be numbers instead of strings
      await restoreMagentoAddressRecords(queryInterface)

      // restore data of OrderAddresses and MagentoOrderAddresses, as well as the reference table based on the records from Addresses and MagentoAddressesUnified tables

      // get all records from Addresses table where type is 'order' and include MagentoAddressesUnified records, and parse them to be in old format
      const oldAddresses = await getOldAddresses(queryInterface)

      // insert records into OrderAddresses and MagentoOrderAddresses tables, and keep a reference in AddressReference table
      // restore every order address to OrderAddress table and keep the mapping
      for (let i = 0; i < oldAddresses.length; i += 1) {
        const address = oldAddresses[i]
        const newId = address.id
        const oldId = await insertAddress(address, queryInterface)

        // add the mapping to the reference table
        await saveIdReference(oldId, newId, queryInterface)
      }
    }
  }

  consoleLogBlue('up: all done. enjoy your unified addresses')
}

export const down: Migration = async ({ context: queryInterface }) => {
// export const down: Migration = () => {
  consoleLogBlue('revert upgrade')

  await queryInterface.renameTable('MagentoAddresses', 'MagentoAddressesUnified')
  consoleLogBlue('renamed back MagentoAddresses to MagentoAddressesUnified')

  // note: drop tables
  await queryInterface.dropTable('MagentoAddresses', {
    force: true,
  })
  consoleLogBlue('dropped MagentoAddresses table')
  await queryInterface.dropTable('OrderAddresses', {
    force: true,
  })
  consoleLogBlue('dropped OrderAddresses table')
  await queryInterface.dropTable('MagentoOrderAddresses', {
    force: true,
  })
  consoleLogBlue('dropped MagentoOrderAddresses table')
  await queryInterface.dropTable('AddressReference', {
    force: true,
  })
  consoleLogBlue('dropped AddressReference table')

  // note: recreate tables
  // create MagentoAddresses table
  await createMagentoAddressTable(queryInterface)
  consoleLogBlue('created MagentoAddresses table')

  // create OrderAddresses table
  await createOrderAddressesTable(queryInterface)
  consoleLogBlue('created OrderAddresses table')

  // create MagentoOrderAddresses table
  await createMagentoOrderAddressesTable(queryInterface)
  consoleLogBlue('created MagentoOrderAddresses table')

  // create OrderAddressReferences table
  await createOrderAddressReferencesTable(queryInterface)
  consoleLogBlue('created OrderAddressReferences table')

  // note: restore data
  // get al magento records where external id contains 'customer' and parse them to be numbers instead of strings
  await restoreMagentoAddressRecords(queryInterface)

  // restore data of OrderAddresses and MagentoOrderAddresses, as well as the reference table based on the records from Addresses and MagentoAddressesUnified tables

  // get all records from Addresses table where type is 'order' and include MagentoAddressesUnified records, and parse them to be in old format
  const oldAddresses = await getOldAddresses(queryInterface)

  // insert records into OrderAddresses and MagentoOrderAddresses tables, and keep a reference in AddressReference table
  // restore every order address to OrderAddress table and keep the mapping
  for (let i = 0; i < oldAddresses.length; i += 1) {
    const address = oldAddresses[i]
    const newId = address.id
    const oldId = await insertAddress(address, queryInterface)

    // add the mapping to the reference table
    await saveIdReference(oldId, newId, queryInterface)
  }

  consoleLogBlue('down: all done. enjoy your old addresses')

  // throw new Error('Sorry but revert is not implemented. Feel free to revert manually using logic below in comments')
  // migrate down:
  // rename MagentoAddresses table to MagentoAddressesUnified
  // create MagentoAddresses table
  // create OrderAddresses table
  // create MagentoOrderAddresses table
  // create OrderAddressReferences table
  // find all addresses of tyoe 'order'. parse them, convert magento records for external Ids to be numbers instead of strings, and c and insert them into OrderAddresses + MagentoOrderAddresses tables.
  // keep a reference table between oldOrderAddressId and newAddressId
}
