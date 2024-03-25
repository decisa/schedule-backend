import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'
import { Delivery } from '../src/models/Delivery/Delivery/Delivery'
import { DeliveryMethod } from '../src/models/Sales/DeliveryMethod/deliveryMethod'

const { tableName } = Delivery
const newColumn = 'deliveryMethodId'
// const columnToRemove = 'status'

// add new column deliveryMethodId to Delivery table
// remove status column from Delivery table
export const up: Migration = async ({ context: queryInterface }) => {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // add deliveryMethodId column and allow null values
    await queryInterface.addColumn(tableName, newColumn, {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: DeliveryMethod.tableName,
        key: 'id',
      },
      // do not allow to delete delivery methods when they are used in deliveries
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    })

    // go over all deliveries and set the deliveryMethodId to the first delivery method
    // get id of the first delivery method
    const [firstDeliveryMethod] = await DeliveryMethod.findAll({ limit: 1 })
    if (!firstDeliveryMethod) {
      throw new Error('No delivery methods found')
    }

    const deliveryMethodId = firstDeliveryMethod.id

    // update all deliveries to have the first delivery method
    await queryInterface.sequelize.query(`
      UPDATE ${tableName}
      SET ${newColumn} = ${deliveryMethodId}
    `, { transaction })

    console.log('changing to non nullable')
    // set deliveryMethodId as not nullable
    await queryInterface.changeColumn(tableName, newColumn, {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: {
      //   model: DeliveryMethod.tableName,
      //   key: 'id',
      // },
      // onDelete: 'RESTRICT',
      // onUpdate: 'CASCADE',
    }, { transaction })

    // console.log('removing status column')
    // remove status column
    // await queryInterface.removeColumn(tableName, columnToRemove, { transaction })

    await transaction.commit()
    console.log('up: complete')
  } catch (error) {
    // transaction does not support adding columns, need to rollback manually
    try {
      await queryInterface.removeColumn(tableName, newColumn, { transaction })
      console.log(`successfully removed ${newColumn} column`)
    } catch (err) {
      console.log(`${newColumn} field does not exist`)
    }
    await transaction.rollback()
    throw error
  }
}

export const down: Migration = async ({ context: queryInterface }) => {
  try {
    await queryInterface.removeColumn(tableName, newColumn)
    console.log(`successfully removed ${newColumn} column`)
    // add status column back
    // await queryInterface.addColumn(tableName, columnToRemove, {
    //   type: DataTypes.STRING,
    //   defaultValue: 'pending',
    //   allowNull: false,
    // })
    // console.log(`successfully re-added ${columnToRemove} column with default value 'pending'`)
    // console.log('down: complete')
  } catch (error) {
    console.log(`error in down migration: ${String(error)}`)
    throw error
  }
}
