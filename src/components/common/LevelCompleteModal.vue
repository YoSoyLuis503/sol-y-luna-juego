<script setup lang="ts">
import type { LevelMeta } from '@/types/game'
import BadgeIcon from '@/components/common/BadgeIcon.vue'
import { useSoundEffects } from '@/composables/useSoundEffects'

const {
  levelMeta,
  starsEarned = 3,
} = defineProps<{
  levelMeta: LevelMeta
  starsEarned?: number
}>()

const emit = defineEmits<{
  next: []
  map: []
}>()

const { playTap } = useSoundEffects()

function handleNext(): void {
  playTap()
  emit('next')
}

function handleMap(): void {
  playTap()
  emit('map')
}
</script>

<template>
  <div class="modal-backdrop" role="dialog" aria-modal="true" :aria-labelledby="`win-title-${levelMeta.id}`">
    <div class="win-card paper-panel anim-pop-in">
      <div class="stars-row" aria-label="Tres estrellas ganadas">
        <svg
          v-for="idx in 3"
          :key="idx"
          viewBox="0 0 48 48"
          class="win-star"
          :class="{ 'is-lit': idx <= starsEarned }"
          :style="{ animationDelay: `${idx * 120}ms` }"
          aria-hidden="true"
        >
          <polygon
            points="24 4 29.8 16.2 43.2 18.1 33.4 27.5 35.8 40.9 24 34.4 12.2 40.9 14.6 27.5 4.8 18.1 18.2 16.2"
            :fill="idx <= starsEarned ? '#F5B82E' : '#E5DEC9'"
            :stroke="idx <= starsEarned ? '#C97A0C' : '#CBBFA6'"
            stroke-width="2.5"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <h2 :id="`win-title-${levelMeta.id}`" class="win-title">
        ¡Capítulo {{ levelMeta.id }} completado!
      </h2>

      <div class="badge-showcase">
        <BadgeIcon :level-id="levelMeta.id" :earned="true" :size="92" />
        <div class="badge-details">
          <p class="badge-unlocked-title">Insignia: {{ levelMeta.badgeName }}</p>
          <p class="badge-facet">{{ levelMeta.facetTitle }}</p>
        </div>
      </div>

      <p class="takeaway-box">{{ levelMeta.completionTakeaway }}</p>

      <div class="win-actions">
        <button type="button" class="paper-btn paper-btn-primary" @click="handleNext">
          {{ levelMeta.id === 5 ? 'Ver Gran Celebración' : 'Siguiente capítulo' }}
        </button>
        <button type="button" class="paper-btn paper-btn-secondary" @click="handleMap">
          Volver al mapa
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background-color: rgba(31, 25, 42, 0.56);
  backdrop-filter: blur(4px);
}

.win-card {
  width: 100%;
  max-width: 540px;
  padding: 2rem 1.8rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
}

.stars-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.win-star {
  width: 56px;
  height: 56px;
  animation: starBounce 460ms var(--ease-spring) both;
}

.win-title {
  font-size: clamp(1.6rem, 3vw, 2.05rem);
  color: var(--theme-ink);
}

.badge-showcase {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.9rem 1.1rem;
  border-radius: 22px;
  background-color: var(--theme-surface-alt);
  border: 2px solid var(--theme-border);
  text-align: left;
}

.badge-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.badge-unlocked-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--theme-ink);
}

.badge-facet {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--theme-ink-soft);
}

.takeaway-box {
  padding: 0.9rem 1.1rem;
  border-radius: 18px;
  background-color: var(--theme-accent-soft);
  border: 2px solid var(--theme-border);
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.42;
  color: var(--theme-ink);
}

.win-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.85rem;
  width: 100%;
  margin-top: 0.25rem;
}
</style>
