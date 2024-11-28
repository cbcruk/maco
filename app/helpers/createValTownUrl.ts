import { VAL_TOWN_URL_ORIGIN } from '../constants'

type GetValTownUrlParams = ConstructorParameters<typeof URL>[0]

export function createValTownUrl(url: GetValTownUrlParams) {
  return new URL(url, VAL_TOWN_URL_ORIGIN)
}
