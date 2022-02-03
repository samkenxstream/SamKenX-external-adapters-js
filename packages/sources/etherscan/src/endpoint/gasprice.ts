import { HTTP, Validator, Logger } from '@chainlink/ea-bootstrap'
import { Config, ExecuteWithConfig, InputParameters } from '@chainlink/types'

export const supportedEndpoints = ['gasprice']

export interface ResponseSchema {
  status: number
  message: string
  result: {
    LastBlock: number
    SafeGasPrice: number
    ProposeGasPrice: number
    FastGasPrice: number
  }
}

interface Speed {
  safe: string
  medium: string
  fast: string
}

const speedType: Speed = {
  safe: 'SafeGasPrice',
  medium: 'ProposeGasPrice',
  fast: 'FastGasPrice',
}

interface ErrorSchema {
  status: '0' | '1'
  message: string
  result: string
}

const customError = (data: ErrorSchema) => data.status === '0'

export const inputParameters: InputParameters = {
  speed: {
    required: false,
    description: 'The desired speed',
    type: 'string',
    options: ['safe', 'medium', 'fast'],
    default: 'fast',
  },
}

export const execute: ExecuteWithConfig<Config> = async (request, _, config) => {
  const validator = new Validator(request, inputParameters)

  const jobRunID = validator.validated.id
  const speedValue: keyof Speed = validator.validated.data.speed
  const speed = speedType[speedValue] || speedType.fast
  const url = `/api`

  const params = {
    module: 'gastracker',
    action: 'gasoracle',
    apikey: config.apiKey,
  }

  const options = {
    ...config.api,
    params,
    url,
  }

  const response = await HTTP.request<ResponseSchema>(options, customError)
  if (!config.apiKey) {
    Logger.warn(response.data.message)
  }
  const result = HTTP.validateResultNumber(response.data, ['result', speed])
  return HTTP.success(jobRunID, HTTP.withResult(response, result), config.verbose)
}
