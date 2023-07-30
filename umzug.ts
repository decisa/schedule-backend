import { Umzug, SequelizeStorage } from 'umzug'
import sequelize from './src/models'

export const migrator = new Umzug({
  migrations: { glob: 'migrations/*.ts' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    modelName: 'migrationsMeta',
  }),
  logger: console,
})

export type Migration = typeof migrator._types.migration

export const seeder = new Umzug({
  migrations: { glob: 'seeds/*.ts' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    modelName: 'seedsMeta',
  }),
  logger: console,
})

export type Seeder = typeof seeder._types.migration
