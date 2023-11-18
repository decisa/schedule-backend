import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryInterface }) => {
  const transaction = await queryInterface.sequelize.transaction()
  try {
    await queryInterface.createTable('Shipments', {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      eta: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dateShipped: {
        type: DataTypes.DATE,
        allowNull: false, // now that there are no more NULLs, this won't cause an error
        defaultValue: DataTypes.NOW,
      },
      // foreign keys:
      carrierId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Carriers',
          key: 'id',
        },
        allowNull: false,
        // restrict deletion of carrier if shipments exist
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      // timestamps:
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    })

    await queryInterface.addConstraint('Shipments', {
      fields: ['trackingNumber', 'carrierId'],
      type: 'unique',
      name: 'trackingNumber_carrierId_constraint',
    })

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const down: Migration = async ({ context: queryInterface }) => {
  const transaction = await queryInterface.sequelize.transaction()
  try {
    await queryInterface.removeConstraint('Shipments', 'trackingNumber_carrierId_constraint', { transaction })
    await queryInterface.dropTable('Shipments', { transaction })

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
