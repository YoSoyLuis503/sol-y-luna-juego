<script setup lang="ts">
import { shallowRef } from 'vue'
import type { LevelId, ScreenId } from '@/types/game'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import SplashScreen from '@/components/screens/SplashScreen.vue'
import CharacterIntroScreen from '@/components/screens/CharacterIntroScreen.vue'
import WorldMapScreen from '@/components/screens/WorldMapScreen.vue'
import LevelHost from '@/components/levels/LevelHost.vue'
import FinalCelebrationScreen from '@/components/screens/FinalCelebrationScreen.vue'
import BadgeAlbumModal from '@/components/common/BadgeAlbumModal.vue'

const { stop } = useVoiceNarrator()
const { playPageTurn } = useSoundEffects()

const activeScreen = shallowRef<ScreenId>('splash')
const activeLevelId = shallowRef<LevelId>(1)
const showAlbum = shallowRef(false)

function navigateTo(screen: ScreenId): void {
  stop()
  playPageTurn()
  activeScreen.value = screen
  window.scrollTo({ top: 0 })
}

function openLevel(id: LevelId): void {
  stop()
  activeLevelId.value = id
  activeScreen.value = 'level'
  window.scrollTo({ top: 0 })
}
</script>

<template>
  <div class="app-root">
    <SplashScreen
      v-if="activeScreen === 'splash'"
      @start-new="navigateTo('intro')"
      @continue-map="navigateTo('map')"
    />

    <CharacterIntroScreen
      v-else-if="activeScreen === 'intro'"
      @finish-intro="navigateTo('map')"
      @back-splash="navigateTo('splash')"
    />

    <WorldMapScreen
      v-else-if="activeScreen === 'map'"
      @select-level="openLevel"
      @open-album="showAlbum = true"
      @open-finale="navigateTo('finale')"
      @go-splash="navigateTo('splash')"
    />

    <LevelHost
      v-else-if="activeScreen === 'level'"
      :level-id="activeLevelId"
      @go-map="navigateTo('map')"
      @open-album="showAlbum = true"
      @next-level="openLevel"
      @finish-all="navigateTo('finale')"
    />

    <FinalCelebrationScreen
      v-else
      @go-map="navigateTo('map')"
      @open-album="showAlbum = true"
      @restart-game="navigateTo('splash')"
    />

    <BadgeAlbumModal
      v-if="showAlbum"
      @close="showAlbum = false"
    />
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
}
</style>
