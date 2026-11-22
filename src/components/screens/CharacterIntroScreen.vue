<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { STICKER_OPTIONS } from '@/data/levels'
import type { BomboMood, StickerId } from '@/types/game'
import { useGameProgress } from '@/composables/useGameProgress'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import StickerGlyph from '@/components/common/StickerGlyph.vue'
import { assetUrl } from '@/utils/assets'

const emit = defineEmits<{
  finishIntro: []
  backSplash: []
}>()

const { progress, setPlayerProfile } = useGameProgress()
const { playTap, playSuccess, playPageTurn } = useSoundEffects()
const { speak } = useVoiceNarrator()

const playerName = shallowRef(progress.playerName)
const selectedSticker = shallowRef<StickerId>(progress.playerSticker)
const bomboMood = shallowRef<BomboMood>('happy')

const STORY_TEXT =
  '¡Hola! Soy Bombo, el guardián de Sol y Luna. El gran reloj de papel perdió su ritmo entre el juego y el descanso. ¿Me ayudas a repararlo juntos en cinco capítulos?'

onMounted(() => {
  speak(STORY_TEXT)
})

function tickleBombo(): void {
  playSuccess()
  bomboMood.value = 'celebrate'
  speak('¡Jijiji! ¡Qué alegría jugar contigo! Escribe tu nombre si quieres y empecemos.')
  window.setTimeout(() => {
    bomboMood.value = 'happy'
  }, 1400)
}

function chooseSticker(id: StickerId): void {
  playTap()
  selectedSticker.value = id
}

function handleBegin(): void {
  playPageTurn()
  setPlayerProfile(playerName.value, selectedSticker.value)
  emit('finishIntro')
}
</script>

<template>
  <main class="intro-screen paper-grain-bg">
    <div class="intro-card paper-panel anim-pop-in">
      <div class="intro-visual">
        <button
          type="button"
          class="bombo-portrait-btn"
          aria-label="Saludar a Bombo"
          @click="tickleBombo"
        >
          <img
            :src="assetUrl(`/art/bombo-${bomboMood}.png`)"
            alt="Bombo el perezoso luciérnaga con su bufanda de retazos"
            class="bombo-hero-img"
            width="240"
            height="240"
          />
          <span class="tap-hint">¡Tócame para saludar!</span>
        </button>
      </div>

      <div class="intro-content">
        <h1 class="intro-title">¡Conoce a Bombo!</h1>
        <p class="intro-story">{{ STORY_TEXT }}</p>

        <button
          type="button"
          class="listen-pill"
          @click="speak(STORY_TEXT)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          </svg>
          <span>Escuchar historia de nuevo</span>
        </button>

        <div class="profile-form">
          <label class="field-label" for="player-name-input">
            ¿Cómo te llamas? (opcional)
          </label>
          <input
            id="player-name-input"
            v-model="playerName"
            type="text"
            maxlength="20"
            placeholder="Tu nombre aquí..."
            class="name-input"
          />

          <p class="field-label">Elige tu sello de aventurero:</p>
          <div class="sticker-row">
            <button
              v-for="item in STICKER_OPTIONS"
              :key="item.id"
              type="button"
              class="sticker-choice"
              :class="{ 'is-selected': selectedSticker === item.id }"
              :aria-pressed="selectedSticker === item.id"
              @click="chooseSticker(item.id)"
            >
              <StickerGlyph :id="item.id" :size="40" />
              <span>{{ item.label }}</span>
            </button>
          </div>
        </div>

        <div class="intro-actions">
          <button type="button" class="paper-btn paper-btn-primary" @click="handleBegin">
            ¡Vamos al mapa!
          </button>
          <button type="button" class="paper-btn paper-btn-secondary" @click="emit('backSplash')">
            Portada
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.intro-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1.25rem;
}

.intro-card {
  width: 100%;
  max-width: 880px;
  padding: 2rem;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
  align-items: center;
  background-color: #FFFDF7;
}

.intro-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bombo-portrait-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem;
  border-radius: 30px;
  background-color: #FFFDF7;
  border: 3px solid var(--paper-border);
  box-shadow: var(--shadow-paper-md);
  transition: transform 180ms var(--ease-spring);
}

.bombo-portrait-btn:active {
  transform: scale(0.96);
}

@media (hover: hover) and (pointer: fine) {
  .bombo-portrait-btn:hover {
    transform: translateY(-3px) rotate(-1deg);
  }
}

.bombo-hero-img {
  width: 210px;
  height: 210px;
  object-fit: contain;
  border-radius: 20px;
}

.tap-hint {
  padding: 0.28rem 0.85rem;
  border-radius: 999px;
  background-color: #FFF0CF;
  border: 1.5px solid #E4CFA5;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--ink-primary);
}

.intro-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.95rem;
}

.intro-title {
  font-size: clamp(1.8rem, 3.2vw, 2.4rem);
}

.intro-story {
  font-size: 1.08rem;
  font-weight: 700;
  color: var(--ink-secondary);
  line-height: 1.48;
}

.listen-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background-color: #DFF6F8;
  border: 2px solid #8CCCD4;
  font-family: var(--font-display);
  font-weight: 600;
  color: #14535C;
}

.profile-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem 1.15rem;
  border-radius: 22px;
  background-color: var(--paper-cream-tint);
  border: 2px solid var(--paper-border);
}

.field-label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.98rem;
  color: var(--ink-primary);
}

.name-input {
  width: 100%;
  min-height: 48px;
  padding: 0.55rem 0.95rem;
  border-radius: 14px;
  border: 2px solid #D4C3A3;
  background-color: #FFFDF7;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.sticker-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.55rem;
}

.sticker-choice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.4rem;
  min-height: 82px;
  border-radius: 16px;
  background-color: #FFFDF7;
  border: 2px solid var(--paper-border);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-secondary);
  transition: transform 140ms var(--ease-out), border-color 140ms ease, background-color 140ms ease;
}

.sticker-choice.is-selected {
  border-color: #E58717;
  background-color: #FFF2D8;
  color: var(--ink-primary);
  box-shadow: var(--shadow-paper-sm);
  transform: translateY(-2px);
}

.intro-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 0.25rem;
}

@media (max-width: 760px) {
  .intro-card {
    grid-template-columns: 1fr;
    padding: 1.4rem;
    gap: 1.3rem;
  }

  .sticker-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
