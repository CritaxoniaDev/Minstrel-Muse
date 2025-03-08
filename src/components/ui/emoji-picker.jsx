import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export function EmojiPicker({ onEmojiSelect, ...props }) {
  return (
    <Picker 
      data={data} 
      onEmojiSelect={onEmojiSelect}
      theme="auto"
      {...props}
    />
  )
}
