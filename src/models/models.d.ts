import type { CreationAttributes } from 'sequelize'
import type { OrderAddress } from './Sales/OrderAddress/orderAddress'
import type { MagentoOrderAddress } from './Sales/MagentoOrderAddress/magentoOrderAddress'
import type { OrderComment } from './Sales/OrderComment/orderComment'
import type { Brand } from './Brand/brand'
import type { ProductOption } from './Sales/ProductOption/productOption'
import type { Order } from './Sales/Order/order'
import type { RouteStop } from './Delivery/RouteStop/routeStop'

export type OrderAddessShape = CreationAttributes<OrderAddress> & {
  magento?: CreationAttributes<MagentoOrderAddress>
}

export type OrderCommentShape = CreationAttributes<OrderComment>

export type BrandShape = CreationAttributes<Brand>

export type ProductOptionShape = CreationAttributes<ProductOption>

export type OrderAddressShape = CreationAttributes<OrderAddress>

export type OrderShape = CreationAttributes<Order>

export type RouteStopShape = CreationAttributes<RouteStop>
