// import { MigrationFn } from 'umzug';
import { Model, QueryOptionsWithModel, Sequelize } from 'sequelize'
import db from '../src/models'
import type { Seeder } from '../umzug'
import { DeliveryMethod } from '../src/models/Sales/DeliveryMethod/deliveryMethod'

const deliveryMethods = [
  {
    id: 1,
    name: 'Standard',
    description: 'delivery to your doorstep without assembly',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Inside',
    description: 'inside delivery without assembly',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: 'White Glove',
    description: 'inside delivery with assembly',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: 'Premium',
    description: 'premium white glove delivery with full assembly',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    name: 'Service Call',
    description: 'service appointment',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    name: 'Pickup',
    description: 'pick up appointment',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    name: 'Special Delivery',
    description: 'premium white glove delivery with full assembly',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    name: 'Standard (International)',
    description: 'delivery to your doorstep without assembly',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const up: Seeder = async ({ context: queryInterface }) => {
  // for (const method of deliveryMethods) {
  for (let i = 0; i < deliveryMethods.length; i += 1) {
    console.log(`step ${i}`)
    const method = deliveryMethods[i]
    await queryInterface.upsert(
      'DeliveryMethods',
      method,
      {
        name: method.name,
        description: method.description,
        updatedAt: new Date(),
      },
      {
        id: method.id,
      },
      {
        model: db.models.DeliveryMethod,
      },
    )
  }

  // queryInterface.upsert('DeliveryMethods', deliveryMethods, {)
  // await queryInterface.bulkInsert('DeliveryMethods', deliveryMethods, {
  //   // updateOnDuplicate: ['name', 'description'],

  // })
}

export const down: Seeder = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete('DeliveryMethods', { id: deliveryMethods.map((method) => method.id) })
}
