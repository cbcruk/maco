import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

/**
 * Next.js 16 은 `next lint` 를 제거해 ESLint CLI 를 직접 쓴다.
 * `@next/eslint-plugin-next` 도 flat config 가 기본이라 `.eslintrc.json` 대신
 * 이 파일을 쓴다.
 */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'drizzle/**'],
  },
  ...coreWebVitals,
  ...typescript,
]

export default config
