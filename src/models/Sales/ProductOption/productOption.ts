import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize,
} from 'sequelize'
import type { ProductConfiguration } from '../ProductConfiguration/productConfiguration'

export class ProductOption extends Model<InferAttributes<ProductOption>, InferCreationAttributes<ProductOption>> {
  declare id: CreationOptional<number>

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  declare label: string

  declare value: string

  declare sortOrder: number

  declare externalId: number | null

  declare externalValue: string | null

  // associations
  // declare configId:
  declare configId?: ForeignKey<ProductConfiguration['id']>

  declare configuration?: NonAttribute<ProductConfiguration>

  declare public static associations: {
    configuration: Association<ProductOption, ProductConfiguration>,
  }

  // MIXINS
  // configuration:
  declare getConfiguration: BelongsToGetAssociationMixin<ProductConfiguration>

  declare setConfiguration: BelongsToSetAssociationMixin<ProductConfiguration, number>

  declare createConfiguration: BelongsToCreateAssociationMixin<ProductConfiguration>
}

export function initProductOptions(db: Sequelize) {
  ProductOption.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      configId: {
        type: DataTypes.INTEGER, // foreign Key,
        unique: 'configid_extid_constraint',
        // configId - externalId constraint (only one option value of the same type is permitted per configuration)
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING,
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
      externalValue: DataTypes.STRING,
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize: db,
      // indexes: [
      //   {
      //     unique: true,
      //     fields: ['externalId'],
      //   },
      // ],
    },
  )
}
