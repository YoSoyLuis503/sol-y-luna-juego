<script setup lang="ts">
import { computed, onUnmounted, shallowRef, watch } from 'vue'
import { getLevelMeta } from '@/data/levels'
import { getStoryBridge } from '@/data/storyBridges'
import type { ActNumber, BomboMood, FeedbackState, LevelId, StoryBridge } from '@/types/game'
import { useGameProgress } from '@/composables/useGameProgress'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { useVoiceNarrator } from '@/composables/useVoiceNarrator'
import { assetUrl } from '@/utils/assets'
import TopHud from '@/components/common/TopHud.vue'
import BomboGuide from '@/components/common/BomboGuide.vue'
import FeedbackBanner from '@/components/common/FeedbackBanner.vue'
import ConfettiBurst from '@/components/common/ConfettiBurst.vue'
import LevelCompleteModal from '@/components/common/LevelCompleteModal.vue'
import ChapterTrailBar from '@/components/levels/ChapterTrailBar.vue'
import StoryBridgeScene from '@/components/levels/StoryBridgeScene.vue'
import Level1Recreo from '@/components/levels/Level1Recreo.vue'
import Level2Parque from '@/components/levels/Level2Parque.vue'
import Level3Colina from '@/components/levels/Level3Colina.vue'
import Level4Sendero from '@/components/levels/Level4Sendero.vue'
import Level5Luciernagas from '@/components/levels/Level5Luciernagas.vue'

const { levelId } = defineProps<{
  levelId: LevelId
}>()

const emit = defineEmits<{
  goMap: []
  openAlbum: []
  nextLevel: [nextId: LevelId]
  finishAll: []
}>()

const { completeLevel } = useGameProgress()
const { playPageTurn, playLevelFanfare, playStar } = useSoundEffects()
const { speak, stop } = useVoiceNarrator()

const meta = computed(() => getLevelMeta(levelId))
const hasStarted = shallowRef(false)
const currentAct = shallowRef<ActNumber>(1)
const activeBridge = shallowRef<StoryBridge | null>(null)
const bomboMood = shallowRef<BomboMood>('happy')
const bomboMessage = shallowRef(meta.value.introScript)
const feedback = shallowRef<FeedbackState | null>(null)
const confettiActive = shallowRef(false)
const showCompleteModal = shallowRef(false)
const starsWon = shallowRef(3)

let feedbackCounter = 0
let confettiTimer: number | undefined

function triggerConfetti(durationMs = 1500): void {
  if (confettiTimer !== undefined) {
    window.clearTimeout(confettiTimer)
  }
  confettiActive.value = false
  window.requestAnimationFrame(() => {
    confettiActive.value = true
    confettiTimer = window.setTimeout(() => {
      confettiActive.value = false
    }, durationMs)
  })
}

watch(
  () => levelId,
  (newId) => {
    const nextMeta = getLevelMeta(newId)
    hasStarted.value = false
    currentAct.value = 1
    activeBridge.value = null
    bomboMood.value = 'happy'
    bomboMessage.value = nextMeta.introScript
    feedback.value = null
    showCompleteModal.value = false
    confettiActive.value = false
    speak(`${nextMeta.chapterLabel}: ${nextMeta.title}. ${nextMeta.introScript}`)
  },
  { immediate: true },
)

onUnmounted(() => {
  stop()
  if (confettiTimer !== undefined) {
    window.clearTimeout(confettiTimer)
  }
})

function startChapter(): void {
  playPageTurn()
  hasStarted.value = true
  window.scrollTo({ top: 0 })
}

function handleRequestNextAct(nextAct: 2 | 3): void {
  const bridge = getStoryBridge(levelId, nextAct)
  playPageTurn()
  playStar()
  feedback.value = null
  activeBridge.value = bridge
  bomboMood.value = bridge.bomboMood
  bomboMessage.value = bridge.storyText
  speak(bridge.storyText)
  window.scrollTo({ top: 0 })
}

function continuePastBridge(): void {
  if (!activeBridge.value) return
  const next = activeBridge.value.toAct
  activeBridge.value = null
  currentAct.value = next
  feedback.value = null
  window.scrollTo({ top: 0 })
}

function handleGuide(payload: { mood: BomboMood; message: string; shouldSpeak?: boolean }): void {
  if (activeBridge.value) return
  bomboMood.value = payload.mood
  bomboMessage.value = payload.message
  if (payload.shouldSpeak !== false) {
    speak(payload.message)
  }
}

function handleFeedback(payload: { kind: 'success' | 'hint' | 'info'; text: string }): void {
  feedbackCounter += 1
  feedback.value = {
    id: feedbackCounter,
    kind: payload.kind,
    text: payload.text,
  }
}

function handleCelebrateAct(): void {
  playStar()
  triggerConfetti(1200)
}

function handleCompleteLevel(stars = 3): void {
  starsWon.value = stars
  completeLevel(levelId, stars)
  bomboMood.value = 'celebrate'
  bomboMessage.value = meta.value.completionTakeaway
  playLevelFanfare()
  triggerConfetti(2000)
  speak(`¡Lo lograste! ${meta.value.completionTakeaway}`)
  showCompleteModal.value = true
}

function handleModalNext(): void {
  showCompleteModal.value = false
  if (levelId < 5) {
    emit('nextLevel', (levelId + 1) as LevelId)
  } else {
    emit('finishAll')
  }
}

function handleGoMap(): void {
  stop()
  emit('goMap')
}
</script>

<template>
  <div class="level-world" :data-theme="meta.themeKey">
    <div
      class="level-backdrop"
      :style="{ backgroundImage: `url(${meta.backgroundArt})` }"
      aria-hidden="true"
    />
    <div class="level-tint" aria-hidden="true" />

    <ConfettiBurst :active="confettiActive" />

    <div class="level-shell">
      <TopHud
        :level-meta="meta"
        :current-act="currentAct"
        :show-back-to-map="true"
        @go-map="handleGoMap"
        @open-album="emit('openAlbum')"
      />

      <!-- Chapter Opening Card -->
      <main v-if="!hasStarted" class="chapter-opener">
        <div class="opener-card paper-panel anim-pop-in">
          <div class="opener-art-wrap">
            <img
              :src="meta.backgroundArt"
              :alt="meta.title"
              class="opener-bg-preview"
            />
            <img
              :src="assetUrl('/art/bombo-happy.png')"
              alt="Bombo te invita al capítulo"
              class="opener-bombo"
              width="124"
              height="124"
            />
          </div>

          <div class="opener-copy">
            <span class="chapter-ribbon">{{ meta.chapterLabel }}</span>
            <h1 class="opener-title">{{ meta.title }}</h1>
            <p class="opener-facet">{{ meta.facetTitle }}</p>
            <p class="opener-desc">{{ meta.facetSummary }}</p>

            <div class="opener-acts-preview">
              <div v-for="(act, idx) in meta.acts" :key="act" class="opener-act-chip">
                <span class="chip-num">{{ idx + 1 }}</span>
                <span>{{ act }}</span>
              </div>
            </div>

            <div class="opener-actions">
              <button type="button" class="paper-btn paper-btn-primary" @click="startChapter">
                ¡Empezar capítulo!
              </button>
              <button type="button" class="paper-btn paper-btn-secondary" @click="speak(meta.introScript)">
                Escuchar a Bombo
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Active Level Gameplay & Story Transitions -->
      <main v-else class="level-main">
        <ChapterTrailBar
          :level-meta="meta"
          :current-act="currentAct"
          :in-transition="Boolean(activeBridge)"
        />

        <BomboGuide
          v-if="!activeBridge"
          :mood="bomboMood"
          :message="bomboMessage"
          :compact="true"
        />

        <FeedbackBanner v-if="!activeBridge" :feedback="feedback" />

        <section class="stage-card paper-panel" :aria-label="meta.title">
          <Transition name="page-turn" mode="out-in">
            <StoryBridgeScene
              v-if="activeBridge"
              :key="`bridge-${levelId}-${activeBridge.toAct}`"
              :bridge="activeBridge"
              :level-meta="meta"
              @continue="continuePastBridge"
            />

            <div v-else :key="`act-${levelId}-${currentAct}`">
              <Level1Recreo
                v-if="levelId === 1"
                :act="currentAct"
                @request-next-act="handleRequestNextAct"
                @guide="handleGuide"
                @feedback="handleFeedback"
                @celebrate-act="handleCelebrateAct"
                @complete-level="handleCompleteLevel"
              />
              <Level2Parque
                v-else-if="levelId === 2"
                :act="currentAct"
                @request-next-act="handleRequestNextAct"
                @guide="handleGuide"
                @feedback="handleFeedback"
                @celebrate-act="handleCelebrateAct"
                @complete-level="handleCompleteLevel"
              />
              <Level3Colina
                v-else-if="levelId === 3"
                :act="currentAct"
                @request-next-act="handleRequestNextAct"
                @guide="handleGuide"
                @feedback="handleFeedback"
                @celebrate-act="handleCelebrateAct"
                @complete-level="handleCompleteLevel"
              />
              <Level4Sendero
                v-else-if="levelId === 4"
                :act="currentAct"
                @request-next-act="handleRequestNextAct"
                @guide="handleGuide"
                @feedback="handleFeedback"
                @celebrate-act="handleCelebrateAct"
                @complete-level="handleCompleteLevel"
              />
              <Level5Luciernagas
                v-else
                :act="currentAct"
                @request-next-act="handleRequestNextAct"
                @guide="handleGuide"
                @feedback="handleFeedback"
                @celebrate-act="handleCelebrateAct"
                @complete-level="handleCompleteLevel"
              />
            </div>
          </Transition>
        </section>
      </main>
    </div>

    <LevelCompleteModal
      v-if="showCompleteModal"
      :level-meta="meta"
      :stars-earned="starsWon"
      @next="handleModalNext"
      @map="handleGoMap"
    />
  </div>
</template>

<style scoped>
.level-world {
  position: relative;
  min-height: 100vh;
  padding: 0.9rem 1rem 2rem;
  overflow-x: hidden;
}

.level-backdrop {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.level-tint {
  position: fixed;
  inset: 0;
  background-color: var(--theme-backdrop-tint);
  z-index: 1;
  transition: background-color 300ms ease;
}

.level-shell {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chapter-opener {
  display: flex;
  justify-content: center;
  padding-top: 0.8rem;
}

.opener-card {
  width: 100%;
  max-width: 860px;
  padding: 1.8rem;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.7rem;
  align-items: center;
}

.opener-art-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.opener-bg-preview {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 22px;
  border: 3px solid var(--theme-border);
  box-shadow: var(--shadow-paper-sm);
}

.opener-bombo {
  margin-top: -54px;
  width: 112px;
  height: 112px;
  border-radius: 26px;
  border: 3px solid var(--theme-border);
  background-color: #FFFDF7;
  object-fit: contain;
  box-shadow: var(--shadow-sticker);
}

.opener-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.7rem;
}

.chapter-ribbon {
  padding: 0.25rem 0.85rem;
  border-radius: 999px;
  background-color: var(--theme-accent-soft);
  border: 2px solid var(--theme-border);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--theme-ink);
}

.opener-title {
  font-size: clamp(1.65rem, 3.2vw, 2.35rem);
}

.opener-facet {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.08rem;
  color: var(--theme-accent-deep);
}

.opener-desc {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--theme-ink-soft);
  line-height: 1.45;
}

.opener-acts-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.25rem 0;
}

.opener-act-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.8rem 0.35rem 0.4rem;
  border-radius: 999px;
  background-color: var(--theme-surface-alt);
  border: 1.5px solid var(--theme-border);
  font-size: 0.88rem;
  font-weight: 700;
}

.chip-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background-color: var(--theme-accent);
  color: #FFFFFF;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.82rem;
}

.opener-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.35rem;
}

.level-main {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.stage-card {
  padding: 1.35rem 1.45rem;
  min-height: 410px;
}

@media (max-width: 760px) {
  .opener-card {
    grid-template-columns: 1fr;
    padding: 1.3rem;
    gap: 1.1rem;
  }

  .stage-card {
    padding: 1rem;
  }
}
</style>
