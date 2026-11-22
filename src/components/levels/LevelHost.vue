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
const { playPageTurn, playLevelFanfare, playStar, playTap } = useSoundEffects()
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
  <div class="storybook-viewport" :data-theme="meta.themeKey">
    <div class="storybook-stage level-diorama">
      <!-- Vivid Full-Bleed Chapter Panorama -->
      <img
        :src="meta.backgroundArt"
        alt=""
        class="diorama-panorama"
      />
      <div class="diorama-tint" aria-hidden="true" />
      <div class="paper-grain-overlay" aria-hidden="true" />

      <ConfettiBurst :active="confettiActive" />

      <div class="level-hud-wrap">
        <TopHud
          :level-meta="meta"
          :current-act="currentAct"
          :show-back-to-map="true"
          @go-map="handleGoMap"
          @open-album="emit('openAlbum')"
        />
      </div>

      <!-- Chapter Briefing Modal over live panorama -->
      <main v-if="!hasStarted" class="briefing-backdrop">
        <div class="briefing-card anim-pop-in">
          <div class="briefing-top">
            <span class="chapter-pill">{{ meta.chapterLabel }}</span>
            <span class="facet-pill">{{ meta.facetTitle }}</span>
          </div>

          <div class="briefing-hero">
            <div class="briefing-bombo-ring">
              <img
                :src="assetUrl(levelId === 5 ? '/art/bombo-sleepy.png' : '/art/bombo-happy.png')"
                alt="Bombo te invita al capítulo"
                class="briefing-bombo"
                width="120"
                height="120"
              />
            </div>
            <div class="briefing-copy">
              <h1 class="briefing-title">{{ meta.title }}</h1>
              <p class="briefing-story">{{ meta.introScript }}</p>
            </div>
          </div>

          <div class="briefing-acts">
            <span v-for="(act, idx) in meta.acts" :key="act" class="brief-act-chip">
              <strong>{{ idx + 1 }}</strong>
              <span>{{ act }}</span>
            </span>
          </div>

          <div class="briefing-actions">
            <button
              type="button"
              class="toy-icon-btn"
              aria-label="Escuchar a Bombo"
              title="Escuchar a Bombo"
              @click="playTap(); speak(meta.introScript)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" />
              </svg>
            </button>

            <button type="button" class="paper-btn paper-btn-green briefing-play-btn" @click="startChapter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
              <span>¡A jugar!</span>
            </button>
          </div>
        </div>
      </main>

      <!-- Open Theatrical Stage & Story Transitions -->
      <main v-else class="theatrical-main">
        <ChapterTrailBar
          :level-meta="meta"
          :current-act="currentAct"
          :in-transition="Boolean(activeBridge)"
        />

        <div class="play-canvas">
          <Transition name="page-turn" mode="out-in">
            <StoryBridgeScene
              v-if="activeBridge"
              :key="`bridge-${levelId}-${activeBridge.toAct}`"
              :bridge="activeBridge"
              :level-meta="meta"
              @continue="continuePastBridge"
            />

            <div v-else :key="`act-${levelId}-${currentAct}`" class="act-parchment">
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
        </div>

        <div v-if="!activeBridge" class="bottom-narrator-row">
          <BomboGuide
            :mood="bomboMood"
            :message="bomboMessage"
            :compact="true"
            :docked="true"
          />
          <FeedbackBanner :feedback="feedback" class="narrator-feedback" />
        </div>
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
.level-diorama {
  justify-content: space-between;
  padding: 0.95rem 1.25rem 1.05rem;
  gap: 0.65rem;
}

.diorama-panorama {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.diorama-tint {
  position: absolute;
  inset: 0;
  background-color: var(--theme-backdrop-tint);
  z-index: 1;
}

.level-hud-wrap {
  position: relative;
  z-index: 20;
}

/* Centered Briefing Modal */
.briefing-backdrop {
  position: relative;
  z-index: 15;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
}

.briefing-card {
  width: 100%;
  max-width: 680px;
  padding: 1.65rem 1.85rem;
  border-radius: 28px;
  background-color: #FFF4DE;
  border: 3px solid #DFC9A4;
  box-shadow:
    0 8px 0 #DFC597,
    0 24px 48px rgba(20, 15, 34, 0.34);
  display: flex;
  flex-direction: column;
  gap: 1.05rem;
}

.briefing-top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.chapter-pill {
  padding: 0.25rem 0.85rem;
  border-radius: 999px;
  background-color: var(--theme-accent);
  color: #FFFFFF;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
}

.facet-pill {
  padding: 0.25rem 0.85rem;
  border-radius: 999px;
  background-color: #E86A92;
  color: #FFFFFF;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.86rem;
}

.briefing-hero {
  display: flex;
  align-items: center;
  gap: 1.15rem;
}

.briefing-bombo-ring {
  flex-shrink: 0;
  width: 112px;
  height: 112px;
  padding: 5px;
  border-radius: 999px;
  background-color: #FFFDF7;
  border: 3px solid #DFC9A4;
  box-shadow: var(--shadow-paper-sm);
}

.briefing-bombo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 999px;
}

.briefing-copy {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.briefing-title {
  font-size: clamp(1.55rem, 3vw, 2.15rem);
}

.briefing-story {
  font-size: 1.06rem;
  font-weight: 700;
  color: #463D57;
  line-height: 1.45;
}

.briefing-acts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.brief-act-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.78rem 0.3rem 0.38rem;
  border-radius: 999px;
  background-color: #FFFDF7;
  border: 1.5px solid #DFC9A4;
  font-size: 0.86rem;
  font-weight: 700;
}

.brief-act-chip strong {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background-color: var(--theme-accent);
  color: #FFFFFF;
  font-family: var(--font-display);
  font-size: 0.78rem;
}

.briefing-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.85rem;
}

.briefing-play-btn {
  min-height: 54px;
  padding: 0.75rem 1.85rem;
}

/* Theatrical Open Play Area */
.theatrical-main {
  position: relative;
  z-index: 15;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.65rem;
}

.play-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.act-parchment {
  padding: 0.85rem 1.05rem;
  border-radius: 26px;
  background-color: rgba(255, 249, 238, 0.9);
  border: 2.5px solid rgba(223, 201, 164, 0.95);
  box-shadow: 0 12px 30px rgba(24, 19, 38, 0.18);
  backdrop-filter: blur(2px);
}

.bottom-narrator-row {
  display: grid;
  grid-template-columns: minmax(280px, 1.35fr) minmax(200px, 1fr);
  align-items: end;
  gap: 0.75rem;
}

@media (max-width: 820px) {
  .bottom-narrator-row {
    grid-template-columns: 1fr;
  }

  .briefing-hero {
    flex-direction: column;
    text-align: center;
  }

  .briefing-actions {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .level-diorama {
    padding: 0.7rem 0.75rem 0.9rem;
  }

  .act-parchment {
    padding: 0.85rem;
    border-radius: 20px;
  }

  .briefing-card {
    padding: 1.2rem;
  }
}
</style>
