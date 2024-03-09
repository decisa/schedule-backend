// import { MigrationFn } from 'umzug';
import { QueryTypes } from 'sequelize'
import { Migration } from '../umzug'
import {
  deliverySummaryViewName, qtyConfirmedField, qtyPlannedField, qtyScheduledField,
} from '../src/views/DeliverySummary/deliverySummary'
import { ProductConfiguration } from '../src/models/Sales/ProductConfiguration/productConfiguration'
import { DeliveryItem } from '../src/models/Delivery/DeliveryItem/DeliveryItem'
import { Delivery } from '../src/models/Delivery/Delivery/Delivery'

export const up: Migration = async ({ context: queryIterface }) => {
  const db = queryIterface.sequelize
  // raw SQL query for checking if the view exists with some dynamic values from existing models
  const checkViewExistsSql = `
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.VIEWS 
  WHERE TABLE_SCHEMA = '${db.getDatabaseName()}'
  AND TABLE_NAME = '${deliverySummaryViewName}';
  `
  // dyncamically create query parts for type safety
  const pcId = `pc.${ProductConfiguration.getAttributes().id.field || 'id'}`
  const diConfigurationId = `di.${DeliveryItem.getAttributes().configurationId.field || 'configurationId'}`
  const diDeliveryId = `di.${DeliveryItem.getAttributes().deliveryId.field || 'deliveryId'}`
  const dId = `d.${Delivery.getAttributes().id.field || 'id'}`
  const dStatus = `d.${Delivery.getAttributes().status.field || 'status'}`
  const diQty = `di.${DeliveryItem.getAttributes().qty.field || 'qty'}`
  const dDeliveryStopId = `d.${Delivery.getAttributes().deliveryStopId.field || 'deliveryStopId'}`

  // raw SQL query to create the view:
  const createViewSql = `
  CREATE VIEW ${deliverySummaryViewName} AS
  SELECT 
    ${pcId} as configurationId,  
    CAST(COALESCE(SUM(CASE WHEN (${dDeliveryStopId}  IS NULL) THEN ${diQty} ELSE 0 END),0) as SIGNED) AS ${qtyPlannedField},
    CAST(SUM(CASE WHEN (${dDeliveryStopId}  IS NOT NULL) AND  (${dStatus} != 'confirmed') THEN ${diQty} ELSE 0 END) as SIGNED) AS ${qtyScheduledField},
    CAST(SUM(CASE WHEN (${dDeliveryStopId}  IS NOT NULL) AND ( ${dStatus} = 'confirmed') THEN ${diQty} ELSE 0 END) as SIGNED) AS ${qtyConfirmedField}
  FROM 
    ${ProductConfiguration.tableName} pc
    LEFT JOIN ${DeliveryItem.tableName} di ON ${pcId} = ${diConfigurationId}
    LEFT JOIN ${Delivery.tableName} d ON ${diDeliveryId} = ${dId}
  GROUP BY ${pcId};
  `
/*
  CREATE VIEW DeliverySummaryView AS
  SELECT
    pc.id as configurationId,
    --pc.qtyOrdered as qtyOrdered,
    SUM(COALESCE(CASE WHEN (d.deliveryStopId  IS NULL) THEN di.qty ELSE 0 END),0) AS totalPlanned,
    SUM(CASE WHEN (d.deliveryStopId  IS NOT NULL) AND (d.status != 'confirmed') THEN di.qty ELSE 0 END) AS totalScheduled,
    SUM(CASE WHEN (d.deliveryStopId  IS NOT NULL) AND (d.status = 'confirmed') THEN di.qty ELSE 0 END) AS totalConfirmed
  FROM
    productconfigurations pc
    LEFT JOIN deliveryitems di ON pc.id = di.configurationId
    LEFT JOIN deliveries d ON di.deliveryId = d.id
  GROUP BY pc.id`
*/

  // search if the view with a given name already exists
  const results = await db.query<{ 'COUNT(*)': number }>(checkViewExistsSql, { type: QueryTypes.SELECT })
  const totalCount = results[0]['COUNT(*)']
  const viewExists = totalCount > 0

  // if view exists - drop it first
  if (viewExists) {
    console.log(`view ${deliverySummaryViewName} already exists`)
    const dropViewQuery = `DROP VIEW ${deliverySummaryViewName}`
    await queryIterface.sequelize.query(dropViewQuery)
    console.log(`view ${deliverySummaryViewName} was dropped.`)
  }
  // create the view
  console.log(`creating new ${deliverySummaryViewName} view.`)
  await db.query(createViewSql)
}

export const down: Migration = async ({ context: queryIterface }) => {
  const dropViewQuery = `DROP VIEW ${deliverySummaryViewName}`
  await queryIterface.sequelize.query(dropViewQuery)
  console.log(`view ${deliverySummaryViewName} was dropped.`)
}
