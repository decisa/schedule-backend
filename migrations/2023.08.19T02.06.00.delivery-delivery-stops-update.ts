import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  // remove null constraint from tripId
  await queryIterface.changeColumn('DeliveryStops', 'tripId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Trips',
      key: 'id',
    },
    // if trip is deleted, delete all associated stops
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  // add null constraint to tripId column. most likely will fail if there are any null values
  // possible solution would be to create a temporary trip to act as a container for all stops with null tripId
  try {
    await queryIterface.changeColumn('DeliveryStops', 'tripId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Trips',
        key: 'id',
      },
      // if trip is deleted, delete all associated stops
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    })
  } catch (error) {
    console.error(error)
    console.log('mostt likely failed because there are null values in tripId column, please create a temporary trip to act as a container for all stops with null tripId, assign all stops with null tripId to the temporary trip, then run this migration down again')
    // rethrow error
    throw error
  }
}
