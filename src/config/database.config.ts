import * as dotenv from 'dotenv'
import { Dialect } from 'sequelize'

dotenv.config()

const dbConfig: {
  [env: string]: {
    username: string,
    password?: string,
    database: string,
    host: string,
    dialect: Dialect,
  }
} = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || undefined,
    database: process.env.DB_DEV_NAME || 'database_development',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  test: {
    username: 'root',
    password: undefined,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: 'root',
    password: undefined,
    database: 'database_production',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
}

export default dbConfig
