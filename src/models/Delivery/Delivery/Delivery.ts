import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes, ForeignKey,
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
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,

} from 'sequelize'

import type { OrderAddress } from '../../Sales/OrderAddress/orderAddress'
import type { Order } from '../../Sales/Order/order'
import type { DeliveryStop } from '../DeliveryStop/DeliveryStop'
import type { DeliveryItem } from '../DeliveryItem/DeliveryItem'
import type { DeliveryStatus } from './DeliveryController'

export class Delivery extends Model<InferAttributes<Delivery>, InferCreationAttributes<Delivery>> {
  declare id: CreationOptional<number>

  declare status: DeliveryStatus

  declare estimatedDurationString: string | null

  declare estimatedDuration: CreationOptional<[number, number]>

  declare notes: string | null

  // timestamps
  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // associations

  declare orderId: ForeignKey<Order['id']>

  declare order?: NonAttribute<Order>

  declare shippingAddressId: ForeignKey<OrderAddress['id']>

  declare shippingAddress?: NonAttribute<OrderAddress>

  declare deliveryStopId: ForeignKey<DeliveryStop['id']> | null

  declare deliveryStop?: NonAttribute<DeliveryStop>

  declare items?: NonAttribute<DeliveryItem[]>

  declare public static associations: {
    order: Association<Delivery, Order>,
    shippingAddress: Association<Delivery, OrderAddress>,
    deliveryStop: Association<Delivery, DeliveryStop>,
    items: Association<Delivery, DeliveryItem>,
  }

  // MIXINS
  // done: one-to-many relationship between Order and Delivery
  // order:
  declare getOrder: BelongsToGetAssociationMixin<Order>

  declare setOrder: BelongsToSetAssociationMixin<Order, number>

  declare createOrder: BelongsToCreateAssociationMixin<Order>

  // done: one-to-many relationship between OrderAddress and Delivery
  // shippingAddress:
  declare getShippingAddress: BelongsToGetAssociationMixin<OrderAddress>

  declare setShippingAddress: BelongsToSetAssociationMixin<OrderAddress, number>

  declare createShippingAddress: BelongsToCreateAssociationMixin<OrderAddress>

  // done: one-to-many relationship between DeliveryStop and Delivery
  // deliveryStop:
  declare getDeliveryStop: BelongsToGetAssociationMixin<DeliveryStop>

  declare setDeliveryStop: BelongsToSetAssociationMixin<DeliveryStop, number>

  declare createDeliveryStop: BelongsToCreateAssociationMixin<DeliveryStop>

  // done: one-to-many relationship between Delivery and DeliveryItem
  // deliveryItems:
  declare createDeliveryItem: HasManyCreateAssociationMixin<DeliveryItem, 'deliveryId'>

  declare getDeliveryItems: HasManyGetAssociationsMixin<DeliveryItem>

  declare countDeliveryItems: HasManyCountAssociationsMixin

  declare hasDeliveryItem: HasManyHasAssociationMixin<DeliveryItem, number>

  declare hasDeliveryItems: HasManyHasAssociationsMixin<DeliveryItem, number>

  declare setDeliveryItems: HasManySetAssociationsMixin<DeliveryItem, number>

  declare addDeliveryItem: HasManyAddAssociationMixin<DeliveryItem, number>

  declare addDeliveryItems: HasManyAddAssociationsMixin<DeliveryItem, number>

  declare removeDeliveryItem: HasManyRemoveAssociationMixin<DeliveryItem, number>

  declare removeDeliveryItems: HasManyRemoveAssociationsMixin<DeliveryItem, number>
}

export function initDelivery(db: Sequelize) {
  Delivery.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      estimatedDurationString: DataTypes.STRING,
      estimatedDuration: {
        type: DataTypes.VIRTUAL,
        defaultValue: '0,0',
        get() {
          const rawValue = this.getDataValue('estimatedDurationString') // as unknown as string
          if (rawValue === null) { return null }
          const result = (rawValue || '0,0').split(',').map(Number)
          console.log('result', result)
          return result
        },
        set(val: [number, number]) {
          this.setDataValue('estimatedDurationString', val.join(','))
        },
      },
      notes: DataTypes.STRING,
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
