'use client'

import { Categories, EmojiStyle, Theme } from 'emoji-picker-react'
import { CSSProperties, useState, useRef } from 'react'
import * as Popover from '@radix-ui/react-popover'
import dynamic from 'next/dynamic'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

export function EmojiSelect() {
  const [open, setOpen] = useState(false)
  const input = useRef<HTMLInputElement | null>(null)

  return (
    <div>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger className="text-left">
          <input
            ref={input}
            name="emoji"
            type="text"
            maxLength={1}
            defaultValue="😀"
            className="text-2xl bg-transparent"
          />
        </Popover.Trigger>
        <Popover.Anchor />
        <Popover.Portal>
          <Popover.Content className="px-4">
            <EmojiPicker
              skinTonesDisabled
              searchPlaceHolder="이모지 검색하기"
              emojiStyle={EmojiStyle.NATIVE}
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
              theme={Theme.AUTO}
              style={
                {
                  '--epr-emoji-size': '20px',
                  '--epr-category-navigation-button-size': '24px',
                } as CSSProperties
              }
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
