import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

const tableName = 'Deliveries'
const titleColumn = 'title'

// done: title: string
// done: coiRequired: boolean
// done: coiReceived: boolean
// done: coiNotes: string | null
// done: amountDue: string | null
// done: daysAvailability: number // 7-bit integer (0-127) representing days of the week Sunday-Saturday
// done: startTime: number // in minutes
// done: endTime: number // in minutes

export const up: Migration = async ({ context: queryInterface }) => {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.addColumn(tableName, 'daysAvailability', {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 127,
      allowNull: false,
    }, { transaction })

    await queryInterface.addColumn(tableName, 'startTime', {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 420,
      allowNull: false,
    }, { transaction })

    await queryInterface.addColumn(tableName, 'endTime', {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1200,
      allowNull: false,
    }, { transaction })

    await queryInterface.addColumn(tableName, titleColumn, {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    }, { transaction })

    // update all titles to be the name on the delivery address
    const updateTitleQuery = `
      UPDATE ${tableName} AS d
      JOIN OrderAddresses AS oa 
        ON oa.id = d.shippingAddressId
      SET d.${titleColumn} = CONCAT(oa.firstName, ' ',  oa.lastName)
    `
    await queryInterface.sequelize.query(updateTitleQuery, { transaction })

    // add coiRequired, coiReceived, coiNotes, amountDue
    await queryInterface.addColumn(tableName, 'coiRequired', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    }, { transaction })

    await queryInterface.addColumn(tableName, 'coiReceived', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    }, { transaction })

    await queryInterface.addColumn(tableName, 'coiNotes', {
      type: DataTypes.STRING,
      allowNull: true,
    }, { transaction })

    await queryInterface.addColumn(tableName, 'amountDue', {
      type: DataTypes.STRING,
      allowNull: true,
    }, { transaction })

    await transaction.commit()
    console.log('up: complete')
  } catch (error) {
    // since transactions do not support Add Column, we need to manually rollback one at a time
    try {
      await queryInterface.removeColumn(tableName, 'daysAvailability', { transaction })
    } catch (err) {
      console.log('daysAvailability field does not exist')
    }
    try {
      await queryInterface.removeColumn(tableName, 'startTime', { transaction })
    } catch (err) {
      console.log('startTime field does not exist')
    }
    try {
      await queryInterface.removeColumn(tableName, 'endTime', { transaction })
    } catch (err) {
      console.log('endTime field does not exist')
    }
    try {
      await queryInterface.removeColumn(tableName, titleColumn, { transaction })
    } catch (err) {
      console.log(`${titleColumn} field does not exist`)
    }
    try {
      await queryInterface.removeColumn(tableName, 'coiRequired', { transaction })
    } catch (err) {
      console.log('coiRequired field does not exist')
    }
    try {
      await queryInterface.removeColumn(tableName, 'coiReceived', { transaction })
    } catch (err) {
      console.log('coiReceived field does not exist')
    }
    try {
      await queryInterface.removeColumn(tableName, 'coiNotes', { transaction })
    } catch (err) {
      console.log('coiNotes field does not exist')
    }
    try {
      await queryInterface.removeColumn(tableName, 'amountDue', { transaction })
    } catch (err) {
      console.log('amountDue field does not exist')
    }

    await transaction.rollback()
    throw error
  }
  // update all titles to be the name on the delivery address
}

export const down: Migration = async ({ context: queryInterface }) => {
  // since transactions do not support Add Column, we need to manually rollback one at a time
  try {
    await queryInterface.removeColumn(tableName, 'daysAvailability')
  } catch (err) {
    console.log('daysAvailability field does not exist')
  }
  try {
    await queryInterface.removeColumn(tableName, 'startTime')
  } catch (err) {
    console.log('startTime field does not exist')
  }
  try {
    await queryInterface.removeColumn(tableName, 'endTime')
  } catch (err) {
    console.log('endTime field does not exist')
  }
  try {
    await queryInterface.removeColumn(tableName, titleColumn)
  } catch (err) {
    console.log(`${titleColumn} field does not exist`)
  }
  try {
    await queryInterface.removeColumn(tableName, 'coiRequired')
  } catch (err) {
    console.log('coiRequired field does not exist')
  }
  try {
    await queryInterface.removeColumn(tableName, 'coiReceived')
  } catch (err) {
    console.log('coiReceived field does not exist')
  }
  try {
    await queryInterface.removeColumn(tableName, 'coiNotes')
  } catch (err) {
    console.log('coiNotes field does not exist')
  }
  try {
    await queryInterface.removeColumn(tableName, 'amountDue')
  } catch (err) {
    console.log('amountDue field does not exist')
  }
}
