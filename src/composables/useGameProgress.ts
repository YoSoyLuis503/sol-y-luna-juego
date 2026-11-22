import { computed, reactive, readonly } from 'vue'
import type { GameProgressState, LevelId, StickerId } from '@/types/game'

const STORAGE_KEY = 'sol-y-luna-progress-v1'

function createDefaultState(): GameProgressState {
  return {
    playerName: '',
    playerSticker: 'sun',
    hasSeenIntro: false,
    unlockedLevel: 1,
    allCompleted: false,
    levelStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    earnedBadges: [],
    demoMode: false,
  }
}

function loadInitialState(): GameProgressState {
  const defaults = createDefaultState()
  if (typeof window === 'undefined') return defaults

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<GameProgressState>
    return {
      ...defaults,
      ...parsed,
      levelStars: {
        ...defaults.levelStars,
        ...(parsed.levelStars ?? {}),
      },
      earnedBadges: Array.isArray(parsed.earnedBadges) ? parsed.earnedBadges : [],
    }
  } catch {
    return defaults
  }
}

const state = reactive<GameProgressState>(loadInitialState())

function persist(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function useGameProgress() {
  const totalStars = computed(() =>
    Object.values(state.levelStars).reduce((sum, count) => sum + count, 0),
  )

  const displayName = computed(() =>
    state.playerName.trim() ? state.playerName.trim() : 'Amiguito',
  )

  const completedCount = computed(() => state.earnedBadges.length)

  function isLevelUnlocked(id: LevelId): boolean {
    if (state.demoMode) return true
    return id <= state.unlockedLevel
  }

  function setPlayerProfile(name: string, sticker: StickerId): void {
    state.playerName = name.trim().slice(0, 22)
    state.playerSticker = sticker
    state.hasSeenIntro = true
    persist()
  }

  function completeLevel(id: LevelId, stars = 3): void {
    const clampedStars = Math.max(1, Math.min(3, stars))
    if (clampedStars > state.levelStars[id]) {
      state.levelStars[id] = clampedStars
    }
    if (!state.earnedBadges.includes(id)) {
      state.earnedBadges.push(id)
    }
    if (id < 5) {
      const next = (id + 1) as LevelId
      if (next > state.unlockedLevel) {
        state.unlockedLevel = next
      }
    } else {
      state.allCompleted = true
    }
    persist()
  }

  function toggleDemoMode(): void {
    state.demoMode = !state.demoMode
    persist()
  }

  function resetProgress(): void {
    const fresh = createDefaultState()
    state.playerName = fresh.playerName
    state.playerSticker = fresh.playerSticker
    state.hasSeenIntro = false
    state.unlockedLevel = 1
    state.allCompleted = false
    state.levelStars = { ...fresh.levelStars }
    state.earnedBadges = []
    state.demoMode = false
    persist()
  }

  return {
    progress: readonly(state),
    totalStars,
    displayName,
    completedCount,
    isLevelUnlocked,
    setPlayerProfile,
    completeLevel,
    toggleDemoMode,
    resetProgress,
  }
}
