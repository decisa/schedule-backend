import type { CreationAttributes } from 'sequelize'
import type { OrderAddress } from './Sales/OrderAddress/orderAddress'
import type { MagentoOrderAddress } from './Sales/MagentoOrderAddress/magentoOrderAddress'
import { OrderComment } from './Sales/OrderComment/orderComment'

export type OrderAddessShape = CreationAttributes<OrderAddress> & {
  magento?: CreationAttributes<MagentoOrderAddress>
}

export type OrderCommentShape = CreationAttributes<OrderComment>
