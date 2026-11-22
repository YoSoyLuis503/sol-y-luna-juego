<script setup lang="ts">
import { computed } from 'vue'

const { active = false } = defineProps<{
  active?: boolean
}>()

const PALETTE = ['#F29F24', '#E3644B', '#2493A2', '#38945D', '#6C63B5', '#F5B82E']

const pieces = computed(() =>
  Array.from({ length: 24 }, (_, idx) => {
    const left = ((idx * 17 + 7) % 92) + 4
    const dx = ((idx % 5) - 2) * 38
    const dy = 150 + (idx % 4) * 55
    const rot = (idx % 2 === 0 ? 1 : -1) * (180 + (idx % 3) * 120)
    const delay = (idx % 6) * 65
    return {
      id: idx,
      left: `${left}%`,
      color: PALETTE[idx % PALETTE.length],
      dx: `${dx}px`,
      dy: `${dy}px`,
      rot: `${rot}deg`,
      delay: `${delay}ms`,
      isStar: idx % 3 === 0,
    }
  }),
)
</script>

<template>
  <div v-if="active" class="confetti-layer" aria-hidden="true">
    <div
      v-for="piece in pieces"
      :key="piece.id"
      class="confetti-piece"
      :class="{ 'is-star': piece.isStar }"
      :style="{
        left: piece.left,
        backgroundColor: piece.isStar ? 'transparent' : piece.color,
        color: piece.color,
        '--dx': piece.dx,
        '--dy': piece.dy,
        '--rot': piece.rot,
        animationDelay: piece.delay,
      }"
    >
      <svg v-if="piece.isStar" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15 9 22 9 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9 9 9" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.confetti-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 90;
}

.confetti-piece {
  position: absolute;
  top: 16%;
  width: 12px;
  height: 16px;
  border-radius: 3px;
  animation: confettiFall 1150ms var(--ease-out) forwards;
}

.confetti-piece.is-star {
  width: 16px;
  height: 16px;
}

@media (prefers-reduced-motion: reduce) {
  .confetti-layer {
    display: none;
  }
}
</style>
