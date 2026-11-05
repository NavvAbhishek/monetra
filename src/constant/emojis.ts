export type EmojiGroup = 'all' | 'food' | 'travel' | 'home'

export const EMOJI_GROUP_OPTIONS: readonly { value: EmojiGroup; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'home', label: 'Home' },
]

/** Emoji picker list (M5, D4). `groups` = which filter tabs (besides All) show it. */
export const EMOJIS: readonly { emoji: string; groups: readonly Exclude<EmojiGroup, 'all'>[] }[] = [
  { emoji: '🍔', groups: ['food'] },
  { emoji: '🍕', groups: ['food'] },
  { emoji: '☕', groups: ['food'] },
  { emoji: '🥦', groups: ['food'] },
  { emoji: '🛒', groups: ['food', 'home'] },
  { emoji: '🏠', groups: ['home'] },
  { emoji: '💡', groups: ['home'] },
  { emoji: '📱', groups: ['home'] },
  { emoji: '🚌', groups: ['travel'] },
  { emoji: '🚕', groups: ['travel'] },
  { emoji: '⛽', groups: ['travel'] },
  { emoji: '✈️', groups: ['travel'] },
  { emoji: '🎬', groups: [] },
  { emoji: '🎮', groups: [] },
  { emoji: '🎵', groups: [] },
  { emoji: '📚', groups: [] },
  { emoji: '💊', groups: [] },
  { emoji: '🏋️', groups: [] },
  { emoji: '👕', groups: [] },
  { emoji: '🎁', groups: [] },
  { emoji: '🐶', groups: ['home'] },
  { emoji: '💇', groups: [] },
  { emoji: '🧾', groups: ['home'] },
  { emoji: '💰', groups: [] },
]

export const getEmojisForGroup = (group: EmojiGroup): string[] =>
  EMOJIS.filter((e) => group === 'all' || e.groups.includes(group)).map((e) => e.emoji)
