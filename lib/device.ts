import { uuidv7 } from './uuid'
import { nextHlc } from './hlc'

const DEVICE_ID_KEY = 'maco:device-id'
const HLC_KEY = 'maco:hlc'

/**
 * 기기 식별자. 브라우저 저장소에 한 번 만들어 두고 계속 쓴다.
 * 같은 밀리초에 두 기기가 쓴 리비전의 순서를 가르는 최종 타이브레이커이므로
 * 기기마다 달라야 한다.
 */
export function getDeviceId() {
  const stored = localStorage.getItem(DEVICE_ID_KEY)

  if (stored) {
    return stored
  }

  const created = uuidv7()

  localStorage.setItem(DEVICE_ID_KEY, created)

  return created
}

/**
 * 이 기기의 다음 논리 시계를 발급하고 저장한다.
 */
export function issueHlc() {
  const device_id = getDeviceId()
  const issued = nextHlc({
    previous: localStorage.getItem(HLC_KEY),
    device_id,
  })

  localStorage.setItem(HLC_KEY, issued)

  return { device_id, hlc: issued }
}

/**
 * 로그아웃 시 호출한다. 공용 기기에 로컬 데이터가 남으면 그대로 정보 유출이다.
 */
export function clearDeviceState() {
  localStorage.removeItem(HLC_KEY)
  localStorage.removeItem(DEVICE_ID_KEY)
}
