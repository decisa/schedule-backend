import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes, ForeignKey,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from 'sequelize'

import type { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'
import type { Delivery } from '../Delivery/Delivery'

export const deliveryStatuses = ['pending', 'scheduled', 'confirmed'] as const
export type DeliveryStatus = typeof deliveryStatuses[number]

export class DeliveryItem extends Model<InferAttributes<DeliveryItem>, InferCreationAttributes<DeliveryItem>> {
  declare id: CreationOptional<number>

  declare qty: number

  // timestamps
  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // associations
  declare configurationId: ForeignKey<ProductConfiguration['id']>

  declare product?: NonAttribute<ProductConfiguration>

  declare deliveryId: ForeignKey<Delivery['id']>

  declare delivery?: NonAttribute<Delivery>

  declare public static associations: {
    product: Association<DeliveryItem, ProductConfiguration>,
    delivery: Association<DeliveryItem, Delivery>,
  }

  // MIXINS
  // One-to-many relationship between ProductConfiguration and DeliveryItems
  // product:
  declare getProduct: BelongsToGetAssociationMixin<ProductConfiguration>

  declare setProduct: BelongsToSetAssociationMixin<ProductConfiguration, number>

  declare createProduct: BelongsToCreateAssociationMixin<ProductConfiguration>

  // One-to-many relationship between Delivery and DeliveryItems
  // delivery:
  declare getDelivery: BelongsToGetAssociationMixin<Delivery>

  declare setDelivery: BelongsToSetAssociationMixin<Delivery, number>

  declare createDelivery: BelongsToCreateAssociationMixin<Delivery>
}

export function initDeliveryItem(db: Sequelize) {
  DeliveryItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
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
    },
  )
}
