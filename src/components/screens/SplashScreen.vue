<script setup lang="ts">
import { useGameProgress } from '@/composables/useGameProgress'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import { assetUrl } from '@/utils/assets'

const emit = defineEmits<{
  startNew: []
  continueMap: []
}>()

const { progress, toggleDemoMode } = useGameProgress()
const { unlockAudio, playPageTurn, playTap } = useSoundEffects()
const { speak } = useVoiceNarrator()

function handleStart(): void {
  unlockAudio()
  playPageTurn()
  if (progress.hasSeenIntro) {
    speak('¡Qué alegría verte de nuevo! Elige un capítulo en el mapa.')
    emit('continueMap')
  } else {
    speak('¡Bienvenido a Sol y Luna, el reloj de papel!')
    emit('startNew')
  }
}

function handleIntroFromSplash(): void {
  unlockAudio()
  playTap()
  emit('startNew')
}

function handleToggleDemo(): void {
  unlockAudio()
  playTap()
  toggleDemoMode()
}
</script>

<template>
  <main class="storybook-viewport">
    <div class="storybook-stage splash-stage">
      <!-- Full-bleed sunlit diorama panorama -->
      <img
        :src="assetUrl('/art/bg-level1-sunrise.png')"
        alt=""
        class="stage-panorama"
      />
      <div class="splash-scrim" aria-hidden="true" />
      <div class="paper-grain-overlay" aria-hidden="true" />

      <!-- Drifting cut-paper clouds & twinkling stars -->
      <svg class="sky-cloud cloud-a" viewBox="0 0 180 90" aria-hidden="true">
        <path
          d="M25 72 H152 C164 72 172 62 172 51 C172 41 164 33 154 32 C149 16 135 6 118 6 C105 6 93 13 87 23 C81 19 74 17 66 17 C49 17 36 30 35 47 C22 48 12 56 12 63 C12 68 18 72 25 72 Z"
          fill="#FFFDF7"
          opacity="0.88"
        />
      </svg>
      <svg class="sky-cloud cloud-b" viewBox="0 0 180 90" aria-hidden="true">
        <path
          d="M25 72 H152 C164 72 172 62 172 51 C172 41 164 33 154 32 C149 16 135 6 118 6 C105 6 93 13 87 23 C81 19 74 17 66 17 C49 17 36 30 35 47 C22 48 12 56 12 63 C12 68 18 72 25 72 Z"
          fill="#FFFDF7"
          opacity="0.84"
        />
      </svg>

      <!-- Top bar with Teacher Demo toggle -->
      <div class="splash-top-bar">
        <span class="age-pill">Cuento interactivo · 5 a 7 años</span>

        <button
          type="button"
          class="demo-gear-btn"
          :class="{ 'is-active': progress.demoMode }"
          :title="progress.demoMode ? 'Modo Docente activado (todos abiertos)' : 'Opciones para docentes'"
          @click="handleToggleDemo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>{{ progress.demoMode ? 'Docente: Todo libre' : 'Modo Docente' }}</span>
        </button>
      </div>

      <!-- Center Living Storybook Title & Cast -->
      <div class="splash-center anim-pop-in">
        <div class="title-block">
          <h1 class="story-stroked-title title-top">Sol y Luna</h1>
          <p class="story-stroked-title title-main">El Reloj de Papel</p>
        </div>

        <div class="cast-showcase">
          <div class="emblem-medallion anim-float">
            <img
              :src="assetUrl('/art/logo-sol-y-luna.png')"
              alt="Emblema de Sol y Luna abrazando el reloj de papel"
              class="emblem-img"
              width="210"
              height="210"
            />
          </div>

          <div class="bombo-medallion">
            <img
              :src="assetUrl('/art/bombo-happy.png')"
              alt="Bombo el guardián saludando"
              class="bombo-cover-img"
              width="190"
              height="190"
            />
          </div>
        </div>

        <p class="cover-tagline">
          Una aventura mágica sobre tu derecho a jugar con libertad y descansar en paz
        </p>
      </div>

      <!-- Bottom Hero CTA -->
      <div class="splash-bottom">
        <button type="button" class="paper-btn paper-btn-green hero-play-btn" @click="handleStart">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="6 4 20 12 6 20 6 4" />
          </svg>
          <span>{{ progress.hasSeenIntro ? '¡Continuar cuento!' : '¡Abrir el cuento!' }}</span>
        </button>

        <button
          v-if="progress.hasSeenIntro"
          type="button"
          class="paper-btn paper-btn-secondary replay-intro-btn"
          @click="handleIntroFromSplash"
        >
          Ver historia desde el inicio
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.splash-stage {
  justify-content: space-between;
  padding: 1.25rem 1.6rem 1.85rem;
  background-color: #FFF4DE;
}

.stage-panorama {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.splash-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(35, 28, 53, 0.16) 0%,
    rgba(255, 244, 222, 0.08) 45%,
    rgba(35, 28, 53, 0.22) 100%
  );
  z-index: 1;
}

.sky-cloud {
  position: absolute;
  width: clamp(110px, 14vw, 180px);
  z-index: 2;
  pointer-events: none;
}

.cloud-a {
  top: 14%;
  left: 6%;
  animation: cloudDrift 9s ease-in-out infinite;
}

.cloud-b {
  top: 20%;
  right: 7%;
  animation: cloudDrift 11s ease-in-out infinite reverse;
}

.splash-top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.age-pill {
  padding: 0.38rem 0.95rem;
  border-radius: 999px;
  background-color: rgba(255, 244, 222, 0.94);
  border: 2px solid #DFC9A4;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--ink-primary);
  box-shadow: var(--shadow-paper-sm);
}

.demo-gear-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  padding: 0.4rem 0.95rem;
  border-radius: 999px;
  background-color: rgba(255, 244, 222, 0.95);
  border: 2px solid #DFC9A4;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--ink-primary);
  box-shadow: 0 4px 0 #D6BC91, 0 6px 14px rgba(34, 25, 48, 0.16);
  transition: transform 130ms var(--ease-out), background-color 140ms ease;
}

.demo-gear-btn.is-active {
  background-color: #DFF6F8;
  border-color: #2493A2;
  color: #124F57;
  box-shadow: 0 4px 0 #82C2CC;
}

.splash-center {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.05rem;
  margin: auto 0;
}

.title-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.title-top {
  font-size: clamp(1.55rem, 3vw, 2.25rem);
  color: #FFFDF7;
}

.title-main {
  font-size: clamp(2.35rem, 5.4vw, 3.8rem);
  color: #FFE082;
}

.cast-showcase {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.4rem;
}

.emblem-medallion,
.bombo-medallion {
  padding: 0.55rem;
  border-radius: 999px;
  background-color: #FFFDF7;
  border: 4px solid #E5C997;
  box-shadow: var(--shadow-paper-md);
}

.emblem-img {
  width: clamp(148px, 21vw, 205px);
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  object-fit: cover;
}

.bombo-cover-img {
  width: clamp(134px, 19vw, 186px);
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  object-fit: contain;
}

.cover-tagline {
  padding: 0.55rem 1.35rem;
  border-radius: 999px;
  background-color: rgba(255, 244, 222, 0.95);
  border: 2px solid #DFC9A4;
  font-weight: 800;
  font-size: clamp(0.95rem, 1.6vw, 1.1rem);
  color: var(--ink-primary);
  box-shadow: var(--shadow-paper-sm);
  max-width: 58ch;
}

.splash-bottom {
  position: relative;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
}

.hero-play-btn {
  min-height: 62px;
  padding: 0.95rem 2.3rem;
  font-size: 1.35rem;
}

.replay-intro-btn {
  min-height: 52px;
}

@media (max-width: 680px) {
  .splash-stage {
    padding: 0.9rem 0.95rem 1.25rem;
  }

  .cast-showcase {
    gap: 0.75rem;
  }

  .emblem-img {
    width: 126px;
  }

  .bombo-cover-img {
    width: 114px;
  }

  .cover-tagline {
    border-radius: 20px;
    padding: 0.55rem 0.95rem;
  }
}
</style>
