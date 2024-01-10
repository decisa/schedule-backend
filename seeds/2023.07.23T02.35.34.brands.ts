import type { Seeder } from '../umzug'
import { readJsonFromFile } from '../src/utils/utils'
import { Brand } from '../src/models/Brand/brand'

const brands = readJsonFromFile<Brand[]>('./seeds/json/brands.json')

export const up: Seeder = async ({ context: queryInterface }) => {
  try {
    // use transaction to ensure that all or none of the data is inserted
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkInsert('Brands', brands, { transaction: t })
      console.log('brands are up')
    })
  } catch (error) {
    console.log('error encountered during brands seeder: ', error)
    throw error
  }
}

export const down: Seeder = async ({ context: queryInterface }) => {
  try {
    // use transaction to ensure that all or none of the data is inserted
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkDelete('Brands', { id: brands.map((brand) => brand.id) })
    })
  } catch (error) {
    console.log('error encountered during purchase order seeder down: ')
    throw error
  }
}
