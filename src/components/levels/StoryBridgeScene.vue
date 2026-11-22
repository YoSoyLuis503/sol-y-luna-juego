<script setup lang="ts">
import type { LevelMeta, StoryBridge } from '@/types/game'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import { assetUrl } from '@/utils/assets'

const {
  bridge,
  levelMeta,
} = defineProps<{
  bridge: StoryBridge
  levelMeta: LevelMeta
}>()

const emit = defineEmits<{
  continue: []
}>()

const { playPageTurn, playTap } = useSoundEffects()
const { speak, isSpeaking } = useVoiceNarrator()

function handleContinue(): void {
  playPageTurn()
  emit('continue')
}

function replayStory(): void {
  playTap()
  speak(bridge.storyText)
}
</script>

<template>
  <div class="bridge-theatrical anim-pop-in">
    <!-- Left: Spotlighted Bombo + Gleaming Adventure Relic floating on open diorama -->
    <div class="bridge-cast-col">
      <div class="bridge-bombo-halo anim-float">
        <img
          :src="assetUrl(`/art/bombo-${bridge.bomboMood}.png`)"
          alt="Bombo avanzando en el cuento"
          class="bridge-bombo-img"
          width="200"
          height="200"
        />
      </div>

      <div class="relic-pill" aria-label="Recuerdo desbloqueado">
        <svg width="46" height="46" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="28" fill="#FFFDF7" stroke="#E5B963" stroke-width="3" />
          <template v-if="bridge.relicIcon === 'key'">
            <circle cx="24" cy="32" r="8" fill="#F29F24" stroke="#B56406" stroke-width="2.4" />
            <path d="M32 32 H48 M42 32 V39 M48 32 V37" stroke="#B56406" stroke-width="3.2" stroke-linecap="round" />
          </template>
          <template v-else-if="bridge.relicIcon === 'scale'">
            <path d="M16 26 H48 M32 18 V46 M22 46 H42" stroke="#2493A2" stroke-width="3" stroke-linecap="round" />
            <path d="M16 26 L12 37 H22 Z M48 26 L42 37 H52 Z" fill="#F5B82E" />
          </template>
          <template v-else-if="bridge.relicIcon === 'bridge'">
            <path d="M14 40 A18 18 0 0 1 50 40" fill="none" stroke="#E3644B" stroke-width="4.5" stroke-linecap="round" />
            <path d="M20 40 A12 12 0 0 1 44 40" fill="none" stroke="#2493A2" stroke-width="4.5" stroke-linecap="round" />
            <line x1="12" y1="44" x2="52" y2="44" stroke="#38945D" stroke-width="4" stroke-linecap="round" />
          </template>
          <template v-else-if="bridge.relicIcon === 'mail'">
            <rect x="16" y="22" width="32" height="22" rx="4" fill="#DFF6F8" stroke="#186C78" stroke-width="2.5" />
            <path d="M16 24 L32 35 L48 24" fill="none" stroke="#186C78" stroke-width="2.5" stroke-linejoin="round" />
          </template>
          <template v-else-if="bridge.relicIcon === 'compass'">
            <circle cx="32" cy="32" r="16" fill="#FFEBE5" stroke="#B8422B" stroke-width="2.5" />
            <polygon points="32,19 37,32 32,45 27,32" fill="#E3644B" />
          </template>
          <template v-else-if="bridge.relicIcon === 'wind'">
            <path d="M14 26 H38 C43 26 45 20 39 18 C35 17 33 21 35 23 M14 36 H46 C51 36 52 43 45 44 C41 44 40 40 42 38" fill="none" stroke="#2493A2" stroke-width="3.2" stroke-linecap="round" />
          </template>
          <template v-else-if="bridge.relicIcon === 'shield'">
            <path d="M32 14 L48 20 V33 C48 42 40 48 32 51 C24 48 16 42 16 33 V20 Z" fill="#E1F5E8" stroke="#256A41" stroke-width="2.6" />
            <polyline points="25 32 30 37 40 27" fill="none" stroke="#256A41" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </template>
          <template v-else-if="bridge.relicIcon === 'drop'">
            <path d="M32 16 C23 28 20 34 20 39 A12 12 0 0 0 44 39 C44 34 41 28 32 16 Z" fill="#BCECF2" stroke="#186C78" stroke-width="2.6" />
          </template>
          <template v-else-if="bridge.relicIcon === 'lantern'">
            <rect x="23" y="22" width="18" height="24" rx="5" fill="#FFD15C" stroke="#5E56A8" stroke-width="2.6" />
            <path d="M26 22 C26 16 38 16 38 22" fill="none" stroke="#5E56A8" stroke-width="2.6" />
          </template>
          <template v-else>
            <circle cx="32" cy="34" r="12" fill="#FFD15C" stroke="#5E56A8" stroke-width="2.6" />
            <circle cx="22" cy="22" r="3.5" fill="#F5B82E" />
            <circle cx="44" cy="24" r="3" fill="#F5B82E" />
          </template>
        </svg>
        <div class="relic-copy">
          <span class="relic-sub">{{ levelMeta.chapterLabel }}</span>
          <strong class="relic-name">Recuerdo: {{ bridge.relicName }}</strong>
        </div>
      </div>
    </div>

    <!-- Right: Warm Cream Storybook Dialogue Page -->
    <div class="bridge-page-card">
      <div class="bridge-step-pill">
        <span>Parada {{ bridge.toAct - 1 }} lista</span>
        <span aria-hidden="true">→</span>
        <span>Rumbo a Parada {{ bridge.toAct }}</span>
      </div>

      <h2 class="bridge-title">{{ bridge.title }}</h2>
      <p class="bridge-story">{{ bridge.storyText }}</p>

      <div class="bridge-actions">
        <button
          type="button"
          class="toy-icon-btn speaker-circle"
          :class="{ 'is-speaking': isSpeaking }"
          aria-label="Escuchar historia"
          title="Escuchar historia"
          @click="replayStory"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" />
          </svg>
        </button>

        <button type="button" class="paper-btn paper-btn-green bridge-cta" @click="handleContinue">
          <span>{{ bridge.ctaLabel }}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bridge-theatrical {
  display: grid;
  grid-template-columns: minmax(220px, 300px) 1fr;
  gap: 2rem;
  align-items: center;
  padding: 1rem 0.5rem;
}

.bridge-cast-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}

.bridge-bombo-halo {
  width: 196px;
  height: 196px;
  padding: 8px;
  border-radius: 999px;
  background-color: #FFFDF7;
  border: 5px solid #F2D7A5;
  box-shadow:
    0 0 0 10px rgba(255, 244, 222, 0.35),
    0 16px 32px rgba(24, 19, 38, 0.28);
}

.bridge-bombo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 999px;
}

.relic-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.95rem 0.45rem 0.5rem;
  border-radius: 999px;
  background-color: #FFF4DE;
  border: 2.5px solid #E5B963;
  box-shadow: 0 4px 0 #D8B467, 0 8px 18px rgba(24, 19, 38, 0.22);
}

.relic-copy {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.relic-sub {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--ink-secondary);
}

.relic-name {
  font-family: var(--font-display);
  font-size: 0.92rem;
  color: var(--ink-primary);
}

.bridge-page-card {
  padding: 1.75rem 1.85rem;
  border-radius: 28px;
  background-color: #FFF4DE;
  border: 3px solid #DFC9A4;
  box-shadow:
    0 8px 0 #DFC597,
    0 20px 44px rgba(20, 15, 34, 0.28);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.9rem;
}

.bridge-step-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  background-color: var(--theme-accent-soft);
  border: 2px solid var(--theme-border);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--theme-ink);
}

.bridge-title {
  font-size: clamp(1.45rem, 2.7vw, 2rem);
}

.bridge-story {
  font-size: 1.12rem;
  font-weight: 700;
  color: #3B324B;
  line-height: 1.5;
  max-width: 50ch;
}

.bridge-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.85rem;
  margin-top: 0.25rem;
}

.speaker-circle.is-speaking {
  background-color: var(--theme-accent);
  border-color: var(--theme-accent-deep);
  color: #FFFFFF;
}

.bridge-cta {
  min-height: 54px;
}

@media (max-width: 760px) {
  .bridge-theatrical {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.1rem 0;
  }

  .bridge-cast-col {
    gap: 0.55rem;
  }

  .bridge-bombo-halo {
    width: 108px;
    height: 108px;
  }

  .bridge-page-card {
    padding: 1rem 1.1rem;
    gap: 0.6rem;
  }

  .bridge-story {
    font-size: 1rem;
    line-height: 1.4;
  }
}
</style>
