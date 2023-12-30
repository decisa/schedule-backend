// import { MigrationFn } from 'umzug';
import { QueryTypes } from 'sequelize'
import { ProductConfiguration } from '../src/models/Sales/ProductConfiguration/productConfiguration'
import { Migration } from '../umzug'
import { PurchasedSummaryView, purchasedSummaryView, totalQtyPurchasedField } from '../src/views/PurchasedSummary/purchasedSummary'
import { ShippedSummaryView, shippedSummaryView, totalQtyShippedField } from '../src/views/ShippedSummary/shippedSummary'
import { ReceivedSummaryView, totalQtyReceivedField } from '../src/views/ReceivedSummary/receivedSummary'

const productSummaryView = 'ProductSummaryViews'

export const up: Migration = async ({ context: queryIterface }) => {
  const db = queryIterface.sequelize
  // raw SQL query for checking if the view exists with some dynamic values from existing models
  const checkViewExistsSql = `
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.VIEWS 
  WHERE TABLE_SCHEMA = '${db.getDatabaseName()}'
  AND TABLE_NAME = '${productSummaryView}';
  `
  // dyncamically create query parts for type safety
  const pcId = `pc.${ProductConfiguration.getAttributes().id.field || 'id'}`
  console.log('psvConfigId')
  const psvConfigId = `psv.${PurchasedSummaryView.getAttributes().configurationId.field || 'configurationId'}`
  const psvTotalQtyPurchased = `psv.${PurchasedSummaryView.getAttributes()[totalQtyPurchasedField].field || totalQtyPurchasedField}`

  console.log('ssvConfigId')
  const ssvConfigId = `ssv.${ShippedSummaryView.getAttributes().configurationId.field || 'configurationId'}`
  const ssvTotalQtyShipped = `ssv.${ShippedSummaryView.getAttributes()[totalQtyShippedField].field || totalQtyShippedField}`

  console.log('rsvConfigId')
  const rsvConfigId = `rsv.${ReceivedSummaryView.getAttributes().configurationId.field || 'configurationId'}`

  console.log('rsvTotalQtyReceived')
  const rsvTotalQtyReceived = `rsv.${ReceivedSummaryView.getAttributes()[totalQtyReceivedField].field || totalQtyReceivedField}`

  // raw SQL query to create the view:
  const createViewSql = `
  CREATE VIEW ${productSummaryView} AS
  SELECT 
    ${pcId} as configurationId,
    COALESCE(${psvTotalQtyPurchased}, 0) as qtyPurchased,
    COALESCE(${ssvTotalQtyShipped}, 0) as qtyShipped,
    COALESCE(${rsvTotalQtyReceived}, 0) as qtyReceived
  FROM 
    ${ProductConfiguration.tableName} pc
    LEFT JOIN ${purchasedSummaryView} psv ON ${pcId} = ${psvConfigId}
    LEFT JOIN ${shippedSummaryView} ssv ON ${ssvConfigId} = ${pcId}
    LEFT JOIN ${ReceivedSummaryView.tableName} rsv ON ${rsvConfigId} = ${pcId};
  `

  // search if the view with a given name already exists
  const results = await db.query<{ 'COUNT(*)': number }>(checkViewExistsSql, { type: QueryTypes.SELECT })
  const totalCount = results[0]['COUNT(*)']
  const viewExists = totalCount > 0

  // if view exists - drop it
  if (viewExists) {
    console.log(`view ${productSummaryView} already exists`)
    const dropViewQuery = `DROP VIEW ${productSummaryView}`
    await queryIterface.sequelize.query(dropViewQuery)
    console.log(`view ${productSummaryView} was dropped.`)
  }
  // create the view

  console.log(`creating new ${productSummaryView} view.`)
  await db.query(createViewSql)
}

export const down: Migration = async ({ context: queryIterface }) => {
  const dropViewQuery = `DROP VIEW ${productSummaryView}`
  await queryIterface.sequelize.query(dropViewQuery)
  console.log(`view ${productSummaryView} was dropped.`)
  // await queryIterface.dropTable('ReceivedItems')
}
