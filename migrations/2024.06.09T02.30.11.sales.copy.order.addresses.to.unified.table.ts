import {
  DataTypes, QueryInterface, QueryTypes, Transaction,
} from 'sequelize'
import { Migration } from '../umzug'
import { consoleLogBlue } from '../src/utils/utils'

type OrderAddressOldRaw = {
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
  // magento record fields
  externalId?: number
  externalCustomerAddressId?: number
  externalOrderId?: number
  addressType?: string
  orderAddressId?: number
}

type OrderAddressNew = {
  id: number
  type: 'order'
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
  magento?: MagentoAddressNew
}

type MagentoAddressNew = {
  externalId: string
  addressType: string
  addressId: number
}

async function getExistingOrderAddresses(queryInterface: QueryInterface, transaction: Transaction): Promise<OrderAddressNew[]> {
  const orderAddresses = await queryInterface.sequelize.query<OrderAddressOldRaw>(
    `SELECT * FROM OrderAddresses
       LEFT JOIN MagentoOrderAddresses ON OrderAddresses.id = MagentoOrderAddresses.orderAddressId
      `,
    {
      type: QueryTypes.SELECT,
      transaction,
    },
  )

  const parsedAddresses = orderAddresses.map((address) => {
    const {
      id, externalId, externalCustomerAddressId, externalOrderId, addressType, orderAddressId, ...rest
    } = address

    const magento: MagentoAddressNew | undefined = externalId ? {
      externalId: `order.${externalId}`,
      addressType: addressType || 'shipping',
      addressId: id,
    } : undefined

    return {
      id,
      type: 'order',
      ...rest,
      magento,
    } satisfies OrderAddressNew
  })
  return parsedAddresses
}

// insert address into unified Address table and return the id of the new record
async function insertUnifiedAddress(address: OrderAddressNew, queryInterface: QueryInterface, t?: Transaction): Promise<number> {
  const [newAddressId] = await queryInterface.sequelize.query(
    `INSERT INTO Addresses (type, orderId, firstName, lastName,company, street1, street2,  city, state, zipCode, country, phone, altPhone, customerAddressId, notes, latitude, longitude, createdAt, updatedAt)
     VALUES (:type, :orderId, :firstName, :lastName, :company, :street1, :street2, :city, :state, :zipCode, :country, :phone, :altPhone, :customerAddressId, :notes, :latitude, :longitude, :createdAt, :updatedAt)
     
    `,
    {
      replacements: address,
      type: QueryTypes.INSERT,
      transaction: t,
    },
  )
  return newAddressId
}

// insert magento record into MagentoAddressesUnified table
async function insertMagentoRecord(parsedMagentoRecord: MagentoAddressNew, queryInterface: QueryInterface, transaction?: Transaction): Promise<void> {
  await queryInterface.sequelize.query(
    'INSERT INTO MagentoAddressesUnified (externalId, addressType, addressId) VALUES (:externalId, :addressType, :addressId)',
    {
      replacements: parsedMagentoRecord,
      type: QueryTypes.INSERT,
      transaction,
    },
  )
}

// insert address into unified Address table, including Magento record if exists and return the id of the new record
async function insertAddress(address: OrderAddressNew, queryInterface: QueryInterface, transaction?: Transaction): Promise<number> {
  const newAddressId = await insertUnifiedAddress(address, queryInterface, transaction)

  if (!newAddressId) {
    throw new Error('failed to copy address to Unified Address table')
  }

  if (address.magento) {
    // assign new ID to the magento record
    const parsedMagentoRecord = {
      externalId: address.magento.externalId,
      addressType: address.magento.addressType || 'shipping',
      addressId: newAddressId,
    }
    await insertMagentoRecord(parsedMagentoRecord, queryInterface, transaction)
  }

  return newAddressId
}

async function saveIdReference(oldId:number, newId: number, queryInterface: QueryInterface, transaction: Transaction) {
  await queryInterface.sequelize.query(
    'INSERT INTO AddressReference (oldId, newId) VALUES (:oldId, :newId)',
    {
      replacements: { oldId, newId },
      type: QueryTypes.INSERT,
      transaction,
    },
  )
}

export const up: Migration = async ({ context: queryInterface }) => {
  const transaction = await queryInterface.sequelize.transaction()
  let referenceTableCreated = false

  try {
    // add type column to Address table and allow null values for now
    consoleLogBlue('up: creating reference table to keep track of old IDs mapping')
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
    }, {
      // transaction,
    })
    referenceTableCreated = true

    // get all order addresses , inset them into unified Address table and add mapping to reference table
    consoleLogBlue('up: inserting order addresses into unified Address table and adding mapping to reference table')

    const parsedAddresses = await getExistingOrderAddresses(queryInterface, transaction)

    // import every order address to address table and keep the mapping
    for (let i = 0; i < parsedAddresses.length; i += 1) {
      const address = parsedAddresses[i]
      const oldId = address.id
      const newAddressId = await insertAddress(address, queryInterface, transaction)

      // add the mapping to the reference table
      await saveIdReference(oldId, newAddressId, queryInterface, transaction)
    }

    await transaction.commit()
    consoleLogBlue('up: complete - converted all order addresses to unified Address table and added mapping to reference table')
  } catch (error) {
    consoleLogBlue('unable to merge address tables: ', error)
    await transaction.rollback()
    // if any of the columns were added, remove them as adding columns is not transactional
    if (referenceTableCreated) {
      await queryInterface.dropTable(
        'AddressReference',
        {
          force: true,
        },
      )
      consoleLogBlue('dropped AddressReference table')
    }

    throw error
  }
}

export const down: Migration = async ({ context: queryInterface }) => {
  // remove billingAddressIdNew column
  consoleLogBlue('down: removing all order addresses from unified table table')
  await queryInterface.bulkDelete('Addresses', {
    type: 'order',
  })
  // drop reference table
  await queryInterface.dropTable(
    'AddressReference',
    {
      force: true,
    },
  )
  consoleLogBlue('dropped AddressReference table')

  consoleLogBlue('down: removed all order addresses from unified table')
}
