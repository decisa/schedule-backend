import type { CreationAttributes } from 'sequelize'
import type { OrderAddress } from './Sales/OrderAddress/orderAddress'
import type { MagentoOrderAddress } from './Sales/MagentoOrderAddress/magentoOrderAddress'

export type OrderAddessShape = CreationAttributes<OrderAddress> & {
  magento?: CreationAttributes<MagentoOrderAddress>
}
