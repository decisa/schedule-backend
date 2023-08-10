import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('PurchaseOrderItems', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    qtyOrdered: {
      type: DataTypes.INTEGER,
      allowNull: false,
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

    // foreign keys:
    // purchaseOrderId: ForeignKey<PurchaseOrder['id']>
    // configurationId: ForeignKey<ProductConfiguration['id']>
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'PurchaseOrders',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    configurationId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Brands',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  })

  await queryIterface.addConstraint('PurchaseOrderItems', {
    fields: ['purchaseOrderId', 'configurationId'],
    type: 'unique',
    name: 'poid_configid_constraint',
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('PurchaseOrderItems')
}
