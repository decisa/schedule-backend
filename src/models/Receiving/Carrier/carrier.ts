// Carrier/carrier.ts
// 14. Carriers:
// id (PK)
// name
// type (e.g., 'container', 'local_vendor', 'fedex', 'dhl')
// contact_person
// phone
// email
// address
// account_number (nullable)
// created_at
// updated_at

// done - One-to-many relationship between Carriers and Shipments.
import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes,
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
import type { Shipment } from '../Shipment/shipment'

type CarrierType = 'container' | 'freight' | 'parcel'
export class Carrier extends Model<InferAttributes<Carrier>, InferCreationAttributes<Carrier>> {
  declare id: CreationOptional<number>

  declare name: string

  declare type: CarrierType

  declare contactName?: string

  declare phone?: string

  declare altPhone?: string

  declare email?: string

  declare accountNumber?: string

  // tracking url template?
  // address ?

  // associations
  declare shipments?: NonAttribute<Shipment>

  declare public static associations: {
    shipments: Association<Carrier, Shipment>,
  }

  // MIXINS
  // Shipments:
  declare createShipment: HasManyCreateAssociationMixin<Shipment, 'carrierId'>

  declare getShipments: HasManyGetAssociationsMixin<Shipment>

  declare countShipments: HasManyCountAssociationsMixin

  declare hasShipment: HasManyHasAssociationMixin<Shipment, number>

  declare hasShipments: HasManyHasAssociationsMixin<Shipment, number>

  declare setShipments: HasManySetAssociationsMixin<Shipment, number>

  declare addShipment: HasManyAddAssociationMixin<Shipment, number>

  declare addShipments: HasManyAddAssociationsMixin<Shipment, number>

  declare removeShipment: HasManyRemoveAssociationMixin<Shipment, number>

  declare removeShipments: HasManyRemoveAssociationsMixin<Shipment, number>
}

export function initCarrier(db: Sequelize) {
  Carrier.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountNumber: DataTypes.STRING,
      altPhone: DataTypes.STRING,
      contactName: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
    },
    {
      sequelize: db,
    },
  )
}
