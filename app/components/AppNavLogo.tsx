import icon from '@/app/icon.svg'
import Image from 'next/image'

export function AppNavLogo() {
  return <Image src={icon.src} alt="" width={24} height={24} />
}
