// import { MigrationFn } from 'umzug';
import { QueryTypes } from 'sequelize'
import { PurchaseOrderItem } from '../src/models/Receiving/PurchaseOrderItem/purchaseOrderItem'

import { Migration } from '../umzug'
import { purchasedSummaryView, totalQtyPurchasedField } from '../src/views/PurchasedSummary/purchasedSummary'

export const up: Migration = async ({ context: queryIterface }) => {
  const db = queryIterface.sequelize
  // raw SQL query for checking if the view exists with some dynamic values from existing models
  const checkViewExistsSql = `
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.VIEWS 
  WHERE TABLE_SCHEMA = '${db.getDatabaseName()}'
  AND TABLE_NAME = '${purchasedSummaryView}';
  `
  // dyncamically create query parts for type safety
  const poiQtyPurchased = `poi.${PurchaseOrderItem.getAttributes().qtyPurchased.field || 'qtyPurchased'}`
  const poiConfigurationId = `poi.${PurchaseOrderItem.getAttributes().configurationId.field || 'configurationId'}`

  // raw SQL query to create the view:
  const createViewSql = `
  CREATE VIEW ${purchasedSummaryView} AS
  SELECT 
    ${poiConfigurationId} as configurationId,
    CAST(SUM(${poiQtyPurchased}) as SIGNED) as ${totalQtyPurchasedField}
  FROM 
    ${PurchaseOrderItem.tableName} poi
  GROUP BY ${poiConfigurationId};
  `

  // search if the view with a given name already exists
  const results = await db.query<{ 'COUNT(*)': number }>(checkViewExistsSql, { type: QueryTypes.SELECT })
  const totalCount = results[0]['COUNT(*)']
  const viewExists = totalCount > 0

  // if view exists - drop it first
  if (viewExists) {
    console.log(`view ${purchasedSummaryView} already exists`)
    const dropViewQuery = `DROP VIEW ${purchasedSummaryView}`
    await queryIterface.sequelize.query(dropViewQuery)
    console.log(`view ${purchasedSummaryView} was dropped.`)
  }
  // create the view
  console.log(`creating new ${purchasedSummaryView} view.`)
  await db.query(createViewSql)
}

export const down: Migration = async ({ context: queryIterface }) => {
  const dropViewQuery = `DROP VIEW ${purchasedSummaryView}`
  await queryIterface.sequelize.query(dropViewQuery)
  console.log(`view ${purchasedSummaryView} was dropped.`)
  // await queryIterface.dropTable('ReceivedItems')
}
