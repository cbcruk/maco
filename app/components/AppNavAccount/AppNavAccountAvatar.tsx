import { Match } from 'effect'
import { User } from 'next-auth'
import Image from 'next/image'

export function AppNavAccountAvatar({ image }: Pick<User, 'image'>) {
  return (
    <>
      {Match.value(image).pipe(
        Match.when(Match.string, (image) => (
          <Image src={image} alt="" width={24} height={24} />
        )),
        Match.orElse(() => null)
      )}
    </>
  )
}
