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

  declare label: CreationOptional<string>

  declare value: CreationOptional<string>

  declare sortOrder: number

  declare externalId?: number

  declare externalValue?: number

  // associations
  // declare configId:
  declare configId?: ForeignKey<ProductConfiguration['id']>

  declare configuration: NonAttribute<ProductConfiguration>

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
      },
      label: DataTypes.STRING,
      value: DataTypes.STRING,
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
