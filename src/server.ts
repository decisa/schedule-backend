import {
  InferAttributes, Model, QueryTypes, Sequelize, col, fn,
} from 'sequelize'
// import app from './app'
import db from './models'
import { Address } from './models/Sales/Address/address'
import { Customer } from './models/Sales/Customer/customer'
import { MagentoCustomer } from './models/Sales/MagentoCustomer/magentoCustomer'
import { Order } from './models/Sales/Order/order'
import { OrderAddress } from './models/Sales/OrderAddress/orderAddress'
import importOrder from './Data/importOrder'
import { printYellowLine } from './utils/utils'
import { TripRoute } from './models/Delivery/TripRoute/tripRoute'
import { Driver } from './models/Delivery/Driver/driver'
// import Customer from './models/Customer/customer'
// import MagentoOrder from './models/MagentoOrder/magentoOrder'
// import Order from './models/Order/order'
// import createAssociations from './models/associations'
// console.log('order instance:', Order)

// const constraintExistsQuery = ({
//   dbName,
//   tableName,
//   constraintName,
// }: {
//   dbName: string,
//   tableName: string,
//   constraintName: string,
// }) => `
// SELECT COUNT(*)
// FROM information_schema.referential_constraints
// WHERE constraint_schema = '${dbName}'
//   AND table_name = '${tableName}'
//   AND constraint_name = '${constraintName}';
// `

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

  // check if the constraint exists on the table
  const results = await dbInstance.query<{ 'COUNT(*)': number }>(`
    SELECT COUNT(*)
    FROM information_schema.referential_constraints
    WHERE constraint_schema = '${dbName}'
      AND table_name = '${tableName}'
      AND constraint_name = '${constraint}';
  `, { type: QueryTypes.SELECT })

  const totalCount = results[0]['COUNT(*)']
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

async function addRoutes() {
  await TripRoute.create({
    startDate: new Date(2023, 3, 25, 8, 0),
    endDate: new Date(2023, 3, 25, 18, 0),
    startTime: 7 * 60,
    endTime: 19 * 60,
    name: 'Local Route',
    status: 'in progress',
  })

  await TripRoute.create({
    startDate: new Date(2023, 3, 28, 8, 0),
    endDate: new Date(2023, 4, 5, 18, 0),
    startTime: 8 * 60,
    endTime: 5 * 60,
    name: 'Florida trip April-May',
    status: 'in progress',
  })

  await TripRoute.create({
    startDate: new Date(2023, 4, 15, 8, 0),
    endDate: new Date(2023, 4, 29, 18, 0),
    startTime: 8 * 60,
    endTime: 20 * 60,
    name: 'CA May',
    status: 'scheduled',
  })
}

async function addDrivers() {
  await Driver.create({
    firstName: 'Akhror',
    lastName: 'Doe',
    licenceNumber: 'DL56412121',
    phoneNumber: '215.676.6200',
    // email,
    driverRole: 'Master Installer',
  })

  await Driver.create({
    firstName: 'Muzaffar',
    lastName: 'Smith',
    licenceNumber: '28 9665 4541',
    phoneNumber: '215.676.6333',
    // email,
    driverRole: 'Master Installer',
  })

  await Driver.create({
    firstName: 'Omurbek',
    lastName: 'Azizov',
    licenceNumber: '787 25 5641',
    phoneNumber: '215.676.6444',
    // email,
    driverRole: 'Master Installer',
  })

  await Driver.create({
    firstName: 'Azamat',
    lastName: 'Johnson',
    licenceNumber: '56 4121 121',
    phoneNumber: '215.676.6555',
    // email,
    driverRole: 'Helper',
  })
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
  .then(async () => {
    // note: import orders:
    // printYellowLine('IMPORT ORDER')
    // importOrder()
    //   .then(() => console.log('SUCCESS!!'))
    //   .catch((e) => console.log('ERROR!', e))

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
    // await addRoutes()
    // await addDrivers()
    // console.log('DATABASE NAME:', db.getDatabaseName(), Order.getTableName())

  })
  .catch((error) => {
    console.log('there was an error trying to connect to the database:', error)
  })
