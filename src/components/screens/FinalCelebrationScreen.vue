<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { LEVELS } from '@/data/levels'
import { useGameProgress } from '@/composables/useGameProgress'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import BadgeIcon from '@/components/common/BadgeIcon.vue'
import StickerGlyph from '@/components/common/StickerGlyph.vue'
import ConfettiBurst from '@/components/common/ConfettiBurst.vue'
import { assetUrl } from '@/utils/assets'

const emit = defineEmits<{
  goMap: []
  openAlbum: []
  restartGame: []
}>()

const { progress, displayName, totalStars, resetProgress } = useGameProgress()
const { playLevelFanfare, playTap } = useSoundEffects()
const { speak } = useVoiceNarrator()

const showConfetti = shallowRef(true)

onMounted(() => {
  playLevelFanfare()
  speak(
    '¡Bravo! Reparaste el Reloj de Papel de Sol y Luna. Ahora eres Guardián del Derecho a Jugar y Descansar.',
  )
})

function printDiploma(): void {
  playTap()
  window.print()
}

function handleRestart(): void {
  playTap()
  resetProgress()
  emit('restartGame')
}
</script>

<template>
  <main class="storybook-viewport">
    <div class="storybook-stage finale-stage">
      <img
        :src="assetUrl('/art/bg-level5-village.png')"
        alt=""
        class="finale-panorama"
      />
      <div class="finale-scrim" aria-hidden="true" />
      <div class="paper-grain-overlay" aria-hidden="true" />
      <ConfettiBurst :active="showConfetti" />

      <div class="diploma-card paper-panel anim-pop-in">
      <div class="diploma-top">
        <img
          :src="assetUrl('/art/bombo-celebrate.png')"
          alt="Bombo celebrando con estrellas de papel"
          class="finale-bombo"
          width="136"
          height="136"
        />
        <img
          :src="assetUrl('/art/logo-sol-y-luna.png')"
          alt="Reloj de Papel Sol y Luna reparado"
          class="finale-logo"
          width="136"
          height="136"
        />
      </div>

      <h1 class="diploma-title">Diploma de Guardián del Juego y el Descanso</h1>

      <div class="recipient-ribbon">
        <StickerGlyph :id="progress.playerSticker" :size="44" />
        <span class="recipient-name">{{ displayName }}</span>
      </div>

      <p class="diploma-statement">
        Por descubrir junto a Bombo que todas las niñas y los niños tenemos derecho a jugar con libertad,
        sin discriminación, en espacios seguros, escuchando nuestro cuerpo y descansando con alegría cada noche.
      </p>

      <div class="badges-parade">
        <div v-for="lvl in LEVELS" :key="lvl.id" class="parade-item">
          <BadgeIcon :level-id="lvl.id" :earned="true" :size="68" />
          <span class="parade-name">{{ lvl.badgeName }}</span>
        </div>
      </div>

      <p class="score-line">
        Estrellas obtenidas: <strong>{{ totalStars }} / 15</strong>
      </p>

      <div class="finale-actions no-print">
        <button type="button" class="paper-btn paper-btn-primary" @click="printDiploma">
          Imprimir o guardar diploma
        </button>
        <button type="button" class="paper-btn paper-btn-teal" @click="emit('openAlbum')">
          Ver Álbum de Insignias
        </button>
        <button type="button" class="paper-btn paper-btn-secondary" @click="emit('goMap')">
          Volver al mapa
        </button>
        <button type="button" class="paper-btn paper-btn-secondary" @click="handleRestart">
          Reiniciar aventura
        </button>
      </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.finale-stage {
  padding: 1.15rem;
  align-items: center;
  justify-content: center;
}

.finale-panorama {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.finale-scrim {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 244, 222, 0.25) 0%, rgba(27, 21, 44, 0.45) 100%);
  z-index: 1;
}

.diploma-card {
  position: relative;
  z-index: 10;
  margin: auto;
  width: 100%;
  max-width: 820px;
  padding: 1.45rem 1.75rem;
  border: 4px double #D8B87A;
  background-color: #FFFDF7;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.78rem;
}

.diploma-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.finale-bombo,
.finale-logo {
  width: 96px;
  height: 96px;
  border-radius: 22px;
  border: 3px solid var(--paper-border);
  background-color: #FFFDF7;
  object-fit: cover;
  box-shadow: var(--shadow-paper-sm);
}

.diploma-title {
  font-size: clamp(1.55rem, 3.2vw, 2.15rem);
  max-width: 26ch;
}

.recipient-ribbon {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.42rem 1.35rem;
  border-radius: 999px;
  background-color: #FFF1D6;
  border: 2.5px solid #E5B963;
}

.recipient-name {
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.diploma-statement {
  max-width: 60ch;
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--ink-secondary);
  line-height: 1.42;
}

.badges-parade {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  width: 100%;
  border-radius: 22px;
  background-color: var(--paper-cream-tint);
  border: 2px solid var(--paper-border);
}

.parade-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 112px;
}

.parade-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--ink-primary);
}

.score-line {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.finale-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.35rem;
}
</style>
