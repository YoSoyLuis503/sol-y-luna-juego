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

const { playTap, playSuccess, playGentleHint, playStar } = useSoundEffects()

// ---------------- ACT 1: Safe Park Inspector ----------------
interface TrailSpot {
  id: string
  label: string
  isHazard: boolean
  left: string
  top: string
  fixMessage: string
}

const TRAIL_SPOTS: readonly TrailSpot[] = [
  {
    id: 'broken-swing',
    label: 'Columpio con cadena suelta',
    isHazard: true,
    left: '20%',
    top: '36%',
    fixMessage: '¡Reparado! Nunca debemos usar juegos rotos sin pedir ayuda a un adulto.',
  },
  {
    id: 'glass',
    label: 'Vidrios en el pasto',
    isHazard: true,
    left: '44%',
    top: '68%',
    fixMessage: '¡Limpio y seguro! Un parque limpio protege nuestros pies y manos al jugar.',
  },
  {
    id: 'street-ball',
    label: 'Pelota cerca de la calle',
    isHazard: true,
    left: '78%',
    top: '60%',
    fixMessage: '¡A salvo! Si una pelota cruza hacia la calle, siempre pedimos ayuda a un adulto.',
  },
  {
    id: 'puddle',
    label: 'Charco muy resbaloso',
    isHazard: true,
    left: '58%',
    top: '32%',
    fixMessage: '¡Señalizado! Mirar por dónde corremos evita caídas.',
  },
  {
    id: 'bench',
    label: 'Banca bajo la sombra',
    isHazard: false,
    left: '18%',
    top: '72%',
    fixMessage: 'Esta banca con sombra es genial para descansar cuando hace sol.',
  },
  {
    id: 'water',
    label: 'Bebedero de agua fresca',
    isHazard: false,
    left: '82%',
    top: '30%',
    fixMessage: '¡Un punto seguro! Tomar agua mientras jugamos nos mantiene fuertes.',
  },
]

const fixedHazardIds = reactive<string[]>([])
const totalHazards = 4
const act1Done = computed(() => fixedHazardIds.length >= totalHazards)

function inspectSpot(spot: TrailSpot): void {
  if (!spot.isHazard) {
    playTap()
    emit('feedback', { kind: 'info', text: spot.fixMessage })
    emit('guide', { mood: 'happy', message: spot.fixMessage })
    return
  }
  if (fixedHazardIds.includes(spot.id)) return
  fixedHazardIds.push(spot.id)
  playSuccess()
  emit('feedback', { kind: 'success', text: spot.fixMessage })
  if (fixedHazardIds.length >= totalHazards) {
    emit('celebrateAct')
    emit('guide', {
      mood: 'celebrate',
      message: '¡Todo el sendero quedó seguro! Ahora vamos a jugar... ¡pero escucha cuando Bombo necesite descansar!',
    })
  }
}

function goAct2(): void {
  playTap()
  emit('requestNextAct', 2)
}

// ---------------- ACT 2: Play & Pause Minigame ----------------
const starsCollected = shallowRef(0)
const starTarget = 8
const tiredness = shallowRef(0) // 0..100; reaches 100 at 3 and 6 stars until rested
const pausesTaken = shallowRef(0)
const bomboHopping = shallowRef(false)
const needsRest = computed(() => tiredness.value >= 100)
const act2Done = computed(() => starsCollected.value >= starTarget && pausesTaken.value >= 2)

const activeStarPos = reactive({ x: 52, y: 38 })
let hopTimeout: number | undefined

function collectFloatingStar(): void {
  if (act2Done.value) return
  if (needsRest.value) {
    playGentleHint()
    emit('feedback', {
      kind: 'hint',
      text: 'Bombo está acalorado y con sed. ¡Toca la Estación de Pausa (Agua y Sombra) para cuidarlo!',
    })
    emit('guide', {
      mood: 'thinking',
      message: '¡Uf, qué calor! Necesito agua, fruta y sombra antes de seguir brincando.',
    })
    return
  }

  starsCollected.value += 1
  playStar()
  bomboHopping.value = true
  if (hopTimeout !== undefined) window.clearTimeout(hopTimeout)
  hopTimeout = window.setTimeout(() => {
    bomboHopping.value = false
  }, 260)

  // Move next star to a lively new spot
  const spots = [
    { x: 24, y: 32 },
    { x: 74, y: 30 },
    { x: 38, y: 54 },
    { x: 66, y: 52 },
    { x: 50, y: 26 },
  ]
  const next = spots[starsCollected.value % spots.length]
  activeStarPos.x = next.x
  activeStarPos.y = next.y

  // Trigger two natural rest moments (at 3 stars and 6 stars)
  if ((starsCollected.value === 3 && pausesTaken.value === 0) || (starsCollected.value === 6 && pausesTaken.value === 1)) {
    tiredness.value = 100
    emit('feedback', {
      kind: 'hint',
      text: '¡Hora de escuchar al cuerpo! Bombo empezó a bostezar; dale agua y sombra en la Estación de Pausa.',
    })
    emit('guide', {
      mood: 'thinking',
      message: '¡Uf! Jugué mucho y me dio sed. ¿Me das una pausa con agua y sombra?',
    })
  } else {
    tiredness.value = Math.min(90, tiredness.value + 34)
  }

  if (act2Done.value) {
    playSuccess()
    emit('celebrateAct')
    emit('guide', {
      mood: 'celebrate',
      message: '¡Lo lograste! Jugaste con energía y respetaste cada pausa. Vamos al Acto 3.',
    })
  }
}

function takeHealthyPause(): void {
  if (act2Done.value) return
  if (!needsRest.value && tiredness.value < 30) {
    playTap()
    emit('feedback', { kind: 'info', text: 'Bombo todavía tiene energía fresquita. ¡Sigue atrapando estrellas!' })
    return
  }
  tiredness.value = 0
  pausesTaken.value += 1
  playSuccess()
  emit('feedback', {
    kind: 'success',
    text: '¡Qué rico descanso! Agua fresca, fruta y sombra devolvieron la energía a Bombo.',
  })
  emit('guide', {
    mood: 'happy',
    message:
      starsCollected.value < starTarget
        ? '¡Mmm, qué refrescante! Ahora sí puedo seguir jugando feliz.'
        : '¡Excelente pausa! Completamos todo el recorrido con energía sana.',
  })
  if (act2Done.value) {
    emit('celebrateAct')
  }
}

function goAct3(): void {
  playTap()
  emit('requestNextAct', 3)
}

// ---------------- ACT 3: Body Signals Match (5 signals) ----------------
interface BodySignal {
  id: string
  signal: string
  careId: string
}

const SIGNALS: readonly BodySignal[] = [
  { id: 'thirst', signal: 'Tengo la boca seca y mucha sed', careId: 'drink' },
  { id: 'legs', signal: 'Mis piernas pesan y bostezo', careId: 'shade' },
  { id: 'scrape', signal: 'Me caí y me raspé la rodilla', careId: 'adult' },
  { id: 'sun', signal: 'El sol está muy fuerte en mi cabeza', careId: 'hat' },
  { id: 'scared', signal: 'Un juego es muy alto y me da miedo', careId: 'safe-choice' },
]

const CARES: readonly { id: string; label: string }[] = [
  { id: 'drink', label: 'Tomar agua fresca' },
  { id: 'shade', label: 'Descansar un rato en la sombra' },
  { id: 'adult', label: 'Avisar a mamá, papá o docente' },
  { id: 'hat', label: 'Ponerse gorra y buscar sombra' },
  { id: 'safe-choice', label: 'Decir no gracias y elegir un juego seguro' },
]

const selectedSignalId = shallowRef<string | null>(null)
const matchedSignalIds = reactive<string[]>([])
const act3Done = computed(() => matchedSignalIds.length === SIGNALS.length)

function selectSignal(id: string): void {
  if (matchedSignalIds.includes(id)) return
  playTap()
  selectedSignalId.value = selectedSignalId.value === id ? null : id
}

function matchCare(careId: string): void {
  if (!selectedSignalId.value) {
    playGentleHint()
    emit('feedback', { kind: 'info', text: 'Primero toca una señal del cuerpo de la izquierda.' })
    return
  }
  const sig = SIGNALS.find((s) => s.id === selectedSignalId.value)!
  if (sig.careId === careId) {
    matchedSignalIds.push(sig.id)
    selectedSignalId.value = null
    playSuccess()
    emit('feedback', { kind: 'success', text: `¡Muy bien! "${sig.signal}" se cuida así.` })
    if (act3Done.value) {
      emit('celebrateAct')
      emit('guide', {
        mood: 'celebrate',
        message: '¡Sabes cuidar tu cuerpo mientras juegas! Ya puedes reclamar tu insignia Corazón Sabio.',
      })
    }
  } else {
    playGentleHint()
    emit('feedback', { kind: 'hint', text: 'Mmm, piensa qué ayuda mejor a esa sensación del cuerpo.' })
  }
}

watch(
  () => act,
  (current) => {
    if (current === 1) {
      emit('guide', {
        mood: 'happy',
        message: 'Acto 1: Toca los 4 peligros escondidos en el sendero para repararlos y hacer seguro el juego.',
      })
    } else if (current === 2) {
      emit('guide', {
        mood: 'happy',
        message: 'Acto 2: ¡Toca las estrellas para que Bombo brinque y juegue! Cuando Bombo sienta sed o calor, toca la Estación de Pausa.',
      })
    } else {
      emit('guide', {
        mood: 'happy',
        message: 'Acto 3: Une cada señal de tu cuerpo con el cuidado que necesita mientras juegas.',
      })
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (hopTimeout !== undefined) window.clearTimeout(hopTimeout)
})
</script>

<template>
  <div class="level-4">
    <!-- ACT 1 -->
    <div v-if="act === 1" class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 1: Inspector del Sendero Seguro</h2>
        <span class="progress-chip">{{ fixedHazardIds.length }} / {{ totalHazards }} reparados</span>
      </div>

      <div class="trail-scene">
        <img :src="assetUrl('/art/bg-level4-trail.png')" alt="Sendero del parque al atardecer" class="trail-bg" />

        <button
          v-for="spot in TRAIL_SPOTS"
          :key="spot.id"
          type="button"
          class="trail-spot"
          :class="{
            'is-hazard': spot.isHazard && !fixedHazardIds.includes(spot.id),
            'is-fixed': spot.isHazard && fixedHazardIds.includes(spot.id),
            'is-safe': !spot.isHazard,
          }"
          :style="{ left: spot.left, top: spot.top }"
          @click="inspectSpot(spot)"
        >
          <span class="spot-status">{{
            !spot.isHazard
              ? 'Seguro'
              : fixedHazardIds.includes(spot.id)
                ? '¡Reparado!'
                : 'Revisar'
          }}</span>
          <strong class="spot-name">{{ spot.label }}</strong>
        </button>
      </div>

      <div v-if="act1Done" class="act-footer">
        <button type="button" class="paper-btn paper-btn-primary anim-pop-in" @click="goAct2">
          Correr al campo de estrellas
        </button>
      </div>
    </div>

    <!-- ACT 2 -->
    <div v-else-if="act === 2" class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 2: Juega y escucha a tu cuerpo</h2>
        <span class="progress-chip">Estrellas: {{ starsCollected }}/{{ starTarget }} · Pausas: {{ pausesTaken }}/2</span>
      </div>

      <div class="energy-bar-wrap">
        <span class="energy-label">Cansancio y sed:</span>
        <div class="energy-track">
          <div
            class="energy-fill"
            :class="{ 'is-tired': needsRest }"
            :style="{ width: `${tiredness}%` }"
          />
        </div>
      </div>

      <div class="play-field">
        <img :src="assetUrl('/art/bg-level4-trail.png')" alt="Sendero para jugar y descansar" class="trail-bg" />

        <button
          v-if="!act2Done"
          type="button"
          class="floating-star-btn"
          :style="{ left: `${activeStarPos.x}%`, top: `${activeStarPos.y}%` }"
          aria-label="Atrapar estrella jugando"
          @click="collectFloatingStar"
        >
          <svg width="56" height="56" viewBox="0 0 48 48" aria-hidden="true">
            <polygon
              points="24 4 29.8 16.2 43.2 18.1 33.4 27.5 35.8 40.9 24 34.4 12.2 40.9 14.6 27.5 4.8 18.1 18.2 16.2"
              fill="#F5B82E"
              stroke="#C97A0C"
              stroke-width="2.5"
            />
          </svg>
          <span class="star-cta">¡Atrapar!</span>
        </button>

        <div class="bombo-runner" :class="{ 'is-hopping': bomboHopping }">
          <img
            :src="assetUrl(needsRest ? '/art/bombo-thinking.png' : '/art/bombo-happy.png')"
            alt="Bombo en el sendero"
            width="86"
            height="86"
          />
        </div>

        <button
          type="button"
          class="rest-station-btn"
          :class="{ 'is-urgent': needsRest }"
          @click="takeHealthyPause"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#DFF6F8" stroke="#186C78" stroke-width="2.2" aria-hidden="true">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <div>
            <strong>Estación de Pausa</strong>
            <small>Agua fresca, fruta y sombra</small>
          </div>
        </button>
      </div>

      <div v-if="act2Done" class="act-footer">
        <button type="button" class="paper-btn paper-btn-primary anim-pop-in" @click="goAct3">
          Ir al mirador del cuerpo
        </button>
      </div>
    </div>

    <!-- ACT 3 -->
    <div v-else class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 3: ¿Qué pide tu cuerpo?</h2>
        <span class="progress-chip">{{ matchedSignalIds.length }} / {{ SIGNALS.length }} parejas</span>
      </div>

      <div class="signals-grid">
        <div class="signals-col">
          <button
            v-for="sig in SIGNALS"
            :key="sig.id"
            type="button"
            class="signal-card"
            :class="{
              'is-selected': selectedSignalId === sig.id,
              'is-matched': matchedSignalIds.includes(sig.id),
            }"
            @click="selectSignal(sig.id)"
          >
            {{ sig.signal }}
          </button>
        </div>

        <div class="signals-col">
          <button
            v-for="care in CARES"
            :key="care.id"
            type="button"
            class="care-card"
            @click="matchCare(care.id)"
          >
            {{ care.label }}
          </button>
        </div>
      </div>

      <div v-if="act3Done" class="act-footer">
        <button
          type="button"
          class="paper-btn paper-btn-primary anim-pop-in"
          @click="emit('completeLevel', 3)"
        >
          ¡Completar Capítulo 4!
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.level-4,
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

.trail-scene,
.play-field {
  position: relative;
  width: 100%;
  min-height: 320px;
  aspect-ratio: 16 / 9;
  max-height: 400px;
  border-radius: 22px;
  overflow: hidden;
  border: 3px solid var(--theme-border);
}

.trail-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trail-spot {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  max-width: 165px;
  padding: 0.5rem 0.75rem;
  border-radius: 18px;
  background-color: rgba(255, 253, 247, 0.94);
  border: 2.5px solid #D9C9AD;
  box-shadow: var(--shadow-paper-sm);
  text-align: center;
  transition: transform 160ms var(--ease-out), border-color 160ms ease, background-color 160ms ease;
}

.trail-spot.is-hazard {
  border-color: #E3644B;
  background-color: #FFF0EC;
}

.trail-spot.is-fixed {
  border-color: #38945D;
  background-color: #E2F5E9;
}

.spot-status {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background-color: rgba(43, 36, 51, 0.08);
}

.spot-name {
  font-size: 0.88rem;
  line-height: 1.25;
}

/* Act 2 */
.energy-bar-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.energy-label {
  font-family: var(--font-display);
  font-weight: 700;
  white-space: nowrap;
}

.energy-track {
  flex: 1;
  height: 18px;
  border-radius: 999px;
  background-color: #EFE5D3;
  border: 2px solid var(--theme-border);
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background-color: #F29F24;
  transition: width 240ms var(--ease-out), background-color 200ms ease;
}

.energy-fill.is-tired {
  background-color: #E3644B;
}

.floating-star-btn {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.45rem;
  border-radius: 20px;
  background-color: rgba(255, 253, 247, 0.9);
  border: 2.5px solid #E58717;
  box-shadow: var(--shadow-paper-md);
  animation: gentleFloat 2.4s ease-in-out infinite;
}

.star-cta {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.82rem;
}

.bombo-runner {
  position: absolute;
  left: 16px;
  bottom: 14px;
  width: 88px;
  height: 88px;
  padding: 4px;
  border-radius: 22px;
  background-color: #FFFDF7;
  border: 3px solid var(--theme-border);
  box-shadow: var(--shadow-sticker);
  transition: transform 200ms var(--ease-spring);
}

.bombo-runner.is-hopping {
  transform: translateY(-22px) scale(1.06);
}

.rest-station-btn {
  position: absolute;
  right: 16px;
  bottom: 14px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-align: left;
  min-height: 68px;
  padding: 0.65rem 1rem;
  border-radius: 20px;
  background-color: #FFFDF7;
  border: 3px solid #2493A2;
  box-shadow: var(--shadow-paper-md);
}

.rest-station-btn.is-urgent {
  background-color: #DFF6F8;
  animation: softPulse 1.3s ease-in-out infinite;
}

.rest-station-btn strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1rem;
}

.rest-station-btn small {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-secondary);
}

/* Act 3 */
.signals-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}

.signals-col {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.signal-card,
.care-card {
  text-align: left;
  min-height: 68px;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  background-color: #FFFDF7;
  border: 2.5px solid var(--theme-border);
  font-size: 1rem;
  font-weight: 700;
  box-shadow: var(--shadow-paper-sm);
}

.signal-card.is-selected {
  background-color: var(--theme-accent-soft);
  border-color: var(--theme-accent);
}

.signal-card.is-matched {
  background-color: #E2F5E9;
  border-color: #38945D;
  opacity: 0.72;
}

.act-footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .signals-grid {
    grid-template-columns: 1fr;
  }

  .trail-scene {
    height: auto;
    min-height: 0;
    aspect-ratio: auto;
    max-height: none;
    padding: 0.75rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
  }

  .trail-scene .trail-bg {
    position: absolute;
    inset: 0;
    opacity: 0.65;
  }

  .trail-spot {
    position: relative;
    left: auto !important;
    top: auto !important;
    transform: none !important;
    max-width: none;
    width: 100%;
    min-height: 82px;
    padding: 0.5rem 0.6rem;
  }
}
</style>
