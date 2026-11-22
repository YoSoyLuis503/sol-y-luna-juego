<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import type { BomboMood } from '@/types/game'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { assetUrl } from '@/utils/assets'

const {
  mood = 'happy',
  message,
  speechText,
  compact = false,
  docked = false,
} = defineProps<{
  mood?: BomboMood
  message: string
  speechText?: string
  compact?: boolean
  docked?: boolean
}>()

const { isSpeaking, speak } = useVoiceNarrator()
const { playTap } = useSoundEffects()

const bubbleOpen = shallowRef(true)

watch(
  () => message,
  () => {
    bubbleOpen.value = true
  },
)

const portraitSrc = computed(() => assetUrl(`/art/bombo-${mood}.png`))

function handleSpeak(): void {
  playTap()
  bubbleOpen.value = true
  speak(speechText ?? message)
}

function toggleBubble(): void {
  playTap()
  bubbleOpen.value = !bubbleOpen.value
}
</script>

<template>
  <aside
    class="bombo-guide"
    :class="{ 'is-compact': compact, 'is-docked': docked }"
    aria-live="polite"
  >
    <button
      type="button"
      class="bombo-sticker"
      :class="{ 'is-celebrate': mood === 'celebrate' }"
      :aria-label="bubbleOpen ? 'Ocultar globo de Bombo' : 'Mostrar mensaje de Bombo'"
      @click="toggleBubble"
    >
      <img
        :src="portraitSrc"
        :alt="`Bombo ${mood}`"
        class="bombo-img"
        width="104"
        height="104"
      />
      <span class="bombo-tag">Bombo</span>
    </button>

    <div v-if="bubbleOpen" class="bombo-bubble anim-pop-in">
      <p class="bombo-text">{{ message }}</p>
      <button
        type="button"
        class="toy-icon-btn speak-circle-btn"
        :class="{ 'is-speaking': isSpeaking }"
        :aria-label="isSpeaking ? 'Escuchando a Bombo' : 'Escuchar a Bombo'"
        :title="isSpeaking ? 'Escuchando...' : 'Escuchar'"
        @click="handleSpeak"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.bombo-guide {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  width: 100%;
}

.bombo-sticker {
  position: relative;
  flex-shrink: 0;
  width: 86px;
  height: 86px;
  padding: 5px;
  background-color: #FFFDF7;
  border: 3.5px solid #DFC9A4;
  border-radius: 999px;
  box-shadow: 0 5px 0 #D0B589, var(--shadow-sticker);
  transition: transform 240ms var(--ease-spring);
}

.bombo-guide.is-docked .bombo-sticker {
  width: 78px;
  height: 78px;
}

.bombo-sticker.is-celebrate {
  animation: squashPop 420ms var(--ease-out);
}

.bombo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 999px;
  background-color: #FFFDF7;
}

.bombo-tag {
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.08rem 0.6rem;
  border-radius: 999px;
  background-color: var(--theme-accent);
  color: #FFFFFF;
  border: 2px solid #FFFDF7;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(34, 25, 48, 0.22);
}

.bombo-bubble {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: rgba(255, 244, 222, 0.97);
  border: 2.5px solid #DFC9A4;
  border-radius: 22px;
  box-shadow: 0 5px 0 #D8BE94, 0 12px 24px rgba(24, 19, 38, 0.18);
}

.bombo-bubble::before {
  content: '';
  position: absolute;
  left: -9px;
  bottom: 18px;
  width: 14px;
  height: 14px;
  background-color: #FFF4DE;
  border-left: 2.5px solid #DFC9A4;
  border-bottom: 2.5px solid #DFC9A4;
  transform: rotate(45deg);
}

.bombo-text {
  font-size: 0.99rem;
  font-weight: 700;
  line-height: 1.38;
  color: var(--ink-primary);
}

.speak-circle-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  background-color: #FFFDF7;
}

.speak-circle-btn.is-speaking {
  background-color: var(--theme-accent);
  border-color: var(--theme-accent-deep);
  color: #FFFFFF;
  box-shadow: 0 3px 0 var(--theme-accent-deep);
}

@media (max-width: 640px) {
  .bombo-sticker {
    width: 68px;
    height: 68px;
  }

  .bombo-text {
    font-size: 0.92rem;
  }
}
</style>
