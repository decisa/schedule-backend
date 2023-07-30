import { migrator } from './umzug'

if (require.main === module) {
  migrator.runAsCLI()
    .then(() => {
      console.log('Migrator complted successfully')
      // exit with success
      process.exit(0)
    })
    .catch((err) => {
      console.log('Migrator has failed')
      console.log(err)
      // exit with failure
      process.exit(1)
    })
}
