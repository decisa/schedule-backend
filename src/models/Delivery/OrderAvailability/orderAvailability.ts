// OrderAvailability/orderAvailability.ts
// 19. OrderAvailability:
// id (PK)
// order_id (FK from Orders)
// startDate
// endDate
// start_time (nullable)
// end_time (nullable)
// recurring (boolean)
// days_of_week (nullable, comma-separated values, e.g., 'Mon,Tue,Wed')
// notes
// created_at
// updated_at

// DONE: One-to-many relationship between Orders and OrderAvailability.
import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes, ForeignKey,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from 'sequelize'
import type { Order } from '../../Sales/Order/order'

export class OrderAvailability extends Model<InferAttributes<OrderAvailability>, InferCreationAttributes<OrderAvailability>> {
  declare id: CreationOptional<number>

  declare startDate?: Date

  declare endDate?: Date

  declare startTime?: number // in minutes (nullable)

  declare endTime?: number // in minutes (nullable)

  declare recurring?: boolean

  declare daysOfWeek?: string // (nullable, comma-separated values, e.g., 'Mon,Tue,Wed')

  declare notes?: string

  // associations
  declare orderId: ForeignKey<Order['id']>

  declare order?: NonAttribute<Order>

  declare public static associations: {
    order: Association<OrderAvailability, Order>,
  }

  // MIXINS
  // order:
  declare getOrder: BelongsToGetAssociationMixin<Order>

  declare setOrder: BelongsToSetAssociationMixin<Order, number>

  declare createOrder: BelongsToCreateAssociationMixin<Order>
}

export function initOrderAvailability(db: Sequelize) {
  OrderAvailability.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      startTime: DataTypes.INTEGER,
      endTime: DataTypes.INTEGER,
      recurring: DataTypes.BOOLEAN,
      daysOfWeek: DataTypes.STRING,
      notes: DataTypes.STRING,
    },
    {
      sequelize: db,
    },
  )
}
