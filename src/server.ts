import {
  InferAttributes, Model, QueryTypes, Sequelize,
} from 'sequelize'
// import app from './app'
import { add } from 'date-fns'
import db from './models'
import { Address } from './models/Sales/Address/address'
import { Order } from './models/Sales/Order/order'
import { OrderAddress } from './models/Sales/OrderAddress/orderAddress'
import { printYellowLine } from './utils/utils'
import { Driver } from './models/Delivery/Driver/Driver'
import app from './app'
import { createIfNotExistsProductSummaryView } from './views/ProductSummary/productSummary'
import { Vehicle } from './models/Delivery/Vehicle/vehicle'
import { Trip } from './models/Delivery/Trip/Trip'

const PORT = process.env.PORT || 8080

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

async function addTrip() {
  await Trip.create({
    name: 'Florida Trip',
    start: new Date(2023, 7, 18, 8, 0, 0),
    end: new Date(2023, 7, 20, 18, 0, 0),
    vehicleId: 1,
  })

  await Trip.create({
    start: new Date(2023, 7, 19, 8, 0, 0),
    end: new Date(2023, 7, 19, 18, 0, 0),
    vehicleId: 2,
  })
}

async function addVehicles() {
  await Vehicle.create({
    name: 'Isuzu NPR',
    height: 12 * 12 + 6,
    width: 8 * 12,
    length: 24 * 12,
    gvw: 25995,
    axles: 2,
    semi: false,
    hazMat: false,
    // maxVolume: ,
    make: 'Isuzu',
    model: 'NPR',
    year: 2021,
    vin: '54DK6S16XMSG50274',
    type: 'truck',
  })

  await Vehicle.create({
    name: 'Van',
    height: 10 * 12 + 6,
    width: 8 * 12,
    length: 170 + 48,
    gvw: 12000,
    axles: 2,
    semi: false,
    hazMat: false,
    // maxVolume: ,
    make: 'Mersedes-Benz',
    model: 'Sprinter',
    year: 2020,
    vin: 'W1W5ECHY1LT037374',
    type: 'van',
  })
}

// function addOrder() {
//   Customer.findByPk(2)
//     .then((customer) => {
//       if (customer) {
//         return customer.createOrder(
//           {
//             orderDate: new Date(),
//             orderNumber: '100042321',
//             paymentMethod: 'credit card',
//             shippingCost: 134.45,
//             taxRate: 6.625,
//           },
//         ).then((order) => order && order.createMagento({
//           externalId: 2144,
//           externalQuoteId: 2344,
//           state: 'complete',
//           status: 'complete',
//           updatedAt: new Date(),
//         }))
//           .then((record) => {
//             console.log('new record:', record && record.toJSON())
//           })
//       }
//       return null
//     })
//     .catch((err) => {
//       console.log('error occured adding order:', err)
//     })
// }

// createAssociations()

// console.log('starting auth')
db
  .authenticate()
  // .sync({ force: true })
  // .sync()
  // .then(() => addConstraintIfNotExists({
  //   dbInstance: db,
  //   table: Order,
  //   field: 'shippingAddressId',
  //   refTable: OrderAddress,
  //   refField: 'id',
  //   onUpdate: 'CASCADE',
  //   onDelete: 'SET NULL',
  // })
  // .then(() => addConstraintIfNotExists({
  //   dbInstance: db,
  //   table: Order,
  //   field: 'billingAddressId',
  //   refTable: OrderAddress,
  //   refField: 'id',
  //   onUpdate: 'CASCADE',
  //   onDelete: 'CASCADE',
  // }))
  // .then(() => addConstraintIfNotExists({
  //   dbInstance: db,
  //   table: OrderAddress,
  //   field: 'customerAddressId',
  //   refTable: Address,
  //   refField: 'id',
  //   onUpdate: 'CASCADE',
  //   onDelete: 'CASCADE',
  // }))
  // .then(() => createIfNotExistsProductSummaryView(db, 'ProductSummaryView'))
  // .catch((e) => console.log('there was an error:', e)))
  .then(async () => {
    // note: import orders:
    // await addDrivers()
    // await addVehicles()
    // const trip = await Trip.findByPk(3, {
    //   include: [
    //     {
    //       model: Driver,
    //     },
    //   ],
    // })
    // if (trip) {
    //   // await trip.addDrivers([3])
    //   console.log(trip.toJSON())
    // }

    const driver = await Driver.findByPk(1, {
      include: [
        {
          model: Trip,
          required: true,
        },

      ],
    })

    if (driver) {
      console.log(driver.toJSON())
    }
    printYellowLine('FINAL')
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is listening on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.log('there was an error trying to connect to the database:', error)
  })
