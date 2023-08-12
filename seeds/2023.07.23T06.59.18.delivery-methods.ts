import db from '../src/models'
import { DeliveryMethod } from '../src/models/Sales/DeliveryMethod/deliveryMethod'
import { readJsonFromFile } from '../src/utils/utils'
import type { Seeder } from '../umzug'

const deliveryMethods = readJsonFromFile<DeliveryMethod[]>('./seeds/json/delivery-methods.json')

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
}

export const down: Seeder = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete('DeliveryMethods', { id: deliveryMethods.map((method) => method.id) })
}
