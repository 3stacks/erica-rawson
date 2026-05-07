import 'dotenv/config'
import { getPayload } from 'payload'
import { createLocalReq } from 'payload'
import config from './src/payload.config'
import { seed } from './src/endpoints/seed'

async function run() {
  const payload = await getPayload({ config })
  const req = await createLocalReq({}, payload)
  await seed({ payload, req })
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
