import { Categories } from 'emoji-picker-react'
import { CSSProperties, lazy, Suspense, useState, useRef } from 'react'
import * as Popover from '@radix-ui/react-popover'

const EmojiPicker = lazy(() => import('emoji-picker-react'))

export function EmojiSelect() {
  const [open, setOpen] = useState(false)
  const input = useRef<HTMLInputElement | null>(null)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="text-left">
        <input
          ref={input}
          name="emoji"
          type="text"
          maxLength={1}
          defaultValue="😀"
          className="text-lg bg-transparent"
        />
      </Popover.Trigger>
      <Popover.Anchor />
      <Popover.Portal>
        <Popover.Content className="px-4">
          <Suspense fallback="로딩중...">
            <EmojiPicker
              searchDisabled
              previewConfig={{
                showPreview: false,
              }}
              categories={[
                {
                  category: Categories.SUGGESTED,
                  name: 'Frequently Used',
                },
                {
                  category: Categories.CUSTOM,
                  name: 'Custom Emojis',
                },
                {
                  category: Categories.SMILEYS_PEOPLE,
                  name: 'Smileys & People',
                },
                {
                  category: Categories.ANIMALS_NATURE,
                  name: 'Animals & Nature',
                },
                {
                  category: Categories.FOOD_DRINK,
                  name: 'Food & Drink',
                },
                {
                  category: Categories.TRAVEL_PLACES,
                  name: 'Travel & Places',
                },
                {
                  category: Categories.ACTIVITIES,
                  name: 'Activities',
                },
                {
                  category: Categories.OBJECTS,
                  name: 'Objects',
                },
                {
                  category: Categories.SYMBOLS,
                  name: 'Symbols',
                },
                {
                  category: Categories.FLAGS,
                  name: 'Flags',
                },
              ]}
              onEmojiClick={(selected) => {
                input.current!.value = selected.emoji

                setOpen(false)
              }}
              height={250}
              style={
                {
                  '--epr-emoji-size': '20px',
                  '--epr-category-navigation-button-size': '20px',
                } as CSSProperties
              }
            />
          </Suspense>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
