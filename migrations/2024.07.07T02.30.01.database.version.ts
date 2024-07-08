import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'
import { Migration } from '../umzug'
import { consoleLogBlue } from '../src/utils/utils'

// migrate up:

// create database to keep the version of the current state of the database

async function createDataBaseVersion(queryInterface: QueryInterface) {
  await queryInterface.createTable('Version', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  })
}

export const up: Migration = async ({ context: queryInterface }) => {
  // create Version table
  await createDataBaseVersion(queryInterface)
  // add the current version of the database
  await queryInterface.bulkInsert('Version', [
    {
      id: 1,
      version: '2.0',
      notes: 'switched to unified addresses',
    },
  ])

  consoleLogBlue('up: all done. database version created')
}

export const down: Migration = async ({ context: queryInterface }) => {
  // note: drop tables
  await queryInterface.dropTable('Version', {
    force: true,
  })

  consoleLogBlue('down: all done. version table dropped')
}
