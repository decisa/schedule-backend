import { seeder } from './umzug'

if (require.main === module) {
  seeder.runAsCLI()
    .then(() => {
      console.log('Seeder complted successfully')
      // exit with success
      process.exit(0)
    })
    .catch((err) => {
      console.log('Seeder has failed')
      console.log(err)
      // exit with failure
      process.exit(1)
    })
}
