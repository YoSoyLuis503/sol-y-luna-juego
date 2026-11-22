<script setup lang="ts">
import type { LevelId } from '@/types/game'

const {
  levelId,
  earned = true,
  size = 76,
} = defineProps<{
  levelId: LevelId
  earned?: boolean
  size?: number
}>()
</script>

<template>
  <div
    class="badge-wrap"
    :class="{ 'is-locked': !earned }"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg
      viewBox="0 0 96 96"
      class="badge-svg"
      aria-hidden="true"
    >
      <!-- Cut-paper scalloped medal base -->
      <circle
        cx="48"
        cy="48"
        r="43"
        :fill="earned ? '#FFFDF7' : '#EAE3D5'"
        :stroke="earned ? '#D8C4A0' : '#C9BEA9'"
        stroke-width="3"
      />
      <circle
        cx="48"
        cy="48"
        r="36"
        :fill="
          !earned
            ? '#DFD6C5'
            : levelId === 1
              ? '#FFE9B8'
              : levelId === 2
                ? '#D6F3F5'
                : levelId === 3
                  ? '#FFE3DB'
                  : levelId === 4
                    ? '#DDF4E5'
                    : '#E6E2FA'
        "
      />

      <!-- Chapter 1: Reloj Feliz -->
      <template v-if="levelId === 1">
        <circle cx="48" cy="48" r="22" fill="#F29F24" stroke="#B56406" stroke-width="2.5" />
        <circle cx="48" cy="48" r="16" fill="#FFFDF7" />
        <path d="M48 36 V48 L56 52" stroke="#E3644B" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        <circle cx="48" cy="48" r="2.8" fill="#2B2433" />
      </template>

      <!-- Chapter 2: Parque Arcoíris -->
      <template v-else-if="levelId === 2">
        <path d="M24 58 A24 24 0 0 1 72 58" fill="none" stroke="#E3644B" stroke-width="5" stroke-linecap="round" />
        <path d="M30 58 A18 18 0 0 1 66 58" fill="none" stroke="#F5B82E" stroke-width="5" stroke-linecap="round" />
        <path d="M36 58 A12 12 0 0 1 60 58" fill="none" stroke="#2493A2" stroke-width="5" stroke-linecap="round" />
        <path d="M22 61 H74" stroke="#38945D" stroke-width="4.5" stroke-linecap="round" />
      </template>

      <!-- Chapter 3: Cometa Libre -->
      <template v-else-if="levelId === 3">
        <path d="M48 20 L67 42 L48 64 L29 42 Z" fill="#2493A2" stroke="#186C78" stroke-width="2.4" stroke-linejoin="round" />
        <path d="M48 20 L67 42 L48 42 Z" fill="#F29F24" />
        <path d="M29 42 L48 42 L48 64 Z" fill="#E3644B" />
        <path d="M48 64 Q56 71 45 77" stroke="#534A5E" stroke-width="2.5" stroke-linecap="round" fill="none" />
      </template>

      <!-- Chapter 4: Corazón Sabio -->
      <template v-else-if="levelId === 4">
        <path
          d="M48 70 C48 70 24 55 24 39 C24 30.5 31 25 38.5 25 C43.2 25 46.7 27.6 48 30.6 C49.3 27.6 52.8 25 57.5 25 C65 25 72 30.5 72 39 C72 55 48 70 48 70 Z"
          fill="#38945D"
          stroke="#256A41"
          stroke-width="2.5"
          stroke-linejoin="round"
        />
        <path d="M48 36 C44 43 42 47 42 50 A6 6 0 0 0 54 50 C54 47 52 43 48 36 Z" fill="#DDF4FA" />
      </template>

      <!-- Chapter 5: Luna Serena -->
      <template v-else>
        <path
          d="M53 24 C40.5 25.2 31 35.8 31 48.5 C31 61.8 41.8 72.5 55.2 72.5 C61.2 72.5 66.7 70.3 71 66.6 C61.5 67.6 52.5 60.5 51.4 50.6 C50.3 40.8 55.8 31.6 64 28.4 C60.8 25.5 57 24 53 24 Z"
          fill="#6C63B5"
          stroke="#483F91"
          stroke-width="2.4"
          stroke-linejoin="round"
        />
        <circle cx="62" cy="39" r="3.4" fill="#F5B82E" />
        <circle cx="69" cy="51" r="2.6" fill="#FFD15C" />
      </template>
    </svg>
  </div>
</template>

<style scoped>
.badge-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 220ms var(--ease-out);
}

.badge-wrap.is-locked {
  filter: grayscale(0.85);
  opacity: 0.58;
}

.badge-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 8px rgba(43, 36, 51, 0.14));
}
</style>
