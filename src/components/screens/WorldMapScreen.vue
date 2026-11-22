<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { LEVELS } from '@/data/levels'
import type { LevelId } from '@/types/game'
import { useGameProgress } from '@/composables/useGameProgress'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import { assetUrl } from '@/utils/assets'
import BomboGuide from '@/components/common/BomboGuide.vue'

const emit = defineEmits<{
  selectLevel: [id: LevelId]
  openAlbum: []
  openFinale: []
  goSplash: []
}>()

const { progress, displayName, totalStars, completedCount, isLevelUnlocked, toggleDemoMode } =
  useGameProgress()
const { playTap, playGentleHint, playPageTurn, sfxEnabled, toggleSfx } = useSoundEffects()
const { speak, voiceEnabled, toggleVoice } = useVoiceNarrator()

const nextPlayableId = computed<LevelId>(() => {
  const firstPending = LEVELS.find((l) => !progress.earnedBadges.includes(l.id))
  return firstPending ? firstPending.id : 5
})

const mapGuidance = computed(() => {
  if (completedCount.value >= 5) {
    return `¡Felicidades, ${displayName.value}! Reparaste los 5 capítulos del reloj de papel. Toca cualquiera o ve tu Gran Celebración.`
  }
  const nextId = Math.min(5, completedCount.value + 1) as LevelId
  return `¡Hola, ${displayName.value}! Toca el Capítulo ${nextId} que brilla para continuar el cuento.`
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

// Desktop scenic positions (S-curve leaving bottom-left clear for Bombo)
const NODE_SLOTS: Record<LevelId, { left: string; top: string }> = {
  1: { left: '16%', top: '26%' },
  2: { left: '50%', top: '21%' },
  3: { left: '83%', top: '27%' },
  4: { left: '72%', top: '62%' },
  5: { left: '42%', top: '60%' },
}
</script>

<template>
  <main class="storybook-viewport">
    <div class="storybook-stage map-stage">
      <!-- Full-bleed Storybook Valley SVG Landscape (Sunrise -> Starry Twilight) -->
      <svg
        class="valley-panorama"
        viewBox="0 0 1200 720"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="skyJourney" x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0%" stop-color="#FFD9A0" />
            <stop offset="45%" stop-color="#89D2EB" />
            <stop offset="78%" stop-color="#5E63B6" />
            <stop offset="100%" stop-color="#2D2B63" />
          </linearGradient>
          <filter id="paperShadow" x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#1E1833" flood-opacity="0.22" />
          </filter>
        </defs>

        <rect width="1200" height="720" fill="url(#skyJourney)" />

        <!-- Morning Sun on left & Crescent Moon + Stars on right -->
        <circle cx="115" cy="115" r="56" fill="#FFD15C" opacity="0.45" />
        <circle cx="115" cy="115" r="38" fill="#F5B82E" />

        <circle cx="1070" cy="115" r="46" fill="#FFFDF7" opacity="0.22" />
        <path
          d="M1076 80 C1055 82 1040 100 1040 120 C1040 142 1058 158 1080 158 C1089 158 1098 155 1105 149 C1089 151 1074 139 1072 122 C1070 105 1080 89 1094 84 C1089 81 1082 80 1076 80 Z"
          fill="#FFFDF7"
        />

        <!-- Stars in right twilight sky -->
        <circle cx="880" cy="88" r="3" fill="#FFFDF7" opacity="0.85" />
        <circle cx="950" cy="138" r="2.5" fill="#FFE082" opacity="0.9" />
        <circle cx="1015" cy="74" r="3.2" fill="#FFFDF7" opacity="0.9" />
        <circle cx="1130" cy="168" r="2.8" fill="#FFE082" opacity="0.8" />
        <circle cx="820" cy="145" r="2.5" fill="#FFFDF7" opacity="0.7" />

        <!-- Soft drifting paper clouds -->
        <path d="M230 132 H345 C356 132 364 123 364 113 C364 103 356 96 346 95 C342 81 329 72 314 72 C302 72 291 78 286 87 C280 83 274 81 267 81 C252 81 240 93 239 108 C227 109 218 117 218 123 C218 128 223 132 230 132 Z" fill="#FFFDF7" opacity="0.82" />
        <path d="M610 112 H715 C725 112 732 104 732 95 C732 86 725 80 716 79 C712 66 700 58 686 58 C675 58 665 64 660 72 C655 68 649 66 643 66 C629 66 618 77 617 90 C606 91 598 98 598 104 C598 108 603 112 610 112 Z" fill="#FFFDF7" opacity="0.72" />

        <!-- Distant lavender/teal hills -->
        <path d="M0 370 Q280 285 600 355 T1200 330 L1200 720 L0 720 Z" fill="#78BA8B" filter="url(#paperShadow)" />
        <!-- Mid meadow -->
        <path d="M0 440 Q340 375 680 435 T1200 410 L1200 720 L0 720 Z" fill="#5CB373" filter="url(#paperShadow)" />
        <!-- Winding gentle river -->
        <path d="M0 535 Q290 485 590 545 T1200 515 L1200 568 Q890 598 590 588 T0 582 Z" fill="#77CDE6" opacity="0.86" />
        <!-- Foreground grass -->
        <path d="M0 570 Q320 535 660 585 T1200 555 L1200 720 L0 720 Z" fill="#4CA463" filter="url(#paperShadow)" />

        <!-- Winding storybook dotted path connecting Chapters 1->2->3->4->5 -->
        <path
          d="M 192 187 Q 400 130 600 151 T 996 194 Q 1080 350 864 446 Q 680 470 504 432"
          fill="none"
          stroke="#FFF4DE"
          stroke-width="11"
          stroke-linecap="round"
          stroke-dasharray="4 22"
          opacity="0.92"
        />
      </svg>

      <div class="paper-grain-overlay" aria-hidden="true" />

      <!-- Floating Minimal Top Bar -->
      <header class="map-top-bar">
        <div class="map-brand">
          <h1 class="story-stroked-title map-title">Sol y Luna</h1>
          <div class="stars-pill" :aria-label="`${totalStars} de 15 estrellas`">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#F5B82E" stroke="#C47608" stroke-width="1.8" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{{ totalStars }} / 15</span>
          </div>
        </div>

        <div class="map-tools">
          <button type="button" class="tool-circle-btn" @click="playTap(); emit('openAlbum')">
            <span class="tool-disc">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </span>
            <span class="tool-label">Álbum</span>
          </button>

          <button
            type="button"
            class="tool-circle-btn"
            :class="{ 'is-off': !voiceEnabled }"
            @click="toggleVoice"
          >
            <span class="tool-disc">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line v-if="!voiceEnabled" x1="3" y1="3" x2="21" y2="21" stroke="#E3644B" stroke-width="2.6" />
              </svg>
            </span>
            <span class="tool-label">Voz</span>
          </button>

          <button
            type="button"
            class="tool-circle-btn"
            :class="{ 'is-off': !sfxEnabled }"
            @click="toggleSfx"
          >
            <span class="tool-disc">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
                <line v-if="!sfxEnabled" x1="3" y1="3" x2="21" y2="21" stroke="#E3644B" stroke-width="2.6" />
              </svg>
            </span>
            <span class="tool-label">Sonido</span>
          </button>

          <button
            type="button"
            class="tool-circle-btn"
            :class="{ 'is-on': progress.demoMode }"
            @click="handleDemoToggle"
          >
            <span class="tool-disc">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
            </span>
            <span class="tool-label">{{ progress.demoMode ? 'Demo ON' : 'Docente' }}</span>
          </button>

          <button type="button" class="tool-circle-btn" @click="playTap(); emit('goSplash')">
            <span class="tool-disc">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span class="tool-label">Portada</span>
          </button>
        </div>
      </header>

      <!-- Winding Valley Medallion Nodes -->
      <section class="valley-nodes" aria-label="Mapa de los cinco capítulos">
        <button
          v-for="lvl in LEVELS"
          :key="lvl.id"
          type="button"
          class="chapter-medallion-btn"
          :class="{
            'is-unlocked': isLevelUnlocked(lvl.id),
            'is-locked': !isLevelUnlocked(lvl.id),
            'is-next': isLevelUnlocked(lvl.id) && lvl.id === nextPlayableId && !progress.earnedBadges.includes(lvl.id),
            'is-done': progress.earnedBadges.includes(lvl.id),
          }"
          :style="{ left: NODE_SLOTS[lvl.id].left, top: NODE_SLOTS[lvl.id].top }"
          @click="handleSelect(lvl.id)"
        >
          <span class="node-num">{{ lvl.id }}</span>

          <div class="medallion-disc">
            <img
              :src="lvl.backgroundArt"
              :alt="lvl.title"
              class="medallion-thumb"
            />
            <div v-if="!isLevelUnlocked(lvl.id)" class="medallion-lock" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          <span class="story-stroked-label medallion-title">{{ lvl.title }}</span>

          <div class="medallion-stars" :aria-label="`${progress.levelStars[lvl.id]} de 3 estrellas`">
            <svg
              v-for="s in 3"
              :key="s"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              :fill="s <= progress.levelStars[lvl.id] ? '#F5B82E' : 'rgba(255, 244, 222, 0.5)'"
              :stroke="s <= progress.levelStars[lvl.id] ? '#B56406' : '#534A5E'"
              stroke-width="1.8"
              aria-hidden="true"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </button>

        <!-- Finale Star Medallion when 5/5 completed or Demo mode -->
        <button
          v-if="completedCount >= 5 || progress.demoMode"
          type="button"
          class="finale-node-btn anim-pop-in"
          @click="playPageTurn(); emit('openFinale')"
        >
          <span class="finale-disc">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#FFE082" stroke="#B56406" stroke-width="1.8" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
          <span class="story-stroked-label medallion-title">Gran Celebración</span>
        </button>
      </section>

      <!-- Bottom-left Bombo Narrator Anchor (clear space on bottom-left!) -->
      <div class="map-bombo-dock">
        <BomboGuide
          mood="happy"
          :message="mapGuidance"
          :speech-text="mapSpeechText"
          :compact="true"
          :docked="true"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.map-stage {
  justify-content: space-between;
  padding: 1rem 1.35rem 1.15rem;
}

.valley-panorama {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.map-top-bar {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.map-brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.map-title {
  font-size: clamp(1.65rem, 3vw, 2.25rem);
}

.stars-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0.35rem 1rem;
  border-radius: 999px;
  background-color: #FFF4DE;
  border: 2.5px solid #DFC9A4;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--ink-primary);
  box-shadow: 0 4px 0 #D6BC91;
}

.map-tools {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.tool-circle-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.tool-disc {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #FFF4DE;
  border: 2.5px solid #DFC9A4;
  color: var(--ink-primary);
  box-shadow: 0 4px 0 #D6BC91, 0 6px 12px rgba(27, 21, 44, 0.18);
  transition: transform 130ms var(--ease-out);
}

.tool-circle-btn:active .tool-disc {
  transform: translateY(3px);
}

.tool-circle-btn.is-on .tool-disc {
  background-color: #DFF6F8;
  border-color: #2493A2;
  color: #124F57;
}

.tool-circle-btn.is-off .tool-disc {
  opacity: 0.72;
}

.tool-label {
  font-family: var(--font-display);
  font-size: 0.76rem;
  font-weight: 700;
  color: #FFFDF7;
  text-shadow:
    -1px -1px 0 #2B2433,
    1px -1px 0 #2B2433,
    -1px 1px 0 #2B2433,
    1px 1px 0 #2B2433;
}

.valley-nodes {
  position: relative;
  z-index: 15;
  flex: 1;
  min-height: 430px;
}

.chapter-medallion-btn {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 158px;
  text-align: center;
  transition: transform 180ms var(--ease-spring);
}

@media (hover: hover) and (pointer: fine) {
  .chapter-medallion-btn.is-unlocked:hover {
    transform: translate(-50%, -54%) scale(1.06);
  }
}

.node-num {
  position: absolute;
  top: -4px;
  left: 24px;
  z-index: 3;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #6A61B8;
  color: #FFFFFF;
  border: 2.5px solid #FFFDF7;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.92rem;
  box-shadow: 0 3px 8px rgba(27, 21, 44, 0.25);
}

.chapter-medallion-btn.is-done .node-num {
  background-color: #38945D;
}

.medallion-disc {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 999px;
  padding: 5px;
  background-color: #FFF4DE;
  border: 4px solid #DFC9A4;
  box-shadow: 0 7px 0 #D0B589, 0 12px 24px rgba(24, 19, 38, 0.26);
  overflow: hidden;
}

.chapter-medallion-btn.is-next .medallion-disc {
  border-color: #F5B82E;
  background-color: #FFFDF7;
  animation: haloPulse 2.2s ease-in-out infinite;
}

.chapter-medallion-btn.is-done .medallion-disc {
  border-color: #58B968;
}

.medallion-thumb {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
}

.chapter-medallion-btn.is-locked .medallion-thumb {
  filter: grayscale(0.75) brightness(0.75);
}

.medallion-lock {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(35, 28, 53, 0.42);
  color: #FFFDF7;
  border-radius: 999px;
}

.medallion-title {
  font-size: 0.98rem;
  line-height: 1.15;
}

.medallion-stars {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.finale-node-btn {
  position: absolute;
  right: 3%;
  bottom: 6%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.finale-disc {
  width: 78px;
  height: 78px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #FFFDF7 0%, #FFE7BA 100%);
  border: 4px solid #F5B82E;
  animation: haloPulse 2.2s ease-in-out infinite;
}

.map-bombo-dock {
  position: relative;
  z-index: 25;
  max-width: 520px;
}

@media (max-width: 760px) {
  .map-stage {
    padding: 0.85rem;
    gap: 0.85rem;
  }

  .valley-nodes {
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem 0.65rem;
    padding: 0.75rem 0;
  }

  .chapter-medallion-btn,
  .finale-node-btn {
    position: relative;
    left: auto !important;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
    width: 100%;
  }

  .node-num {
    left: calc(50% - 50px);
  }

  .map-bombo-dock {
    max-width: 100%;
  }
}
</style>
