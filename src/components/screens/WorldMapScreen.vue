<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { LEVELS } from '@/data/levels'
import type { LevelId } from '@/types/game'
import { useGameProgress } from '@/composables/useGameProgress'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import TopHud from '@/components/common/TopHud.vue'
import BomboGuide from '@/components/common/BomboGuide.vue'
import BadgeIcon from '@/components/common/BadgeIcon.vue'

const emit = defineEmits<{
  selectLevel: [id: LevelId]
  openAlbum: []
  openFinale: []
  goSplash: []
}>()

const { progress, displayName, completedCount, isLevelUnlocked, toggleDemoMode } =
  useGameProgress()
const { playTap, playGentleHint, playPageTurn } = useSoundEffects()
const { speak } = useVoiceNarrator()

const mapGuidance = computed(() => {
  if (completedCount.value >= 5) {
    return `¡Felicidades, ${displayName.value}! Reparaste los 5 capítulos del reloj de papel. Puedes volver a jugar cualquiera o ver tu Gran Celebración.`
  }
  const nextId = Math.min(5, completedCount.value + 1) as LevelId
  return `¡Hola, ${displayName.value}! Toca el Capítulo ${nextId} para continuar nuestra aventura sobre el derecho a jugar y descansar.`
})

const mapSpeechText = computed(() => {
  if (completedCount.value >= 5) {
    return '¡Felicidades! Reparaste los 5 capítulos del reloj de papel. Puedes volver a jugar cualquiera o ver tu Gran Celebración.'
  }
  const nextId = Math.min(5, completedCount.value + 1) as LevelId
  return `¡Hola! Toca el Capítulo ${nextId} para continuar nuestra aventura sobre el derecho a jugar y descansar.`
})

onMounted(() => {
  speak(mapSpeechText.value)
})

function handleSelect(id: LevelId): void {
  if (!isLevelUnlocked(id)) {
    playGentleHint()
    speak(`Primero completa el Capítulo ${id - 1} para abrir este camino, o activa el Modo Docente si estás presentando.`)
    return
  }
  playPageTurn()
  emit('selectLevel', id)
}

function handleDemoToggle(): void {
  playTap()
  toggleDemoMode()
}
</script>

<template>
  <main class="map-screen">
    <div class="map-shell">
      <TopHud
        :show-back-to-map="false"
        @open-album="emit('openAlbum')"
      />

      <div class="map-top-row">
        <BomboGuide mood="happy" :message="mapGuidance" :speech-text="mapSpeechText" :compact="true" />
      </div>

      <section class="chapters-board paper-panel" aria-label="Mapa de los cinco capítulos">
        <div class="board-header">
          <div>
            <h1 class="board-title">El Camino del Sol a la Luna</h1>
            <p class="board-sub">Cada capítulo explora una forma de vivir el derecho a jugar y descansar</p>
          </div>

          <div class="board-controls">
            <button
              type="button"
              class="demo-chip"
              :class="{ 'is-on': progress.demoMode }"
              @click="handleDemoToggle"
            >
              {{ progress.demoMode ? 'Demo Docente: ON' : 'Demo Docente: OFF' }}
            </button>
            <button
              type="button"
              class="paper-btn paper-btn-secondary home-btn"
              @click="emit('goSplash')"
            >
              Portada
            </button>
          </div>
        </div>

        <div class="chapters-path">
          <button
            v-for="lvl in LEVELS"
            :key="lvl.id"
            type="button"
            class="chapter-card"
            :class="{
              'is-unlocked': isLevelUnlocked(lvl.id),
              'is-locked': !isLevelUnlocked(lvl.id),
              'is-completed': progress.earnedBadges.includes(lvl.id),
            }"
            @click="handleSelect(lvl.id)"
          >
            <div class="thumb-wrap">
              <img
                :src="lvl.backgroundArt"
                :alt="`Escenario de ${lvl.title}`"
                class="thumb-img"
                width="320"
                height="180"
              />
              <span class="chapter-badge-num">{{ lvl.chapterLabel }}</span>

              <div v-if="!isLevelUnlocked(lvl.id)" class="lock-overlay" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>

            <div class="chapter-body">
              <div class="chapter-headline">
                <h2 class="chapter-title">{{ lvl.title }}</h2>
                <BadgeIcon
                  :level-id="lvl.id"
                  :earned="progress.earnedBadges.includes(lvl.id)"
                  :size="42"
                />
              </div>

              <p class="chapter-facet">{{ lvl.facetTitle }}</p>

              <div class="chapter-footer">
                <div class="mini-stars" :aria-label="`${progress.levelStars[lvl.id]} de 3 estrellas`">
                  <svg
                    v-for="s in 3"
                    :key="s"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    :fill="s <= progress.levelStars[lvl.id] ? '#F5B82E' : '#EAE2D2'"
                    :stroke="s <= progress.levelStars[lvl.id] ? '#C97A0C' : '#C8BCA4'"
                    stroke-width="1.8"
                    aria-hidden="true"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>

                <span class="play-pill">
                  {{
                    !isLevelUnlocked(lvl.id)
                      ? 'Bloqueado'
                      : progress.earnedBadges.includes(lvl.id)
                        ? 'Rejugar'
                        : '¡Jugar!'
                  }}
                </span>
              </div>
            </div>
          </button>
        </div>

        <div v-if="completedCount >= 5 || progress.demoMode" class="finale-banner">
          <div>
            <h2 class="finale-banner-title">Ceremonia de Sol y Luna</h2>
            <p class="finale-banner-sub">
              Abre el diploma ilustrado y celebra el derecho a jugar y descansar
            </p>
          </div>
          <button
            type="button"
            class="paper-btn paper-btn-teal"
            @click="emit('openFinale')"
          >
            Ver Gran Celebración
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.map-screen {
  min-height: 100vh;
  padding: 1rem 1.15rem 2rem;
  background: linear-gradient(
    180deg,
    #FFF3D8 0%,
    #ECF7F8 36%,
    #FBF2E6 68%,
    #E7E4F8 100%
  );
}

.map-shell {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

.chapters-board {
  padding: 1.45rem 1.55rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background-color: rgba(255, 253, 247, 0.96);
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.85rem;
}

.board-title {
  font-size: clamp(1.5rem, 2.8vw, 2rem);
}

.board-sub {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink-secondary);
}

.board-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.demo-chip {
  min-height: 44px;
  padding: 0.4rem 0.95rem;
  border-radius: 999px;
  background-color: var(--paper-cream-tint);
  border: 2px solid var(--paper-border);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--ink-secondary);
}

.demo-chip.is-on {
  background-color: #DFF6F8;
  border-color: #2493A2;
  color: #14535C;
}

.home-btn {
  min-height: 44px;
  padding: 0.45rem 1.05rem;
  font-size: 0.95rem;
}

.chapters-path {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 1rem;
}

.chapter-card {
  display: flex;
  flex-direction: column;
  text-align: left;
  border-radius: 24px;
  overflow: hidden;
  background-color: #FFFDF7;
  border: 2.5px solid var(--paper-border);
  box-shadow: var(--shadow-paper-sm);
  transition: transform 180ms var(--ease-out), box-shadow 180ms var(--ease-out), border-color 180ms ease;
}

.chapter-card.is-unlocked:active {
  transform: scale(0.985);
}

@media (hover: hover) and (pointer: fine) {
  .chapter-card.is-unlocked:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-paper-md);
    border-color: #E58717;
  }
}

.chapter-card.is-locked {
  opacity: 0.74;
  background-color: #F4EFE3;
}

.thumb-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: #EFE4CE;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chapter-card.is-locked .thumb-img {
  filter: grayscale(0.55) brightness(0.86);
}

.chapter-badge-num {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background-color: rgba(255, 253, 247, 0.95);
  border: 2px solid var(--paper-border);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--ink-primary);
}

.lock-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(43, 36, 51, 0.34);
  color: #FFFFFF;
}

.chapter-body {
  flex: 1;
  padding: 0.95rem 1.05rem 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.chapter-headline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.chapter-title {
  font-size: 1.22rem;
}

.chapter-facet {
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--ink-secondary);
  line-height: 1.35;
  flex: 1;
}

.chapter-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.45rem;
  border-top: 1.5px dashed #E4D7BE;
}

.mini-stars {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.play-pill {
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  background-color: #FFF0CF;
  border: 1.5px solid #E5B963;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.88rem;
  color: #6B4204;
}

.chapter-card.is-completed .play-pill {
  background-color: #E2F5E9;
  border-color: #77C596;
  color: #1B5432;
}

.chapter-card.is-locked .play-pill {
  background-color: #E5DEC9;
  border-color: #C9BEA9;
  color: #645B4D;
}

.finale-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.1rem 1.35rem;
  border-radius: 22px;
  background: linear-gradient(120deg, #FFF1D6 0%, #E6E2FA 100%);
  border: 2px solid #D5C8EC;
}

.finale-banner-title {
  font-size: 1.25rem;
}

.finale-banner-sub {
  font-weight: 700;
  color: var(--ink-secondary);
}
</style>
