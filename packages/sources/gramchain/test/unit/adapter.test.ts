import { AdapterError, Requester } from '@chainlink/ea-bootstrap'
import { assertError } from '@chainlink/ea-test-helpers'
import { AdapterRequest } from '@chainlink/ea-bootstrap'
import { makeExecute } from '../../src/adapter'
import { TInputParameters } from '../../src/endpoint'

describe('execute', () => {
  const jobID = '1'
  const execute = makeExecute()
  process.env.API_KEY = process.env.API_KEY ?? 'test-key'

  describe('validation error', () => {
    const requests = [
      {
        name: 'invalid custodianID type',
        testData: { id: jobID, data: { custodianID: 1 } },
      },
      {
        name: 'invalid metalCode type',
        testData: { id: jobID, data: { metalCode: 1 } },
      },
      {
        name: 'invalid utilizationLockCode type',
        testData: { id: jobID, data: { utilizationLockCode: 1 } },
      },
    ]

    requests.forEach((req) => {
      it(`${req.name}`, async () => {
        try {
          await execute(req.testData as unknown as AdapterRequest<TInputParameters>, {})
        } catch (error) {
          const errorResp = Requester.errored(jobID, error as AdapterError)
          assertError({ expected: 400, actual: errorResp.statusCode }, errorResp, jobID)
        }
      })
    })
  })
})
