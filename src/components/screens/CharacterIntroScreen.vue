<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { STICKER_OPTIONS } from '@/data/levels'
import type { BomboMood, StickerId } from '@/types/game'
import { useGameProgress } from '@/composables/useGameProgress'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import { assetUrl } from '@/utils/assets'
import StickerGlyph from '@/components/common/StickerGlyph.vue'

const emit = defineEmits<{
  finishIntro: []
  backSplash: []
}>()

const { progress, setPlayerProfile } = useGameProgress()
const { playTap, playSuccess, playPageTurn } = useSoundEffects()
const { speak, isSpeaking } = useVoiceNarrator()

interface StoryBeat {
  id: number
  title: string
  text: string
  mood: BomboMood
  backdrop: string
  prop: 'clock' | 'play' | 'rest' | 'puzzle' | 'team'
}

const STORY_BEATS: readonly StoryBeat[] = [
  {
    id: 1,
    title: '¡Hola, soy Bombo!',
    text: '¡Hola! Soy Bombo, el guardián de Sol y Luna. Bienvenido a nuestro pueblo de papel, donde cada día guarda dos tesoros mágicos.',
    mood: 'happy',
    backdrop: assetUrl('/art/bg-level1-sunrise.png'),
    prop: 'clock',
  },
  {
    id: 2,
    title: 'Cuando brilla el Sol',
    text: 'Cuando sale el Sol, todos los niños y niñas tienen derecho a jugar con libertad, imaginar, reír e incluir a cada amigo sin dejar a nadie fuera.',
    mood: 'celebrate',
    backdrop: assetUrl('/art/bg-level2-park.png'),
    prop: 'play',
  },
  {
    id: 3,
    title: 'Cuando sale la Luna',
    text: 'Y cuando sale la Luna, llega el derecho a descansar: tomar agua, respirar en calma, apagar pantallas y dormir tranquilo para crecer sanos.',
    mood: 'sleepy',
    backdrop: assetUrl('/art/bg-level5-village.png'),
    prop: 'rest',
  },
  {
    id: 4,
    title: '¡El reloj se enredó!',
    text: 'Pero hoy el gran Reloj de Papel se enredó. Faltan chispas de recreo, juegos seguros y silencio nocturno. ¿Me ayudas a repararlo juntos?',
    mood: 'thinking',
    backdrop: assetUrl('/art/bg-level4-trail.png'),
    prop: 'puzzle',
  },
  {
    id: 5,
    title: '¡Vamos a la aventura!',
    text: '¡Qué alegría tenerte en el equipo! Si quieres escribe tu nombre y elige tu sello, y abramos el mapa de los cinco capítulos.',
    mood: 'celebrate',
    backdrop: assetUrl('/art/bg-level1-sunrise.png'),
    prop: 'team',
  },
]

const beatIndex = shallowRef(0)
const playerName = shallowRef(progress.playerName)
const selectedSticker = shallowRef<StickerId>(progress.playerSticker)
const bomboJumpOverride = shallowRef<BomboMood | null>(null)

const currentBeat = computed(() => STORY_BEATS[beatIndex.value])
const activeMood = computed(() => bomboJumpOverride.value ?? currentBeat.value.mood)

onMounted(() => {
  speak(currentBeat.value.text)
})

function tickleBombo(): void {
  playSuccess()
  bomboJumpOverride.value = 'celebrate'
  speak('¡Jijiji! ¡Qué alegría jugar contigo! Escribe tu nombre si quieres y empecemos.')
  window.setTimeout(() => {
    bomboJumpOverride.value = null
  }, 1400)
}

function chooseSticker(id: StickerId): void {
  playTap()
  selectedSticker.value = id
}

function replayCurrentBeat(): void {
  playTap()
  speak(currentBeat.value.text)
}

function nextBeat(): void {
  if (beatIndex.value < STORY_BEATS.length - 1) {
    playPageTurn()
    beatIndex.value += 1
    bomboJumpOverride.value = null
    speak(currentBeat.value.text)
  } else {
    handleBegin()
  }
}

function prevBeat(): void {
  if (beatIndex.value > 0) {
    playTap()
    beatIndex.value -= 1
    bomboJumpOverride.value = null
    speak(currentBeat.value.text)
  }
}

function handleBegin(): void {
  playPageTurn()
  setPlayerProfile(playerName.value, selectedSticker.value)
  emit('finishIntro')
}
</script>

<template>
  <main class="storybook-viewport">
    <div class="storybook-stage prologue-stage">
      <!-- Shifting full-bleed storybook backdrop -->
      <Transition name="page-turn" mode="out-in">
        <img
          :key="currentBeat.backdrop"
          :src="currentBeat.backdrop"
          alt=""
          class="stage-panorama"
        />
      </Transition>
      <div class="prologue-scrim" aria-hidden="true" />
      <div class="paper-grain-overlay" aria-hidden="true" />

      <!-- Minimal top bar -->
      <div class="prologue-top">
        <button
          type="button"
          class="top-pill-btn"
          @click="beatIndex > 0 ? prevBeat() : emit('backSplash')"
        >
          {{ beatIndex > 0 ? '← Página anterior' : '← Portada' }}
        </button>

        <button
          type="button"
          class="top-pill-btn"
          @click="handleBegin"
        >
          Saltar historia →
        </button>
      </div>

      <!-- Center Spotlighted Character + Story Page Card -->
      <div class="prologue-center">
        <div class="spotlight-col">
          <button
            type="button"
            class="bombo-spotlight-btn"
            aria-label="Saludar a Bombo"
            @click="tickleBombo"
          >
            <img
              :src="assetUrl(`/art/bombo-${activeMood}.png`)"
              alt="Bombo en el cuento"
              class="bombo-spotlight-img"
              width="230"
              height="230"
            />
            <span class="touch-pill">¡Tócame!</span>
          </button>
        </div>

        <Transition name="page-turn" mode="out-in">
          <div :key="currentBeat.id" class="story-dialogue-card">
            <h1 class="beat-title">{{ currentBeat.title }}</h1>
            <p class="beat-text">{{ currentBeat.text }}</p>

            <!-- Beat 5 personalization -->
            <div v-if="currentBeat.id === 5" class="profile-inline">
              <label class="inline-label" for="player-name-input">Tu nombre (opcional):</label>
              <input
                id="player-name-input"
                v-model="playerName"
                type="text"
                maxlength="20"
                placeholder="Escribe tu nombre..."
                class="name-input"
              />
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
                  <StickerGlyph :id="item.id" :size="34" />
                  <span>{{ item.label }}</span>
                </button>
              </div>
            </div>

            <div class="dialogue-footer">
              <div class="beat-dots" :aria-label="`Página ${beatIndex + 1} de ${STORY_BEATS.length}`">
                <span
                  v-for="(beat, idx) in STORY_BEATS"
                  :key="beat.id"
                  class="beat-dot"
                  :class="{ 'is-active': idx === beatIndex, 'is-past': idx < beatIndex }"
                />
              </div>

              <div class="dialogue-controls">
                <button
                  type="button"
                  class="toy-icon-btn speaker-circle"
                  :class="{ 'is-speaking': isSpeaking }"
                  aria-label="Escuchar otra vez"
                  title="Escuchar otra vez"
                  @click="replayCurrentBeat"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" />
                  </svg>
                </button>

                <button
                  type="button"
                  class="paper-btn paper-btn-green advance-btn"
                  @click="nextBeat"
                >
                  <template v-if="beatIndex < STORY_BEATS.length - 1">
                    <span>Siguiente</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </template>
                  <template v-else>
                    <span>¡Sí, vamos al mapa!</span>
                  </template>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </main>
</template>

<style scoped>
.prologue-stage {
  justify-content: space-between;
  padding: 1.25rem 1.75rem 1.85rem;
}

.stage-panorama {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.prologue-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(27, 21, 44, 0.22) 0%,
    rgba(27, 21, 44, 0.14) 55%,
    rgba(27, 21, 44, 0.32) 100%
  );
  z-index: 1;
}

.prologue-top {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.top-pill-btn {
  min-height: 44px;
  padding: 0.45rem 1.05rem;
  border-radius: 999px;
  background-color: rgba(255, 244, 222, 0.95);
  border: 2px solid #DFC9A4;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.94rem;
  color: var(--ink-primary);
  box-shadow: 0 4px 0 #D6BC91;
  transition: transform 130ms var(--ease-out);
}

.top-pill-btn:active {
  transform: translateY(3px);
}

.prologue-center {
  position: relative;
  z-index: 10;
  margin: auto 0;
  display: grid;
  grid-template-columns: minmax(220px, 290px) 1fr;
  align-items: center;
  gap: 2rem;
}

.spotlight-col {
  display: flex;
  justify-content: center;
}

.bombo-spotlight-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-radius: 999px;
  background-color: #FFFDF7;
  border: 5px solid #F2D7A5;
  box-shadow:
    0 0 0 10px rgba(255, 244, 222, 0.34),
    0 16px 34px rgba(24, 19, 38, 0.32);
  animation: gentleFloat 4.2s ease-in-out infinite;
  transition: transform 160ms var(--ease-spring);
}

.bombo-spotlight-btn:active {
  transform: scale(0.95);
}

.bombo-spotlight-img {
  width: clamp(175px, 21vw, 228px);
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  object-fit: contain;
}

.touch-pill {
  position: absolute;
  bottom: -10px;
  padding: 0.25rem 0.95rem;
  border-radius: 999px;
  background-color: #F29F24;
  color: #FFFFFF;
  border: 2.5px solid #FFFDF7;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.88rem;
  box-shadow: 0 3px 8px rgba(34, 25, 48, 0.25);
}

.story-dialogue-card {
  padding: 1.75rem 1.9rem;
  border-radius: 28px;
  background-color: #FFF4DE;
  border: 3px solid #DFC9A4;
  box-shadow:
    0 8px 0 #DFC597,
    0 20px 44px rgba(20, 15, 34, 0.32);
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

.beat-title {
  font-size: clamp(1.45rem, 2.6vw, 2rem);
  color: var(--ink-primary);
}

.beat-text {
  font-size: clamp(1.1rem, 1.8vw, 1.28rem);
  font-weight: 700;
  color: #3B324B;
  line-height: 1.48;
}

.profile-inline {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.85rem 1rem;
  border-radius: 20px;
  background-color: #FFFDF7;
  border: 2px solid #E4CFA5;
}

.inline-label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
}

.name-input {
  width: 100%;
  min-height: 46px;
  padding: 0.45rem 0.9rem;
  border-radius: 14px;
  border: 2px solid #D4C3A3;
  background-color: #FFF4DE;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.sticker-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.45rem;
}

.sticker-choice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.45rem 0.3rem;
  min-height: 68px;
  border-radius: 14px;
  background-color: #FFF4DE;
  border: 2px solid #DFC9A4;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ink-secondary);
}

.sticker-choice.is-selected {
  border-color: #E58717;
  background-color: #FFE7B8;
  color: var(--ink-primary);
}

.dialogue-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 0.35rem;
}

.beat-dots {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.beat-dot {
  width: 13px;
  height: 13px;
  border-radius: 999px;
  background-color: #DFC9A4;
  transition: transform 200ms var(--ease-spring), background-color 180ms ease;
}

.beat-dot.is-active {
  background-color: #F29F24;
  transform: scale(1.32);
}

.beat-dot.is-past {
  background-color: #58B968;
}

.dialogue-controls {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.speaker-circle.is-speaking {
  background-color: #F29F24;
  border-color: #B56406;
  color: #FFFFFF;
}

.advance-btn {
  min-height: 54px;
  padding: 0.72rem 1.55rem;
}

@media (max-width: 780px) {
  .prologue-stage {
    padding: 0.9rem;
    gap: 0.9rem;
  }

  .prologue-center {
    grid-template-columns: 1fr;
    gap: 1.1rem;
  }

  .bombo-spotlight-img {
    width: 142px;
  }

  .story-dialogue-card {
    padding: 1.2rem;
  }

  .sticker-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
