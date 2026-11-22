export type ScreenId = 'splash' | 'intro' | 'map' | 'level' | 'finale'

export type LevelId = 1 | 2 | 3 | 4 | 5

export type ActNumber = 1 | 2 | 3

export type BomboMood = 'happy' | 'thinking' | 'celebrate' | 'sleepy'

export type StickerId = 'sun' | 'star' | 'kite' | 'cloud'

export type RelicIconId =
  | 'key'
  | 'scale'
  | 'bridge'
  | 'mail'
  | 'compass'
  | 'wind'
  | 'shield'
  | 'drop'
  | 'lantern'
  | 'firefly'

export interface StoryBridge {
  levelId: LevelId
  toAct: 2 | 3
  title: string
  storyText: string
  relicName: string
  relicIcon: RelicIconId
  bomboMood: BomboMood
  ctaLabel: string
}

export interface LevelMeta {
  id: LevelId
  chapterLabel: string
  title: string
  subtitle: string
  facetTitle: string
  facetSummary: string
  badgeId: string
  badgeName: string
  badgeColor: string
  themeKey: `level-${LevelId}`
  backgroundArt: string
  introScript: string
  completionTakeaway: string
  acts: readonly [string, string, string]
}

export interface FeedbackState {
  id: number
  kind: 'success' | 'hint' | 'info'
  text: string
}

export interface GameProgressState {
  playerName: string
  playerSticker: StickerId
  hasSeenIntro: boolean
  unlockedLevel: LevelId
  allCompleted: boolean
  levelStars: Record<LevelId, number>
  earnedBadges: LevelId[]
  demoMode: boolean
}
