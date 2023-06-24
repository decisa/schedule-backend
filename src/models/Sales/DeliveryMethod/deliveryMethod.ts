import {
  CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
} from 'sequelize'
import type { Order } from '../Order/order'

// One-to-many relationship between DeliveryMethod and Orders.

// create model to store delivery methods their names and descriptions
export class DeliveryMethod extends Model<InferAttributes<DeliveryMethod>,
InferCreationAttributes<DeliveryMethod>> {
  declare id: CreationOptional<number>

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  declare name: string

  declare description: string

  // ASSOCIATIONS:
  declare orders?: NonAttribute<Order[]>

  // MIXINS:
  // orders:
  // Orders:
  declare createOrder: HasManyCreateAssociationMixin<Order, 'deliveryMethodId'>

  declare getOrders: HasManyGetAssociationsMixin<Order>

  declare countOrders: HasManyCountAssociationsMixin

  declare hasOrder: HasManyHasAssociationMixin<Order, number>

  declare hasOrders: HasManyHasAssociationsMixin<Order, number>

  declare setOrders: HasManySetAssociationsMixin<Order, number>

  declare addOrder: HasManyAddAssociationMixin<Order, number>

  declare addOrders: HasManyAddAssociationsMixin<Order, number>

  declare removeOrder: HasManyRemoveAssociationMixin<Order, number>

  declare removeOrders: HasManyRemoveAssociationsMixin<Order, number>
}

export function initDeliveryMethod(db: Sequelize): void {
  DeliveryMethod.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize: db,
  })
}
