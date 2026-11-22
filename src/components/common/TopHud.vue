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
  <header class="floating-hud">
    <div class="hud-left">
      <button
        v-if="showBackToMap"
        type="button"
        class="toy-icon-btn map-home-btn"
        aria-label="Volver al mapa"
        title="Volver al mapa"
        @click="handleGoMap"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>

      <div v-if="levelMeta" class="hud-pill chapter-pill">
        <span>{{ levelMeta.id }} · {{ levelMeta.title }}</span>
      </div>

      <div v-if="levelMeta" class="hud-pill right-pill">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span>{{ levelMeta.facetTitle }}</span>
      </div>
    </div>

    <div class="hud-right">
      <div v-if="levelMeta" class="act-dots-pill" aria-label="Progreso del capítulo">
        <span
          v-for="(actName, idx) in levelMeta.acts"
          :key="actName"
          class="act-seg"
          :class="{
            'is-done': idx + 1 < currentAct,
            'is-active': idx + 1 === currentAct,
          }"
          :title="actName"
        />
      </div>

      <div class="hud-pill star-pill" :aria-label="`${totalStars} de 15 estrellas`">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#F5B82E" stroke="#C47608" stroke-width="1.8" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span>{{ totalStars }}/15</span>
      </div>

      <button
        type="button"
        class="toy-icon-btn hud-circle-btn"
        :aria-label="voiceEnabled ? 'Silenciar voz narradora' : 'Activar voz narradora'"
        :title="voiceEnabled ? 'Voz activada' : 'Voz desactivada'"
        :class="{ 'is-muted': !voiceEnabled }"
        @click="toggleVoice"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line v-if="!voiceEnabled" x1="3" y1="3" x2="21" y2="21" stroke="#E3644B" stroke-width="2.6" />
        </svg>
      </button>

      <button
        type="button"
        class="toy-icon-btn hud-circle-btn"
        :aria-label="sfxEnabled ? 'Silenciar efectos de sonido' : 'Activar efectos de sonido'"
        :title="sfxEnabled ? 'Sonidos activados' : 'Sonidos desactivados'"
        :class="{ 'is-muted': !sfxEnabled }"
        @click="toggleSfx"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          <line v-if="!sfxEnabled" x1="3" y1="3" x2="21" y2="21" stroke="#E3644B" stroke-width="2.6" />
        </svg>
      </button>

      <button
        type="button"
        class="hud-pill album-pill"
        @click="handleOpenAlbum"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
        <span class="album-text">{{ progress.earnedBadges.length }}/5</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.floating-hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.55rem;
  width: 100%;
}

.hud-left,
.hud-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hud-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background-color: rgba(255, 244, 222, 0.95);
  border: 2px solid #DFC9A4;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--ink-primary);
  box-shadow: 0 4px 0 #D6BC91, 0 6px 14px rgba(27, 21, 44, 0.16);
}

.right-pill {
  background-color: #E86A92;
  border-color: #B9436A;
  color: #FFFFFF;
  box-shadow: 0 4px 0 #B9436A, 0 6px 14px rgba(27, 21, 44, 0.18);
  font-size: 0.86rem;
}

.star-pill {
  background-color: #FFF4D4;
  border-color: #E5B963;
  color: #4D3806;
  font-variant-numeric: tabular-nums;
}

.act-dots-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background-color: rgba(255, 244, 222, 0.95);
  border: 2px solid #DFC9A4;
  box-shadow: 0 4px 0 #D6BC91;
}

.act-seg {
  width: 24px;
  height: 12px;
  border-radius: 999px;
  background-color: #E5D7BC;
  transition: background-color 220ms ease, transform 200ms var(--ease-spring);
}

.act-seg.is-active {
  background-color: var(--theme-accent);
  transform: scaleY(1.15);
}

.act-seg.is-done {
  background-color: #58B968;
}

.hud-circle-btn,
.map-home-btn {
  width: 44px;
  height: 44px;
}

.hud-circle-btn.is-muted {
  opacity: 0.7;
}

.album-pill {
  transition: transform 130ms var(--ease-out);
}

.album-pill:active {
  transform: translateY(3px);
}

@media (max-width: 900px) {
  .right-pill {
    display: none;
  }
}

@media (max-width: 600px) {
  .chapter-pill {
    display: none;
  }
}
</style>
