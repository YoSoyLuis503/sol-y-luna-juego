<script setup lang="ts">
import { LEVELS } from '@/data/levels'
import { useGameProgress } from '@/composables/useGameProgress'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import { useSoundEffects } from '@/composables/useSoundEffects'
import BadgeIcon from '@/components/common/BadgeIcon.vue'
import StickerGlyph from '@/components/common/StickerGlyph.vue'

const emit = defineEmits<{
  close: []
}>()

const { progress, displayName, totalStars, resetProgress } = useGameProgress()
const { speak } = useVoiceNarrator()
const { playTap, playStar } = useSoundEffects()

function handleClose(): void {
  playTap()
  emit('close')
}

function handleReset(): void {
  playTap()
  resetProgress()
}

function listenTakeaway(badgeName: string, text: string): void {
  playStar()
  speak(`Insignia ${badgeName}. ${text}`)
}
</script>

<template>
  <div class="album-backdrop" role="dialog" aria-modal="true" aria-labelledby="album-heading">
    <div class="album-panel paper-panel anim-pop-in">
      <div class="album-header">
        <div class="player-summary">
          <StickerGlyph :id="progress.playerSticker" :size="44" />
          <div>
            <h2 id="album-heading" class="album-title">Álbum de {{ displayName }}</h2>
            <p class="album-subtitle">
              {{ progress.earnedBadges.length }} de 5 insignias · {{ totalStars }} de 15 estrellas
            </p>
          </div>
        </div>

        <div class="header-actions">
          <button type="button" class="reset-link-btn" @click="handleReset">
            Reiniciar progreso
          </button>
          <button type="button" class="paper-btn paper-btn-secondary close-btn" @click="handleClose">
            Cerrar
          </button>
        </div>
      </div>

      <div class="badges-grid">
        <div
          v-for="lvl in LEVELS"
          :key="lvl.id"
          class="album-slot"
          :class="{ 'is-earned': progress.earnedBadges.includes(lvl.id) || progress.demoMode }"
        >
          <BadgeIcon
            :level-id="lvl.id"
            :earned="progress.earnedBadges.includes(lvl.id) || progress.demoMode"
            :size="74"
          />
          <div class="slot-info">
            <h3 class="slot-title">{{ lvl.badgeName }}</h3>
            <p class="slot-chapter">{{ lvl.chapterLabel }}: {{ lvl.title }}</p>
            <p
              v-if="progress.earnedBadges.includes(lvl.id) || progress.demoMode"
              class="slot-takeaway"
            >
              {{ lvl.completionTakeaway }}
            </p>
            <p v-else class="slot-locked-msg">
              Completa este capítulo para coleccionar su insignia.
            </p>
          </div>
          <button
            v-if="progress.earnedBadges.includes(lvl.id) || progress.demoMode"
            type="button"
            class="hear-badge-btn"
            :aria-label="`Escuchar mensaje de ${lvl.badgeName}`"
            @click="listenTakeaway(lvl.badgeName, lvl.completionTakeaway)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            </svg>
            <span>Oír</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.album-backdrop {
  position: fixed;
  inset: 0;
  z-index: 85;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(31, 25, 42, 0.58);
  backdrop-filter: blur(4px);
}

.album-panel {
  width: 100%;
  max-width: 780px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.album-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.player-summary {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.album-title {
  font-size: 1.55rem;
}

.album-subtitle {
  font-weight: 700;
  color: var(--ink-secondary);
}

.close-btn {
  min-height: 46px;
  padding: 0.55rem 1.2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.reset-link-btn {
  min-height: 44px;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--ink-secondary);
  border: 1.5px solid var(--paper-border);
  background-color: var(--paper-cream-tint);
}

.badges-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.album-slot {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.05rem;
  border-radius: 22px;
  background-color: var(--paper-cream-tint);
  border: 2px solid var(--paper-border);
}

.album-slot.is-earned {
  background-color: #FFFDF7;
  box-shadow: var(--shadow-paper-sm);
}

.slot-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.slot-title {
  font-size: 1.15rem;
}

.slot-chapter {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--theme-accent-deep);
}

.slot-takeaway {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink-primary);
}

.slot-locked-msg {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink-muted);
}

.hear-badge-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background-color: var(--theme-accent-soft);
  border: 2px solid var(--theme-border);
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--ink-primary);
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .album-slot {
    flex-wrap: wrap;
  }
}
</style>
