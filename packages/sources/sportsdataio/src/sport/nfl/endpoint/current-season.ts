import { HTTP, Validator } from '@chainlink/ea-bootstrap'
import { ExecuteWithConfig } from '@chainlink/types'
import { Config } from '../../../config'

export const NAME = 'current-season'

const customParams = {}

export const execute: ExecuteWithConfig<Config> = async (request, _, config) => {
  const validator = new Validator(request, customParams)

  const jobRunID = validator.validated.id
  const url = `/nfl/scores/json/CurrentSeason`

  const params = {
    key: config.nflScoresKey,
  }

  const options = { ...config.api, params, url }

  const response = await HTTP.request(options)
  const result = response.data
  response.data = {
    result,
  }

  return HTTP.success(jobRunID, response, config.verbose)
}
