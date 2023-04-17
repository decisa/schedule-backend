import { Sequelize } from 'sequelize'
import databaseConfig from '../config/database.config'
import initModels from './initModels'
import createAssociations from './associations'

console.log('running db')

const env = process.env.NODE_ENV || 'development'
const config = databaseConfig[env]

const db = new Sequelize(config.database, config.username, config.password, config)

initModels(db)
createAssociations()

export default db
