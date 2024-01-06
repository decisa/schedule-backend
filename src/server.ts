import {
  InferAttributes, Model, QueryTypes, Sequelize,
} from 'sequelize'
// import app from './app'
import db from './models'
import { printYellowLine } from './utils/utils'
import { Driver } from './models/Delivery/Driver/driver'
import app from './app'
import { Vehicle } from './models/Delivery/Vehicle/vehicle'
import { Trip } from './models/Delivery/Trip/Trip'

const PORT = process.env.PORT || 8080

// async function addDrivers() {
//   await Driver.create({
//     firstName: 'Akhror',
//     lastName: 'Doe',
//     licenceNumber: 'DL56412121',
//     phoneNumber: '215.676.6200',
//     // email,
//     driverRole: 'Master Installer',
//   })

//   await Driver.create({
//     firstName: 'Muzaffar',
//     lastName: 'Smith',
//     licenceNumber: '28 9665 4541',
//     phoneNumber: '215.676.6333',
//     // email,
//     driverRole: 'Master Installer',
//   })

//   await Driver.create({
//     firstName: 'Omurbek',
//     lastName: 'Azizov',
//     licenceNumber: '787 25 5641',
//     phoneNumber: '215.676.6444',
//     // email,
//     driverRole: 'Master Installer',
//   })

//   await Driver.create({
//     firstName: 'Azamat',
//     lastName: 'Johnson',
//     licenceNumber: '56 4121 121',
//     phoneNumber: '215.676.6555',
//     // email,
//     driverRole: 'Helper',
//   })
// }

// async function addVehicles() {
//   await Vehicle.create({
//     name: 'Isuzu NPR',
//     height: 12 * 12 + 6,
//     width: 8 * 12,
//     length: 24 * 12,
//     gvw: 25995,
//     axles: 2,
//     semi: false,
//     hazMat: false,
//     // maxVolume: ,
//     make: 'Isuzu',
//     model: 'NPR',
//     year: 2021,
//     vin: '54DK6S16XMSG50274',
//     type: 'truck',
//   })

//   await Vehicle.create({
//     name: 'Van',
//     height: 10 * 12 + 6,
//     width: 8 * 12,
//     length: 170 + 48,
//     gvw: 12000,
//     axles: 2,
//     semi: false,
//     hazMat: false,
//     // maxVolume: ,
//     make: 'Mersedes-Benz',
//     model: 'Sprinter',
//     year: 2020,
//     vin: 'W1W5ECHY1LT037374',
//     type: 'van',
//   })
// }

db
  .authenticate()
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
          // required: true,
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
