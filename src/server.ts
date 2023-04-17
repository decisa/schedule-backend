import {
  Attributes, InferAttributes, Model, QueryTypes, Sequelize,
} from 'sequelize'
import app from './app'
import db from './models'
import { Address } from './models/Address/address'
import { Customer } from './models/Customer/customer'
import { MagentoCustomer } from './models/MagentoCustomer/magentoCustomer'
import { MagentoOrder } from './models/MagentoOrder/magentoOrder'
import { Order } from './models/Order/order'
import { OrderAddress } from './models/OrderAddress/orderAddress'
// import Customer from './models/Customer/customer'
// import MagentoOrder from './models/MagentoOrder/magentoOrder'
// import Order from './models/Order/order'
// import createAssociations from './models/associations'

const port = 9000

// console.log('order instance:', Order)

const constraintExistsQuery = ({
  dbName,
  tableName,
  constraintName,
}: {
  dbName: string,
  tableName: string,
  constraintName: string,
}) => `
SELECT COUNT(*)
FROM information_schema.referential_constraints
WHERE constraint_schema = '${dbName}'
  AND table_name = '${tableName}'
  AND constraint_name = '${constraintName}';
`

type AddConstraintArgs<Table extends Model, RefTable extends Model> = {
  dbInstance: Sequelize,
  table:new () => Table,
  field: keyof InferAttributes<Table>,
  refTable: new () => RefTable,
  refField: keyof InferAttributes<RefTable>,
  onDelete: string,
  onUpdate: string,
}
// const tableName = model.getTableName()
//   console.log(`table name = ${typeof tableName === 'string' ? tableName : tableName.tableName}`)

async function addConstraintIfNotExists<Table extends Model, RefTable extends Model>(
  {
    dbInstance,
    table,
    field,
    refTable,
    refField,
    onDelete,
    onUpdate,
  }: AddConstraintArgs<Table, RefTable>,
) {
  const dbName = dbInstance.getDatabaseName()

  let tableName = (table as typeof Model & (new () => Table)).getTableName()
  if (typeof tableName !== 'string') {
    tableName = tableName.tableName
  }
  let refTableName = (refTable as typeof Model & (new () => RefTable)).getTableName()
  if (typeof refTableName !== 'string') {
    refTableName = refTableName.tableName
  }

  const constraint = `fk_${tableName}_${String(field)}_${refTableName}`

  const results = await dbInstance.query<{ 'COUNT(*)': number }>(`
    SELECT COUNT(*)
    FROM information_schema.referential_constraints
    WHERE constraint_schema = '${dbName}'
      AND table_name = '${tableName}'
      AND constraint_name = '${constraint}';
  `, { type: QueryTypes.SELECT })

  const totalCount = results[0]['COUNT(*)'] // as [{'COUNT(*)': number}]
  const constraintExists = totalCount > 0

  // const constraintExists = parseInt(results[0]['COUNT(*)'], 10) > 0

  if (!constraintExists) {
    console.log(`adding foreign key constraint: ${constraint}`)
    await dbInstance.query(`
      ALTER TABLE ${tableName}
      ADD CONSTRAINT ${constraint} FOREIGN KEY (${String(field)})
      REFERENCES ${refTableName}(${String(refField)})
      ON DELETE ${onDelete} ON UPDATE ${onUpdate};
    `, {
      type: QueryTypes.FOREIGNKEYS,
    })
  } else {
    console.log(`foreign key constraint: ${constraint} already exists. skipping`)
  }
}

async function addCustomers() {
  const data1 = {
    firstName: 'Art',
    lastName: 'Telesh',
    phone: '215.917.2940',
    altPhone: '215.676.6100 x102',
    email: 'decarea@yahoo.com',
  }

  const data1magento = {
    externalGroupId: 12130,
    isGuest: true,
    email: 'decarea@yahoo.com',
    externalCustomerId: null,
  }
  const data2 = {
    firstName: 'Dina',
    lastName: 'Telesh',
    phone: '215.917.2940',
    altPhone: '215.676.6100 x102',
    email: 'dinatelesh@gmail.com',

  }

  const data2magento = {
    externalGroupId: 12130,
    isGuest: false,
    email: 'dinatelesh@gmail.com',
    externalCustomerId: 143245,
  }

  const data3 = {
    firstName: 'Tony',
    lastName: 'Stark',
    phone: '215.917.2940',
    altPhone: '215.676.6100 x102',
    email: 'tony2@gmail.com',

  }

  const data3magento = {
    externalGroupId: 12130,
    isGuest: false,
    email: 'tony2@gmail.com',
    externalCustomerId: 1432435,
  }
  const record = await Customer.bulkCreate([data1, data2, data3])
  const record2 = await MagentoCustomer.bulkCreate([data1magento, data2magento, data3magento])

  if (record) {
    console.log('customer records:', record)
  }
  if (record2) {
    console.log('magento records:', record2)
  }
}

function addOrder() {
  Customer.findByPk(2)
    .then((customer) => {
      if (customer) {
        return customer.createOrder(
          {
            orderDate: new Date(),
            orderNumber: '100042321',
            paymentMethod: 'credit card',
            shippingCost: 134.45,
            taxRate: 6.625,
          },
        ).then((order) => order && order.createMagento({
          externalId: 2144,
          externalQuoteId: 2344,
          state: 'complete',
          status: 'complete',
          updatedAt: new Date(),
        }))
          .then((record) => {
            console.log('new record:', record && record.toJSON())
          })
      }
      return null
    })
    .catch((err) => {
      console.log('error occured adding order:', err)
    })
}

// createAssociations()

// console.log('starting auth')
db
  // .authenticate()
  // .sync({ force: true })
  .sync()
  .then(() => addConstraintIfNotExists({
    dbInstance: db,
    table: Order,
    field: 'shipId',
    refTable: OrderAddress,
    refField: 'id',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
    .then(() => addConstraintIfNotExists({
      dbInstance: db,
      table: Order,
      field: 'billId',
      refTable: OrderAddress,
      refField: 'id',
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    }))
    .then(() => addConstraintIfNotExists({
      dbInstance: db,
      table: OrderAddress,
      field: 'customerAddressId',
      refTable: Address,
      refField: 'id',
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    }))
    .catch((e) => console.log('there was an error:', e)))
  .then(() => {
    // addCustomers().then(() => {
    //   console.log('record success')
    // })
    //   .catch((err) => {
    //     console.log('error in customer creation', err)
    //   })
    // addOrder()

    // MagentoOrder.create({
    //   externalId: 2144,
    //   externalQuoteId: 35253,
    //   state: 'complete',
    //   status: 'complete',
    //   updatedAt: new Date()
    // }).then((record) => {
    //   console.log('order record:', record.toJSON())
    // })
    //   .catch((err) => {
    //     console.log('error in customer creation', err)
    //   })
    // Customer.create({
    //   firstName: 'Art',
    //   lastName: 'Telesh',
    //   phone: '215.917.2940',
    //   email: null,
    // }).then((record) => {
    //   console.log('record:', record.toJSON())
    // })
    //   .catch((err) => {
    //     console.log('error in customer creation', err)
    //   })

    // Address.create({
    //   // customerId,
    //   firstName: 'Art',
    //   lastName: 'Telesh',
    //   company: 'room service 360',
    //   phone: '215.676.6100',
    //   altPhone: '215.676.6100 ×102',
    //   state: 'PA',
    //   // street1: '2031 Byberry Rd',
    //   street: ['211 Erica St', '2nd Floor'],
    //   // street2,
    //   city: 'Philadelphia',
    //   zipCode: '19116',
    //   country: 'US',
    //   // id,
    //   latitude: 35.766114,
    //   longitude: -56.1121231,
    //   notes: 'custom notes',
    // })

    // Address.create({
    //   // customerId,
    //   firstName: 'Art',
    //   lastName: 'Telesh',
    //   company: 'room service 360',
    //   phone: '215.676.6100',
    //   altPhone: '215.676.6100 ×102',
    //   state: 'PA',
    //   // street1: '2031 Byberry Rd',
    //   street: ['2031 Byberry St'],
    //   // street2,
    //   city: 'Philadelphia',
    //   zipCode: '19116',
    //   country: 'US',
    //   // id,
    //   // latitude: -90,
    //   // coordinates: [48.55441, -55.1435255],
    //   // longitude: -56.1121231,
    //   notes: 'custom notes',
    // })

    const assignAddress = async () => {
      const cust = await Customer.findByPk(2)
      const count = await cust?.countAddresses()

      console.log(`customer has ${count} addresses`)
      const addr = await Address.findByPk(1)
      if (cust && addr) {
        await cust.addAddress(addr)
      }
    }
    // assignAddress()

    // Customer.findByPk(2, { include: 'addresses' })
    //   .then((record) => {
    //     if (record) {
    //       console.log('record found:', record.toJSON())
    //     }
    //   })
    //   .catch((err) => console.log('error:', err))

    // Customer.findByPk(2, { include: ['magento', 'orders'] })
    //   .then((record) => {
    //     if (record) {
    //       console.log('found record: ', record?.toJSON())
    //     } else {
    //       console.log('your search returned no results')
    //     }
    //   })
    //   .catch((err) => console.log('there was an error getting order', err))

    console.log('DATABASE NAME:', db.getDatabaseName(), Order.getTableName())
  })
  .catch((error) => {
    console.log('there was an error trying to connect to the database:', error)
  })
