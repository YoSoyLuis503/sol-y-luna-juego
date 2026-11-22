<script setup lang="ts">
import type { ActNumber, LevelMeta } from '@/types/game'
import { useGameProgress } from '@/composables/useGameProgress'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'

const {
  levelMeta = null,
  currentAct = 1,
  showBackToMap = false,
} = defineProps<{
  levelMeta?: LevelMeta | null
  currentAct?: ActNumber
  showBackToMap?: boolean
}>()

const emit = defineEmits<{
  goMap: []
  openAlbum: []
}>()

const { totalStars, progress } = useGameProgress()
const { sfxEnabled, toggleSfx, playTap } = useSoundEffects()
const { voiceEnabled, toggleVoice } = useVoiceNarrator()

function handleGoMap(): void {
  playTap()
  emit('goMap')
}

function handleOpenAlbum(): void {
  playTap()
  emit('openAlbum')
}
</script>

<template>
  <header class="top-hud">
    <div class="hud-left">
      <button
        v-if="showBackToMap"
        type="button"
        class="hud-pill-btn"
        @click="handleGoMap"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span>Mapa</span>
      </button>

      <div v-if="levelMeta" class="chapter-pill">
        <span class="chapter-name">{{ levelMeta.chapterLabel }}: {{ levelMeta.title }}</span>
      </div>
    </div>

    <div v-if="levelMeta" class="act-stepper" aria-label="Progreso del capítulo">
      <div
        v-for="(actName, idx) in levelMeta.acts"
        :key="actName"
        class="act-step"
        :class="{
          'is-done': idx + 1 < currentAct,
          'is-active': idx + 1 === currentAct,
        }"
        :title="actName"
      >
        <span class="act-dot">
          <svg v-if="idx + 1 < currentAct" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <template v-else>{{ idx + 1 }}</template>
        </span>
        <span class="act-label">{{ actName }}</span>
      </div>
    </div>

    <div class="hud-right">
      <div class="star-counter" :aria-label="`${totalStars} de 15 estrellas`">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#F5B82E" stroke="#C97A0C" stroke-width="1.8" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span>{{ totalStars }}/15</span>
      </div>

      <button
        type="button"
        class="hud-icon-btn"
        :aria-label="voiceEnabled ? 'Silenciar voz narradora' : 'Activar voz narradora'"
        :title="voiceEnabled ? 'Voz activada' : 'Voz desactivada'"
        :class="{ 'is-muted': !voiceEnabled }"
        @click="toggleVoice"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line v-if="!voiceEnabled" x1="3" y1="3" x2="21" y2="21" stroke="#E3644B" stroke-width="2.6" />
        </svg>
      </button>

      <button
        type="button"
        class="hud-icon-btn"
        :aria-label="sfxEnabled ? 'Silenciar efectos de sonido' : 'Activar efectos de sonido'"
        :title="sfxEnabled ? 'Sonidos activados' : 'Sonidos desactivados'"
        :class="{ 'is-muted': !sfxEnabled }"
        @click="toggleSfx"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          <line v-if="!sfxEnabled" x1="3" y1="3" x2="21" y2="21" stroke="#E3644B" stroke-width="2.6" />
        </svg>
      </button>

      <button
        type="button"
        class="hud-pill-btn album-btn"
        @click="handleOpenAlbum"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
        <span class="album-label">Álbum ({{ progress.earnedBadges.length }}/5)</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.top-hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.65rem;
  width: 100%;
  padding: 0.65rem 1rem;
  background-color: rgba(255, 253, 247, 0.94);
  border: 2px solid var(--theme-border);
  border-radius: 24px;
  box-shadow: var(--shadow-paper-sm);
}

.hud-left,
.hud-right {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.hud-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  background-color: var(--paper-cream-tint);
  border: 2px solid var(--theme-border);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--theme-ink);
  transition: transform 140ms var(--ease-out), background-color 140ms ease;
}

.hud-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background-color: var(--paper-cream-tint);
  border: 2px solid var(--theme-border);
  color: var(--theme-ink);
  transition: transform 140ms var(--ease-out), background-color 140ms ease;
}

.hud-icon-btn.is-muted {
  opacity: 0.68;
}

.chapter-pill {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background-color: var(--theme-accent-soft);
  border: 2px solid var(--theme-border);
}

.chapter-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.98rem;
  color: var(--theme-ink);
}

.act-stepper {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.act-step {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  padding: 0.28rem 0.65rem 0.28rem 0.32rem;
  border-radius: 999px;
  background-color: var(--paper-cream-tint);
  border: 1.5px solid var(--theme-border);
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--ink-secondary);
}

.act-step.is-active {
  background-color: var(--theme-accent);
  border-color: var(--theme-accent-deep);
  color: #FFFFFF;
}

.act-step.is-done {
  background-color: #E2F5E9;
  border-color: #82C79D;
  color: #1F5C38;
}

.act-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.85);
  color: var(--ink-primary);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.8rem;
}

.act-step.is-done .act-dot {
  background-color: #38945D;
  color: #FFFFFF;
}

.star-counter {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background-color: #FFF4D4;
  border: 2px solid #EBC773;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.98rem;
  color: #4D3806;
  font-variant-numeric: tabular-nums;
}

@media (hover: hover) and (pointer: fine) {
  .hud-pill-btn:hover,
  .hud-icon-btn:hover {
    transform: translateY(-1px);
  }
}

@media (max-width: 980px) {
  .act-label {
    display: none;
  }
  .act-step {
    padding: 0.22rem;
  }
}

@media (max-width: 640px) {
  .top-hud {
    padding: 0.5rem 0.65rem;
  }
  .chapter-pill {
    display: none;
  }
  .album-label {
    display: none;
  }
}
</style>
