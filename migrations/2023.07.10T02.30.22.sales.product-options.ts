import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('ProductOptions', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    // configId: {
    //   type: DataTypes.INTEGER, // foreign Key,
    //   unique: 'configid_extid_constraint',
    //   // configId - externalId constraint (only one option value of the same type is permitted per configuration)
    // },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(600),
      allowNull: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    externalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: 'configid_extid_constraint',
    },
    externalValue: DataTypes.STRING(600),
    // foreign keys:
    // declare configId?: ForeignKey<ProductConfiguration['id']>
    configId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ProductConfigurations',
        key: 'id',
      },
      // if main product configuration is deleted - delete all of its options
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    // timestamps:
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  })

  await queryIterface.addConstraint('ProductOptions', {
    fields: ['externalId', 'configId'],
    type: 'unique',
    name: 'configid_extid_constraint',
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('ProductOptions')
}
