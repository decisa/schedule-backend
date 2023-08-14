import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'
import { CommentType } from '../src/models/Sales/OrderComment/orderComment'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('OrderComments', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    externalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    externalParentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customerNotified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    visibleOnFront: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(12),
      allowNull: false,
      defaultValue: 'order' satisfies CommentType,
    },
    status: DataTypes.STRING(64),
    // foreign keys:
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id',
      },
      // if order is deleted, delete all comments too
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
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('OrderComments')
}
