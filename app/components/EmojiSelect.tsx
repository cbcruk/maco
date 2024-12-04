'use client'

import { Categories, EmojiStyle, Theme } from 'emoji-picker-react'
import { CSSProperties, useState, useTransition } from 'react'
import * as Popover from '@radix-ui/react-popover'
import dynamic from 'next/dynamic'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

export function EmojiSelect() {
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [emoji, setEmoji] = useState('😀')

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="text-left text-2xl bg-transparent">
        {emoji}
        <input type="hidden" name="emoji" value={emoji} />
      </Popover.Trigger>
      <Popover.Anchor />
      <Popover.Portal>
        <Popover.Content onOpenAutoFocus={(e) => e.preventDefault()}>
          <EmojiPicker
            skinTonesDisabled
            searchPlaceHolder="이모지 검색하기"
            autoFocusSearch={false}
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
              startTransition(() => {
                setEmoji(selected.emoji)
                setOpen(false)
              })
            }}
            width={320}
            height={320}
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
  )
}
