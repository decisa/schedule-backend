import {
  InferAttributes,
  Model,
  InferCreationAttributes,
  DataTypes,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  ForeignKey,
  NonAttribute,
  Association,
  Sequelize,
} from 'sequelize'
// import db from '..'
import type { Order } from '../Order/order'

console.log('running magentoOrder model module')

export enum OrderStatus {
  pending = 'pending',
  processing = 'processing',
  inProduction = 'in_production',
  inTransit = 'in_transit',
  prepShipment = 'preparing_shipment',
  complete = 'complete',
  closed = 'closed',
  unknown = 'unknown',
}

export class MagentoOrder extends Model<InferAttributes<MagentoOrder>, InferCreationAttributes<MagentoOrder>> {
  declare externalId: number

  declare externalQuoteId: number

  declare state: string

  declare status: OrderStatus

  declare updatedAt: Date

  declare orderId: ForeignKey<Order['id']>

  declare order?: NonAttribute<Order>

  declare public static associations: { order: Association<MagentoOrder, Order> }

  declare getOrder: BelongsToGetAssociationMixin<Order>

  declare setOrder: BelongsToSetAssociationMixin<Order, number>

  declare createOrder: BelongsToCreateAssociationMixin<Order>
}

// MagentoOrder.init({
//   externalId: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     // unique: true, // defined in indexes
//   },
//   quoteId: {
//     type: DataTypes.INTEGER,
//   },
//   state: {
//     type: DataTypes.STRING(64),
//   },
//   status: {
//     type: DataTypes.STRING(64),
//   },
//   updatedAt: {
//     type: DataTypes.DATE,
//   },
// }, {
//   sequelize: db,
// })

export function initMagentoOrder(db: Sequelize) {
  MagentoOrder.init({
    externalId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      // unique: true, // defined in indexes
    },
    externalQuoteId: {
      type: DataTypes.INTEGER,
    },
    state: {
      type: DataTypes.STRING(64),
    },
    status: {
      type: DataTypes.STRING(64),
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize: db,
    timestamps: false,
  })
}

// MagentoOrder - source, Order - target
// MagentoOrder.belongsTo(Order, {
//   as: 'order',
//   foreignKey: 'orderId',
// })

/*
(property) BelongsToOptions.targetKey?: string | undefined
The name of the field __IN_SOURCE_TABLE__ to use as the key for the association in the target table. Defaults to the primary key of the target table

(property) AssociationOptions.foreignKey?: string | ForeignKeyOptions | undefined
The name of the foreign key in the target table or an object representing the type definition for the foreign column (see Sequelize.define for syntax). When using an object, you can add a name property to set the name of the column. Defaults to the name of source + primary key of source */
