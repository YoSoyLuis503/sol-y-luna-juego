<script setup lang="ts">
import { computed } from 'vue'
import type { BomboMood } from '@/types/game'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { assetUrl } from '@/utils/assets'

const {
  mood = 'happy',
  message,
  speechText,
  compact = false,
} = defineProps<{
  mood?: BomboMood
  message: string
  speechText?: string
  compact?: boolean
}>()

const { isSpeaking, speak } = useVoiceNarrator()
const { playTap } = useSoundEffects()

const portraitSrc = computed(() => assetUrl(`/art/bombo-${mood}.png`))

function handleSpeak(): void {
  playTap()
  speak(speechText ?? message)
}
</script>

<template>
  <aside
    class="bombo-guide"
    :class="{ 'is-compact': compact }"
    aria-live="polite"
  >
    <div class="bombo-sticker" :class="{ 'is-celebrate': mood === 'celebrate' }">
      <img
        :src="portraitSrc"
        :alt="`Bombo ${mood}`"
        class="bombo-img"
        width="104"
        height="104"
      />
      <span class="bombo-tag">Bombo</span>
    </div>

    <div class="bombo-bubble">
      <p class="bombo-text">{{ message }}</p>
      <div class="bombo-actions">
        <button
          type="button"
          class="speak-btn"
          :class="{ 'is-speaking': isSpeaking }"
          @click="handleSpeak"
        >
          <svg
            width="20"
            height="20"
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
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          <span>{{ isSpeaking ? 'Escuchando...' : 'Escuchar' }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.bombo-guide {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
}

.bombo-sticker {
  position: relative;
  flex-shrink: 0;
  width: 96px;
  height: 96px;
  padding: 5px;
  background-color: #FFFDF7;
  border: 3px solid var(--theme-border);
  border-radius: 26px;
  box-shadow: var(--shadow-sticker);
  transition: transform 260ms var(--ease-spring);
}

.bombo-guide.is-compact .bombo-sticker {
  width: 78px;
  height: 78px;
  border-radius: 22px;
}

.bombo-sticker.is-celebrate {
  animation: squashPop 420ms var(--ease-out);
}

.bombo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 18px;
  background-color: #FFFDF7;
}

.bombo-tag {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.1rem 0.65rem;
  border-radius: 999px;
  background-color: var(--theme-accent);
  color: #FFFFFF;
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  box-shadow: 0 2px 6px rgba(43, 36, 51, 0.18);
}

.bombo-bubble {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 0.85rem 1.15rem;
  background-color: var(--theme-surface);
  border: 2px solid var(--theme-border);
  border-radius: 22px;
  box-shadow: var(--shadow-paper-sm);
}

.bombo-text {
  font-size: 1.03rem;
  font-weight: 700;
  line-height: 1.38;
  color: var(--theme-ink);
}

.bombo-actions {
  flex-shrink: 0;
}

.speak-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background-color: var(--theme-accent-soft);
  color: var(--theme-ink);
  border: 2px solid var(--theme-border);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.92rem;
  transition:
    transform 150ms var(--ease-out),
    background-color 150ms ease;
}

.speak-btn.is-speaking {
  background-color: var(--theme-accent);
  color: #FFFFFF;
  border-color: var(--theme-accent-deep);
}

@media (hover: hover) and (pointer: fine) {
  .speak-btn:hover {
    transform: translateY(-1px);
  }
}

@media (max-width: 680px) {
  .bombo-guide {
    align-items: flex-start;
  }

  .bombo-sticker {
    width: 72px;
    height: 72px;
    border-radius: 18px;
  }

  .bombo-bubble {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.75rem 0.95rem;
    gap: 0.55rem;
  }

  .bombo-text {
    font-size: 0.96rem;
  }
}
</style>
