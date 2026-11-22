<script setup lang="ts">
import { computed, onUnmounted, reactive, shallowRef, watch } from 'vue'
import type { ActNumber, BomboMood } from '@/types/game'
import { useSoundEffects } from '@/composables/useSoundEffects'
import { assetUrl } from '@/utils/assets'

const { act } = defineProps<{
  act: ActNumber
}>()

const emit = defineEmits<{
  requestNextAct: [nextAct: 2 | 3]
  guide: [payload: { mood: BomboMood; message: string; shouldSpeak?: boolean }]
  feedback: [payload: { kind: 'success' | 'hint' | 'info'; text: string }]
  celebrateAct: []
  completeLevel: [stars?: number]
}>()

const { playTap, playSuccess, playGentleHint, playLullabyNote } = useSoundEffects()

// ---------------- ACT 1: Bedtime Routine Order ----------------
interface RoutineStep {
  id: string
  order: number
  label: string
  detail: string
}

const ROUTINE_POOL: readonly RoutineStep[] = [
  { id: 'brush', order: 2, label: 'Cenar ligero y cepillar dientes', detail: 'Paso 2' },
  { id: 'sleep', order: 4, label: 'Dormir tranquilo toda la noche', detail: 'Paso 4' },
  { id: 'tidy', order: 1, label: 'Guardar juguetes al caer la tarde', detail: 'Paso 1' },
  { id: 'story', order: 3, label: 'Apagar pantallas y leer un cuento', detail: 'Paso 3' },
]

const selectedCardId = shallowRef<string | null>(null)
const pocketAssignments = reactive<Record<number, RoutineStep | null>>({
  1: null,
  2: null,
  3: null,
  4: null,
})

const placedCount = computed(
  () => Object.values(pocketAssignments).filter((v) => v !== null).length,
)

const act1Done = computed(() => placedCount.value === 4)

function isCardPlaced(id: string): boolean {
  return Object.values(pocketAssignments).some((v) => v?.id === id)
}

function selectRoutineCard(step: RoutineStep): void {
  if (isCardPlaced(step.id)) return
  playTap()
  selectedCardId.value = selectedCardId.value === step.id ? null : step.id
}

function placeInPocket(slotOrder: number, draggedId?: string): void {
  if (pocketAssignments[slotOrder] !== null) return
  const cardId = draggedId || selectedCardId.value
  if (!cardId) {
    playGentleHint()
    emit('feedback', { kind: 'info', text: 'Primero toca una tarjeta de rutina arriba y luego el bolsillo del número correcto.' })
    return
  }

  const card = ROUTINE_POOL.find((c) => c.id === cardId)
  if (!card) return

  if (card.order === slotOrder) {
    pocketAssignments[slotOrder] = card
    selectedCardId.value = null
    playLullabyNote(slotOrder - 1)
    emit('feedback', { kind: 'success', text: `¡Orden perfecto! Paso ${slotOrder}: ${card.label}.` })
    if (act1Done.value) {
      emit('celebrateAct')
      emit('guide', {
        mood: 'sleepy',
        message: '¡Qué buena rutina nocturna! Ahora apaguemos los ruidos y pantallas roba-sueños de la aldea.',
      })
    }
  } else {
    playGentleHint()
    emit('feedback', {
      kind: 'hint',
      text: `"${card.label}" va en otro momento de la noche. Piensa qué haces primero y qué haces al final.`,
    })
  }
}

function goAct2(): void {
  playTap()
  emit('requestNextAct', 2)
}

// ---------------- ACT 2: Turn Off Sleep-Stealers ----------------
interface SleepStealer {
  id: string
  label: string
  left: string
  top: string
  calmText: string
}

const SLEEP_STEALERS: readonly SleepStealer[] = [
  { id: 'tablet', label: 'Tablet brillante', left: '22%', top: '34%', calmText: 'Pantalla guardada lejos de la cama para cuidar los ojos y el sueño.' },
  { id: 'drum', label: 'Tambor ruidoso', left: '72%', top: '32%', calmText: 'Silencio suave para que el oído también descanse.' },
  { id: 'lamp', label: 'Foco muy fuerte', left: '48%', top: '26%', calmText: 'Luz tenue de luciérnagas lista para dormir en paz.' },
  { id: 'tv', label: 'Televisor encendido', left: '30%', top: '68%', calmText: 'Televisor apagado: ahora el cuarto respira calma.' },
  { id: 'rush', label: 'Nube de prisa', left: '70%', top: '66%', calmText: 'Adiós preocupaciones, mañana habrá otro día bonito para jugar.' },
]

const calmedIds = reactive<string[]>([])
const act2Done = computed(() => calmedIds.length === SLEEP_STEALERS.length)

function calmStealer(item: SleepStealer, idx: number): void {
  if (calmedIds.includes(item.id)) return
  calmedIds.push(item.id)
  playLullabyNote(idx)
  emit('feedback', { kind: 'success', text: item.calmText })
  if (act2Done.value) {
    emit('celebrateAct')
    emit('guide', {
      mood: 'sleepy',
      message: '¡Qué paz se siente con las luciérnagas! Vamos al último paso: respirar con la nube mágica.',
    })
  }
}

function goAct3(): void {
  playTap()
  emit('requestNextAct', 3)
}

// ---------------- ACT 3: Twilight Sleep Quiz -> Magic Cloud Breathing ----------------
interface SleepQuestion {
  id: string
  prompt: string
  options: readonly { id: string; text: string; ok: boolean; reply: string }[]
}

const SLEEP_QUESTIONS: readonly SleepQuestion[] = [
  {
    id: 'sq1',
    prompt: '¿Por qué es tan importante dormir bien y descansar toda la noche?',
    options: [
      {
        id: 'sq1-a',
        text: 'Porque mientras dormimos nuestro cuerpo crece, repara fuerzas y recarga alegría.',
        ok: true,
        reply: '¡Exacto! Dormir bien es un derecho que cuida nuestro cerebro, corazón y ganas de jugar.',
      },
      {
        id: 'sq1-b',
        text: 'Porque dormir no sirve de nada y es mejor quedarse despierto.',
        ok: false,
        reply: 'Sin descanso nocturno amanecemos cansados y sin ánimo para aprender ni jugar.',
      },
    ],
  },
  {
    id: 'sq2',
    prompt: 'Ya es hora de dormir, pero la luz de la tablet nos quita el sueño. ¿Qué protege nuestro descanso?',
    options: [
      {
        id: 'sq2-a',
        text: 'Guardar la tablet lejos de la cama, leer un cuento corto y respirar tranquilo.',
        ok: true,
        reply: '¡Muy bien! Apagar pantallas antes de dormir invita a los sueños felices.',
      },
      {
        id: 'sq2-b',
        text: 'Ver videos debajo de la cobija hasta medianoche.',
        ok: false,
        reply: 'La luz brillante engaña al cerebro y roba el sueño que tu cuerpo merece.',
      },
    ],
  },
]

const sleepQuizIdx = shallowRef(0)
const sleepQuizSolvedCurrent = shallowRef(false)
const sleepQuizDone = shallowRef(false)

function chooseSleepOption(opt: SleepQuestion['options'][number]): void {
  if (sleepQuizSolvedCurrent.value) return
  if (opt.ok) {
    sleepQuizSolvedCurrent.value = true
    playLullabyNote(sleepQuizIdx.value + 1)
    emit('feedback', { kind: 'success', text: opt.reply })
    emit('guide', { mood: 'sleepy', message: opt.reply })
  } else {
    playGentleHint()
    emit('feedback', { kind: 'hint', text: opt.reply })
    emit('guide', { mood: 'thinking', message: opt.reply })
  }
}

function advanceSleepQuiz(): void {
  playTap()
  if (sleepQuizIdx.value < SLEEP_QUESTIONS.length - 1) {
    sleepQuizIdx.value += 1
    sleepQuizSolvedCurrent.value = false
    emit('guide', { mood: 'sleepy', message: SLEEP_QUESTIONS[sleepQuizIdx.value].prompt })
  } else {
    sleepQuizDone.value = true
    emit('guide', {
      mood: 'sleepy',
      message: '¡Ahora sí! Mantén presionada la nube mágica mientras crece para inhalar suave, y suéltala para exhalar.',
    })
  }
}

const breathsCompleted = shallowRef(0)
const breathGoal = 3
const isInhaling = shallowRef(false)
const cloudScale = shallowRef(1)
const inhaleProgress = shallowRef(0) // 0..100

let breathTimer: number | null = null

function startInhale(): void {
  if (breathsCompleted.value >= breathGoal || isInhaling.value) return
  isInhaling.value = true
  playLullabyNote(breathsCompleted.value)

  if (breathTimer !== null) window.clearInterval(breathTimer)
  breathTimer = window.setInterval(() => {
    inhaleProgress.value = Math.min(100, inhaleProgress.value + 5)
    cloudScale.value = 1 + (inhaleProgress.value / 100) * 0.38
    if (inhaleProgress.value >= 100) {
      finishOneBreath()
    }
  }, 90)
}

function releaseInhale(): void {
  if (!isInhaling.value) return
  if (breathTimer !== null) {
    window.clearInterval(breathTimer)
    breathTimer = null
  }
  isInhaling.value = false
  if (inhaleProgress.value >= 55) {
    finishOneBreath()
  } else {
    inhaleProgress.value = 0
    cloudScale.value = 1
    emit('feedback', { kind: 'info', text: 'Mantén presionada la nube un poquito más hasta que se llene de aire.' })
  }
}

function finishOneBreath(): void {
  if (breathTimer !== null) {
    window.clearInterval(breathTimer)
    breathTimer = null
  }
  isInhaling.value = false
  inhaleProgress.value = 0
  cloudScale.value = 1
  breathsCompleted.value += 1
  playLullabyNote(breathsCompleted.value + 2)

  if (breathsCompleted.value >= breathGoal) {
    playSuccess()
    emit('celebrateAct')
    emit('feedback', {
      kind: 'success',
      text: '¡Tres respiraciones profundas completadas! El Reloj de Sol y Luna volvió a brillar en armonía.',
    })
    emit('guide', {
      mood: 'celebrate',
      message: '¡Qué descanso tan bonito! Ya reparaste todo el reloj. Toca "¡Completar Capítulo 5!" para tu gran diploma.',
    })
  } else {
    emit('feedback', {
      kind: 'success',
      text: `Exhala despacito... ¡Llevas ${breathsCompleted.value} de ${breathGoal} respiraciones!`,
    })
  }
}

watch(
  () => act,
  (current) => {
    if (current === 1) {
      emit('guide', {
        mood: 'sleepy',
        message: 'Acto 1: Ordena del 1 al 4 los pasos de nuestra rutina tranquila para descansar bien.',
      })
    } else if (current === 2) {
      emit('guide', {
        mood: 'sleepy',
        message: 'Acto 2: Toca los 5 roba-sueños para apagarlos con suavidad y liberar luciérnagas tranquilas.',
      })
    } else {
      emit('guide', {
        mood: 'sleepy',
        message: 'Acto 3: Responde estas dos preguntas sobre el buen dormir antes de respirar con la nube mágica.',
      })
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (breathTimer !== null) window.clearInterval(breathTimer)
})
</script>

<template>
  <div class="level-5">
    <!-- ACT 1 -->
    <div v-if="act === 1" class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 1: Ordena la rutina de la noche</h2>
        <span class="progress-chip">{{ placedCount }} / 4 pasos</span>
      </div>

      <div class="routine-cards-row">
        <button
          v-for="step in ROUTINE_POOL"
          :key="step.id"
          type="button"
          class="night-card"
          :class="{
            'is-selected': selectedCardId === step.id,
            'is-placed': isCardPlaced(step.id),
          }"
          :draggable="!isCardPlaced(step.id)"
          @dragstart="$event.dataTransfer?.setData('text/plain', step.id)"
          @click="selectRoutineCard(step)"
        >
          {{ step.label }}
        </button>
      </div>

      <div class="pockets-grid">
        <button
          v-for="slotNum in [1, 2, 3, 4]"
          :key="slotNum"
          type="button"
          class="pocket-slot"
          :class="{ 'is-filled': pocketAssignments[slotNum] !== null }"
          @dragover.prevent
          @drop="placeInPocket(slotNum, $event.dataTransfer?.getData('text/plain'))"
          @click="placeInPocket(slotNum)"
        >
          <span class="pocket-num">{{ slotNum }}</span>
          <strong class="pocket-label">
            {{ pocketAssignments[slotNum] ? pocketAssignments[slotNum]!.label : `Paso ${slotNum}` }}
          </strong>
        </button>
      </div>

      <div v-if="act1Done" class="act-footer">
        <button type="button" class="paper-btn paper-btn-primary anim-pop-in" @click="goAct2">
          Entrar a la aldea nocturna
        </button>
      </div>
    </div>

    <!-- ACT 2 -->
    <div v-else-if="act === 2" class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 2: Transforma los roba-sueños en luciérnagas</h2>
        <span class="progress-chip">{{ calmedIds.length }} / {{ SLEEP_STEALERS.length }} en calma</span>
      </div>

      <div class="night-scene">
        <img :src="assetUrl('/art/bg-level5-village.png')" alt="Aldea nocturna de luciérnagas" class="night-bg" />

        <button
          v-for="(item, idx) in SLEEP_STEALERS"
          :key="item.id"
          type="button"
          class="stealer-btn"
          :class="{ 'is-calmed': calmedIds.includes(item.id) }"
          :style="{ left: item.left, top: item.top }"
          @click="calmStealer(item, idx)"
        >
          <template v-if="calmedIds.includes(item.id)">
            <span class="firefly-orb" aria-hidden="true" />
            <strong>Luciérnaga en paz</strong>
          </template>
          <template v-else>
            <span class="noise-dot" aria-hidden="true" />
            <strong>{{ item.label }}</strong>
          </template>
        </button>
      </div>

      <div v-if="act2Done" class="act-footer">
        <button type="button" class="paper-btn paper-btn-primary anim-pop-in" @click="goAct3">
          Subir a la nube mágica
        </button>
      </div>
    </div>

    <!-- ACT 3 -->
    <div v-else class="act-block">
      <template v-if="!sleepQuizDone">
        <div class="act-head">
          <h2 class="act-title">Acto 3: Secretos del descanso feliz</h2>
          <span class="progress-chip">Pregunta {{ sleepQuizIdx + 1 }} de {{ SLEEP_QUESTIONS.length }}</span>
        </div>

        <div class="sleep-quiz-card">
          <p class="sleep-quiz-prompt">{{ SLEEP_QUESTIONS[sleepQuizIdx].prompt }}</p>
          <div class="sleep-quiz-options">
            <button
              v-for="opt in SLEEP_QUESTIONS[sleepQuizIdx].options"
              :key="opt.id"
              type="button"
              class="sleep-opt-btn"
              :class="{ 'is-ok': sleepQuizSolvedCurrent && opt.ok }"
              @click="chooseSleepOption(opt)"
            >
              {{ opt.text }}
            </button>
          </div>
        </div>

        <div v-if="sleepQuizSolvedCurrent" class="act-footer">
          <button type="button" class="paper-btn paper-btn-primary anim-pop-in" @click="advanceSleepQuiz">
            {{ sleepQuizIdx < SLEEP_QUESTIONS.length - 1 ? 'Siguiente pregunta' : 'Ir a la Nube Mágica' }}
          </button>
        </div>
      </template>

      <template v-else>
        <div class="act-head">
          <h2 class="act-title">Acto 3: Respiración de la Nube Mágica</h2>
          <span class="progress-chip">{{ breathsCompleted }} / {{ breathGoal }} respiraciones</span>
        </div>

      <div class="cloud-breath-stage">
        <p class="breath-cue">
          {{
            breathsCompleted >= breathGoal
              ? '¡Tu mente y cuerpo están en paz!'
              : isInhaling
                ? 'Inhala suave por la nariz... la nube crece'
                : 'Mantén presionada la nube (o pulsa el botón) para respirar'
          }}
        </p>

        <button
          type="button"
          class="magic-cloud-btn"
          :disabled="breathsCompleted >= breathGoal"
          :style="{ transform: `scale(${cloudScale})` }"
          @pointerdown.prevent="startInhale"
          @pointerup="releaseInhale"
          @pointerleave="releaseInhale"
          @keydown.space.prevent="startInhale"
          @keyup.space="releaseInhale"
        >
          <svg width="160" height="106" viewBox="0 0 180 120" aria-hidden="true">
            <path
              d="M34 94 H144 C159 94 170 83 170 68 C170 54 159 43 145 42 C139 21 120 8 98 8 C80 8 64 18 57 32 C49 27 40 25 30 28 C16 32 8 46 10 61 C12 80 21 94 34 94 Z"
              fill="#ECE9FC"
              stroke="#6C63B5"
              stroke-width="4"
            />
            <circle cx="74" cy="56" r="3.5" fill="#231F3A" />
            <circle cx="106" cy="56" r="3.5" fill="#231F3A" />
            <path d="M80 68 Q90 75 100 68" stroke="#231F3A" stroke-width="3" fill="none" stroke-linecap="round" />
          </svg>
        </button>

        <div class="breath-meter" aria-hidden="true">
          <div class="breath-meter-fill" :style="{ width: `${inhaleProgress}%` }" />
        </div>

        <button
          v-if="breathsCompleted < breathGoal"
          type="button"
          class="paper-btn paper-btn-secondary quick-breath-btn"
          @click="finishOneBreath"
        >
          Completar respiración con un toque
        </button>
      </div>

      <div v-if="breathsCompleted >= breathGoal" class="act-footer">
        <button
          type="button"
          class="paper-btn paper-btn-primary anim-pop-in"
          @click="emit('completeLevel', 3)"
        >
          ¡Completar Capítulo 5!
        </button>
      </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.level-5,
.act-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.act-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.act-title {
  font-size: clamp(1.22rem, 2.2vw, 1.52rem);
}

.progress-chip {
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background-color: var(--theme-accent-soft);
  border: 2px solid var(--theme-border);
  font-family: var(--font-display);
  font-weight: 700;
}

.routine-cards-row,
.pockets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.7rem;
}

.night-card {
  min-height: 76px;
  padding: 0.8rem 0.95rem;
  border-radius: 18px;
  background-color: #FFFDF7;
  border: 2.5px solid var(--theme-border);
  font-weight: 700;
  font-size: 0.98rem;
  box-shadow: var(--shadow-paper-sm);
}

.night-card.is-selected {
  background-color: #ECE9FC;
  border-color: #6A61B8;
  transform: translateY(-2px);
}

.night-card.is-placed {
  opacity: 0.45;
  background-color: #E2F5E9;
  border-color: #38945D;
}

.pocket-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.4rem;
  min-height: 112px;
  padding: 0.85rem;
  border-radius: 20px;
  background-color: #F2EFFA;
  border: 3px dashed #6A61B8;
}

.pocket-slot.is-filled {
  background-color: #E2F5E9;
  border-style: solid;
  border-color: #38945D;
}

.pocket-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background-color: #6A61B8;
  color: #FFFFFF;
  font-family: var(--font-display);
  font-weight: 700;
}

.pocket-label {
  font-size: 0.95rem;
}

/* Act 2 */
.night-scene {
  position: relative;
  width: 100%;
  min-height: 320px;
  aspect-ratio: 16 / 9;
  max-height: 400px;
  border-radius: 22px;
  overflow: hidden;
  border: 3px solid var(--theme-border);
}

.night-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stealer-btn {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.55rem 0.85rem;
  border-radius: 18px;
  background-color: rgba(255, 253, 247, 0.94);
  border: 2.5px solid #E3644B;
  box-shadow: var(--shadow-paper-sm);
  font-size: 0.86rem;
  color: #231F3A;
}

.stealer-btn.is-calmed {
  background-color: rgba(35, 31, 58, 0.84);
  border-color: #F5B82E;
  color: #FFFDF7;
}

.noise-dot {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background-color: #E3644B;
}

.firefly-orb {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background-color: #FFD15C;
  box-shadow: 0 0 14px #FFD15C;
  animation: fireflyGlow 2.4s ease-in-out infinite;
}

/* Act 3 */
.cloud-breath-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 1.5rem 1rem;
  border-radius: 22px;
  background: linear-gradient(180deg, #ECE9FC 0%, #FFFDF7 100%);
  border: 2px solid var(--theme-border);
}

.breath-cue {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  color: #231F3A;
}

.magic-cloud-btn {
  padding: 0.5rem;
  border-radius: 999px;
  transition: transform 120ms linear;
  user-select: none;
  touch-action: none;
}

.breath-meter {
  width: 100%;
  max-width: 280px;
  height: 14px;
  border-radius: 999px;
  background-color: #DFD8F6;
  overflow: hidden;
}

.breath-meter-fill {
  height: 100%;
  background-color: #6A61B8;
  transition: width 90ms linear;
}

.quick-breath-btn {
  min-height: 44px;
  font-size: 0.94rem;
}

.sleep-quiz-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.25rem;
  border-radius: 22px;
  background-color: #F2EFFA;
  border: 2px solid var(--theme-border);
}

.sleep-quiz-prompt {
  font-size: 1.12rem;
  font-weight: 700;
  color: #231F3A;
}

.sleep-quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.sleep-opt-btn {
  text-align: left;
  min-height: 58px;
  padding: 0.85rem 1.05rem;
  border-radius: 18px;
  background-color: #FFFDF7;
  border: 2.5px solid var(--theme-border);
  font-size: 1rem;
  font-weight: 700;
  color: #231F3A;
}

.sleep-opt-btn.is-ok {
  background-color: #E2F5E9;
  border-color: #38945D;
  color: #1B5432;
}

.act-footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 680px) {
  .night-scene {
    height: auto;
    min-height: 0;
    aspect-ratio: auto;
    max-height: none;
    padding: 0.75rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
  }

  .night-scene .night-bg {
    position: absolute;
    inset: 0;
    opacity: 0.78;
  }

  .stealer-btn {
    position: relative;
    left: auto !important;
    top: auto !important;
    transform: none !important;
    width: 100%;
    min-height: 76px;
  }
}
</style>
