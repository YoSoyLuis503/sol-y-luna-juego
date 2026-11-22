<script setup lang="ts">
import type { StickerId } from '@/types/game'

const { id, size = 36 } = defineProps<{
  id: StickerId
  size?: number
}>()
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    class="sticker-glyph"
    aria-hidden="true"
  >
    <template v-if="id === 'sun'">
      <circle cx="32" cy="32" r="15" fill="#F29F24" />
      <circle cx="32" cy="32" r="11" fill="#FFD15C" />
      <path
        d="M32 6 L35 14 L29 14 Z M32 58 L35 50 L29 50 Z M6 32 L14 29 L14 35 Z M58 32 L50 29 L50 35 Z M13 13 L20 17 L17 20 Z M51 51 L44 47 L47 44 Z M51 13 L47 20 L44 17 Z M13 51 L17 44 L20 47 Z"
        fill="#E57E1B"
      />
      <circle cx="27.5" cy="30" r="1.8" fill="#2B2433" />
      <circle cx="36.5" cy="30" r="1.8" fill="#2B2433" />
      <path d="M27.5 35.5 Q32 39.5 36.5 35.5" stroke="#2B2433" stroke-width="2.2" fill="none" stroke-linecap="round" />
    </template>

    <template v-else-if="id === 'star'">
      <path
        d="M32 7 L39.2 22.5 L56 24.8 L43.6 36.5 L46.8 53.2 L32 45 L17.2 53.2 L20.4 36.5 L8 24.8 L24.8 22.5 Z"
        fill="#F5B82E"
        stroke="#C97A0C"
        stroke-width="2.4"
        stroke-linejoin="round"
      />
      <circle cx="28" cy="31" r="1.7" fill="#2B2433" />
      <circle cx="36" cy="31" r="1.7" fill="#2B2433" />
      <path d="M28.5 36 Q32 38.8 35.5 36" stroke="#2B2433" stroke-width="2" fill="none" stroke-linecap="round" />
    </template>

    <template v-else-if="id === 'kite'">
      <path d="M32 8 L50 27 L32 48 L14 27 Z" fill="#2493A2" stroke="#186C78" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M32 8 L50 27 L32 27 Z" fill="#F29F24" />
      <path d="M14 27 L32 27 L32 48 Z" fill="#E3644B" />
      <path d="M32 48 Q38 54 30 58 Q25 60 33 62" stroke="#534A5E" stroke-width="2.2" fill="none" stroke-linecap="round" />
      <circle cx="35" cy="54" r="2.4" fill="#F5B82E" />
    </template>

    <template v-else>
      <path
        d="M19 46 H46 C52 46 56 41.5 56 36 C56 31 52.3 27 47.4 26.3 C45.8 19.6 39.8 15 32.8 15 C24.6 15 18 21.4 17.8 29.5 C13.2 30.4 10 34.4 10 39 C10 43 13.7 46 19 46 Z"
        fill="#ECE9FC"
        stroke="#6C63B5"
        stroke-width="2.4"
        stroke-linejoin="round"
      />
      <circle cx="27.5" cy="33" r="1.8" fill="#2B2433" />
      <circle cx="37.5" cy="33" r="1.8" fill="#2B2433" />
      <path d="M28.5 38 Q32.5 41 36.5 38" stroke="#2B2433" stroke-width="2" fill="none" stroke-linecap="round" />
    </template>
  </svg>
</template>

<style scoped>
.sticker-glyph {
  flex-shrink: 0;
  display: block;
}
</style>
