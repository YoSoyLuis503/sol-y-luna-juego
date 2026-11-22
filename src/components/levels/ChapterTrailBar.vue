<script setup lang="ts">
import type { ActNumber, LevelMeta } from '@/types/game'
import { assetUrl } from '@/utils/assets'

const {
  levelMeta,
  currentAct,
  inTransition = false,
} = defineProps<{
  levelMeta: LevelMeta
  currentAct: ActNumber
  inTransition?: boolean
}>()
</script>

<template>
  <nav class="trail-bar" aria-label="Camino de aventura del capítulo">
    <div class="trail-track">
      <div
        class="trail-progress"
        :style="{
          width: inTransition
            ? currentAct === 1
              ? '32%'
              : '68%'
            : currentAct === 1
              ? '14%'
              : currentAct === 2
                ? '50%'
                : '86%',
        }"
      />
    </div>

    <div class="trail-stops">
      <div
        v-for="(actName, idx) in levelMeta.acts"
        :key="actName"
        class="trail-node"
        :class="{
          'is-done': idx + 1 < currentAct || (inTransition && idx + 1 === currentAct),
          'is-current': !inTransition && idx + 1 === currentAct,
        }"
      >
        <div class="node-disc">
          <img
            v-if="!inTransition && idx + 1 === currentAct"
            :src="assetUrl('/art/bombo-happy.png')"
            alt="Bombo aquí"
            class="node-bombo"
            width="30"
            height="30"
          />
          <svg
            v-else-if="idx + 1 < currentAct || (inTransition && idx + 1 === currentAct)"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span v-else>{{ idx + 1 }}</span>
        </div>
        <span class="node-caption">{{ actName }}</span>
      </div>

      <div class="trail-node is-goal">
        <div class="node-disc goal-disc">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#F5B82E" stroke="#B56406" stroke-width="1.8" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <span class="node-caption">{{ levelMeta.badgeName }}</span>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.trail-bar {
  position: relative;
  padding: 0.7rem 1rem 0.65rem;
  border-radius: 22px;
  background-color: rgba(255, 253, 247, 0.94);
  border: 2px solid var(--theme-border);
  box-shadow: var(--shadow-paper-sm);
}

.trail-track {
  position: absolute;
  left: 9%;
  right: 9%;
  top: 26px;
  height: 6px;
  border-radius: 999px;
  background: repeating-linear-gradient(
    90deg,
    var(--theme-border) 0 10px,
    transparent 10px 16px
  );
  overflow: hidden;
  pointer-events: none;
}

.trail-progress {
  height: 100%;
  border-radius: 999px;
  background-color: var(--theme-accent);
  transition: width 360ms var(--ease-out);
}

.trail-stops {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.35rem;
}

.trail-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.25rem;
}

.node-disc {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--paper-cream-tint);
  border: 2.5px solid var(--theme-border);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--ink-secondary);
  overflow: hidden;
  transition: transform 220ms var(--ease-spring), border-color 180ms ease, background-color 180ms ease;
}

.trail-node.is-current .node-disc {
  border-color: var(--theme-accent);
  background-color: #FFFDF7;
  transform: scale(1.12);
  box-shadow: 0 3px 10px rgba(43, 36, 51, 0.16);
}

.trail-node.is-done .node-disc {
  background-color: #38945D;
  border-color: #256A41;
  color: #FFFFFF;
}

.goal-disc {
  background-color: #FFF4D4;
  border-color: #E5B963;
}

.node-bombo {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.node-caption {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--ink-secondary);
  line-height: 1.15;
}

.trail-node.is-current .node-caption {
  color: var(--theme-ink);
}

@media (max-width: 600px) {
  .node-caption {
    font-size: 0.7rem;
  }
}
</style>
