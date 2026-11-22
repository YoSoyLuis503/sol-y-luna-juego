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
  <main class="splash-screen paper-grain-bg">
    <!-- Decorative cut-paper clouds in sky corners -->
    <svg class="cloud cloud-left" viewBox="0 0 180 90" aria-hidden="true">
      <path
        d="M25 72 H152 C164 72 172 62 172 51 C172 41 164 33 154 32 C149 16 135 6 118 6 C105 6 93 13 87 23 C81 19 74 17 66 17 C49 17 36 30 35 47 C22 48 12 56 12 63 C12 68 18 72 25 72 Z"
        fill="#FFFDF7"
        stroke="#E4D6BE"
        stroke-width="3"
      />
    </svg>
    <svg class="cloud cloud-right" viewBox="0 0 180 90" aria-hidden="true">
      <path
        d="M25 72 H152 C164 72 172 62 172 51 C172 41 164 33 154 32 C149 16 135 6 118 6 C105 6 93 13 87 23 C81 19 74 17 66 17 C49 17 36 30 35 47 C22 48 12 56 12 63 C12 68 18 72 25 72 Z"
        fill="#FFFDF7"
        stroke="#E4D6BE"
        stroke-width="3"
      />
    </svg>

    <div class="cover-card paper-panel anim-pop-in">
      <div class="emblem-frame anim-float">
        <img
          :src="assetUrl('/art/logo-sol-y-luna.png')"
          alt="Emblema ilustrado de Sol y Luna abrazando un reloj de papel"
          class="cover-logo"
          width="280"
          height="280"
        />
      </div>

      <div class="cover-copy">
        <h1 class="cover-title">Sol y Luna: El Reloj de Papel</h1>
        <p class="cover-subtitle">
          Una aventura interactiva para descubrir tu derecho a jugar con libertad y descansar tranquilo
        </p>

        <div class="cover-cta-group">
          <button type="button" class="paper-btn paper-btn-primary hero-cta" @click="handleStart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
            <span>{{ progress.hasSeenIntro ? 'Continuar aventura' : '¡Abrir el cuento!' }}</span>
          </button>

          <button
            v-if="progress.hasSeenIntro"
            type="button"
            class="paper-btn paper-btn-secondary"
            @click="handleIntroFromSplash"
          >
            Ver historia de Bombo
          </button>
        </div>

        <p class="age-note">Pensado para niñas y niños de 5 a 7 años · Con narración en voz alta</p>
      </div>
    </div>

    <div class="splash-footer">
      <button
        type="button"
        class="demo-pill"
        :class="{ 'is-active': progress.demoMode }"
        @click="handleToggleDemo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
        <span>Modo Docente (Demo): {{ progress.demoMode ? 'Todos desbloqueados' : 'Progresivo' }}</span>
      </button>
    </div>
  </main>
</template>

<style scoped>
.splash-screen {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem 3.5rem;
  overflow: hidden;
}

.cloud {
  position: absolute;
  width: clamp(120px, 16vw, 200px);
  opacity: 0.9;
  pointer-events: none;
}

.cloud-left {
  top: 6%;
  left: 4%;
  animation: gentleFloat 6s ease-in-out infinite;
}

.cloud-right {
  top: 12%;
  right: 5%;
  animation: gentleFloat 7.2s ease-in-out infinite reverse;
}

.cover-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 820px;
  padding: 2.2rem 2.4rem;
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  align-items: center;
  gap: 2.1rem;
  background: linear-gradient(155deg, #FFFDF7 0%, #FDF4E1 100%);
}

.emblem-frame {
  padding: 0.65rem;
  border-radius: 30px;
  background-color: #FBF6EA;
  border: 3px solid #E4CFA5;
  box-shadow: var(--shadow-paper-md);
}

.cover-logo {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 22px;
  object-fit: cover;
}

.cover-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.cover-title {
  font-size: clamp(2rem, 4.2vw, 2.95rem);
  color: var(--ink-primary);
}

.cover-subtitle {
  font-size: clamp(1.06rem, 1.8vw, 1.22rem);
  font-weight: 700;
  color: var(--ink-secondary);
  line-height: 1.45;
  max-width: 44ch;
}

.cover-cta-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 0.35rem;
}

.hero-cta {
  min-height: 60px;
  padding: 0.9rem 1.85rem;
  font-size: 1.24rem;
  background-color: #E58717;
  box-shadow:
    inset 0 -4px 0 #B56406,
    0 10px 22px rgba(181, 100, 6, 0.28);
}

.age-note {
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--ink-muted);
}

.splash-footer {
  position: relative;
  z-index: 2;
  margin-top: 1.35rem;
}

.demo-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 42px;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  background-color: rgba(255, 253, 247, 0.9);
  border: 2px solid var(--paper-border);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--ink-secondary);
  transition: background-color 150ms ease, border-color 150ms ease;
}

.demo-pill.is-active {
  background-color: #DFF6F8;
  border-color: #2493A2;
  color: #14535C;
}

@media (max-width: 720px) {
  .splash-screen {
    padding: 1rem 1rem 1.5rem;
    justify-content: flex-start;
  }

  .cover-card {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 1.25rem 1.15rem;
    gap: 1rem;
    margin-top: auto;
  }

  .emblem-frame {
    width: 100%;
    max-width: 178px;
    aspect-ratio: 1 / 1;
    margin: 0 auto;
    padding: 0.45rem;
  }

  .cover-title {
    font-size: 1.75rem;
  }

  .cover-subtitle {
    font-size: 0.98rem;
  }

  .cover-copy {
    align-items: center;
    gap: 0.7rem;
  }

  .cover-cta-group {
    justify-content: center;
    width: 100%;
  }

  .hero-cta {
    min-height: 52px;
    font-size: 1.12rem;
  }

  .splash-footer {
    margin-top: 0.85rem;
    margin-bottom: auto;
  }
}
</style>
