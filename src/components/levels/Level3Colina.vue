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

// ---------------- ACT 1: Play Without Stereotypes ----------------
interface ToyChoice {
  id: 'rocket' | 'kitchen' | 'soccer' | 'paint'
  label: string
  color: string
}

interface ChildDesire {
  id: 'sofia' | 'lucas' | 'camila' | 'mateo'
  name: string
  wish: string
  toyId: ToyChoice['id']
}

const TOYS: readonly ToyChoice[] = [
  { id: 'rocket', label: 'Cohete espacial', color: '#E3644B' },
  { id: 'kitchen', label: 'Osito y cocinita', color: '#F29F24' },
  { id: 'soccer', label: 'Balón de fútbol', color: '#38945D' },
  { id: 'paint', label: 'Acuarelas y flores', color: '#6C63B5' },
]

const CHILDREN: readonly ChildDesire[] = [
  { id: 'sofia', name: 'Sofía', wish: '¡Hoy quiero viajar en un cohete espacial!', toyId: 'rocket' },
  { id: 'lucas', name: 'Lucas', wish: '¡Quiero preparar sopa rica para mi osito!', toyId: 'kitchen' },
  { id: 'camila', name: 'Camila', wish: '¡Tengo ganas de patear goles con el balón!', toyId: 'soccer' },
  { id: 'mateo', name: 'Mateo', wish: '¡Quiero pintar flores brillantes con acuarela!', toyId: 'paint' },
]

const selectedToyId = shallowRef<ToyChoice['id'] | null>(null)
const deliveredChildIds = reactive<ChildDesire['id'][]>([])

const act1Done = computed(() => deliveredChildIds.length === CHILDREN.length)

function selectToy(id: ToyChoice['id']): void {
  if (deliveredChildIds.some((cId) => CHILDREN.find((c) => c.id === cId)?.toyId === id)) return
  playTap()
  selectedToyId.value = selectedToyId.value === id ? null : id
}

function deliverToChild(child: ChildDesire, draggedId?: string): void {
  if (deliveredChildIds.includes(child.id)) return
  const activeToy = (draggedId as ToyChoice['id'] | undefined) || selectedToyId.value
  if (!activeToy) {
    playTap()
    emit('guide', { mood: 'happy', message: `${child.name} dice: "${child.wish}"` })
    return
  }

  if (activeToy === child.toyId) {
    deliveredChildIds.push(child.id)
    selectedToyId.value = null
    playSuccess()
    emit('feedback', {
      kind: 'success',
      text: `¡Qué felicidad para ${child.name}! Todos los juguetes son para quien quiera disfrutarlos.`,
    })
    if (deliveredChildIds.length === CHILDREN.length) {
      emit('celebrateAct')
      emit('guide', {
        mood: 'celebrate',
        message: '¡Bravísimo! Jugar con libertad sin etiquetas nos hace felices. Ahora decidamos un juego en equipo.',
      })
    }
  } else {
    playGentleHint()
    emit('feedback', { kind: 'hint', text: `${child.name} pidió otra cosa: "${child.wish}"` })
    emit('guide', { mood: 'thinking', message: `Escucha el deseo de ${child.name} y elige el juguete que eligió.` })
  }
}

function goAct2(): void {
  playTap()
  emit('requestNextAct', 2)
}

// ---------------- ACT 2: Group Voice & Fair Turns (4 scenarios) ----------------
interface GroupStep {
  id: string
  prompt: string
  options: readonly { id: string; text: string; ok: boolean; reply: string }[]
}

const GROUP_STEPS: readonly GroupStep[] = [
  {
    id: 'g1',
    prompt: 'Nico grita: "¡Solo jugamos a las carreras y nadie más opina!". Los demás quieren proponer ideas. ¿Qué haces?',
    options: [
      { id: 'g1a', text: 'Callar a los demás para terminar rápido.', ok: false, reply: 'Si no escuchamos a todos, el juego deja de ser libre y justo.' },
      { id: 'g1b', text: 'Proponer una ronda donde cada amigo diga su idea.', ok: true, reply: '¡Excelente! Todos tenemos derecho a expresar nuestra opinión y ser escuchados.' },
    ],
  },
  {
    id: 'g2',
    prompt: 'La mitad quiere jugar a los piratas y la otra mitad a explorar la selva. ¿Cómo lo resuelven juntos?',
    options: [
      { id: 'g2a', text: '¡Combinamos las ideas o votamos turnos para jugar ambos!', ok: true, reply: '¡Genial! Piratas exploradores de la selva, o un turno cada juego. ¡Qué buena idea!' },
      { id: 'g2b', text: 'Irse enojados y no dejar jugar a nadie.', ok: false, reply: 'Podemos conversar y encontrar un acuerdo donde todos disfruten.' },
    ],
  },
  {
    id: 'g3',
    prompt: 'Una amiga tímida todavía no habló en la votación. ¿Qué es lo más amable?',
    options: [
      { id: 'g3a', text: 'Preguntarle con cariño qué le gustaría jugar hoy.', ok: true, reply: '¡Sí! Dar espacio a las voces tranquilas hace el grupo más fuerte y feliz.' },
      { id: 'g3b', text: 'Ignorarla porque no habló primero.', ok: false, reply: 'Invitar a hablar con respeto ayuda a que nadie quede en silencio.' },
    ],
  },
  {
    id: 'g4',
    prompt: 'A mitad del partido, tu amigo dice: "Ya me cansé de correr, voy a descansar en la sombra un momento". ¿Cómo respondes?',
    options: [
      { id: 'g4a', text: 'Respetar su pausa y dejarlo descansar o animar desde la sombra.', ok: true, reply: '¡Muy bien! Todos tenemos derecho a parar y descansar sin que nadie se burle.' },
      { id: 'g4b', text: 'Obligarlo a seguir corriendo aunque esté agotado.', ok: false, reply: 'Cada niño decide cuándo descansar para cuidar su cuerpo.' },
    ],
  },
]

const groupStepIdx = shallowRef(0)
const groupSolvedCurrent = shallowRef(false)
const jarTokens = shallowRef(0)

function chooseGroupOption(opt: GroupStep['options'][number]): void {
  if (groupSolvedCurrent.value) return
  if (opt.ok) {
    groupSolvedCurrent.value = true
    jarTokens.value += 1
    playStar()
    emit('feedback', { kind: 'success', text: opt.reply })
    emit('guide', { mood: 'celebrate', message: opt.reply })
  } else {
    playGentleHint()
    emit('feedback', { kind: 'hint', text: opt.reply })
    emit('guide', { mood: 'thinking', message: opt.reply })
  }
}

function nextGroupStep(): void {
  playTap()
  if (groupStepIdx.value < GROUP_STEPS.length - 1) {
    groupStepIdx.value += 1
    groupSolvedCurrent.value = false
    emit('guide', { mood: 'happy', message: GROUP_STEPS[groupStepIdx.value].prompt })
  } else {
    emit('celebrateAct')
    emit('requestNextAct', 3)
  }
}

// ---------------- ACT 3: Kite Atelier + Flying Game ----------------
const kiteShape = shallowRef<'diamond' | 'star' | 'hex'>('diamond')
const kitePalette = shallowRef(0)
const kiteTailStyle = shallowRef<'ribbons' | 'stars' | 'zigzag'>('ribbons')
const isFlying = shallowRef(false)

const KITE_PALETTES = [
  { name: 'Sol y Coral', c1: '#F29F24', c2: '#E3644B', c3: '#2493A2' },
  { name: 'Bosque y Cielo', c1: '#38945D', c2: '#2493A2', c3: '#F5B82E' },
  { name: 'Atardecer Mágico', c1: '#6C63B5', c2: '#E3644B', c3: '#FFD15C' },
  { name: 'Brisa Dulce', c1: '#2493A2', c2: '#6C63B5', c3: '#F29F24' },
]

const kiteX = shallowRef(50)
const kiteY = shallowRef(58)
const ribbonsCaught = shallowRef(0)
const ribbonGoal = 5
const skyRef = shallowRef<HTMLElement | null>(null)

interface WindRibbon {
  id: number
  x: number
  y: number
  caught: boolean
}

const windRibbons = reactive<WindRibbon[]>([
  { id: 1, x: 20, y: 28, caught: false },
  { id: 2, x: 78, y: 24, caught: false },
  { id: 3, x: 50, y: 20, caught: false },
  { id: 4, x: 28, y: 66, caught: false },
  { id: 5, x: 74, y: 62, caught: false },
])

let windFrameId: number | null = null
let windTick = 0

function launchKite(): void {
  playSuccess()
  isFlying.value = true
  emit('guide', {
    mood: 'celebrate',
    message: '¡Mueve tu cometa por el cielo tocando la pantalla o usando las flechas para atrapar las 5 cintas de viento!',
  })
  startWindLoop()
  window.addEventListener('keydown', handleKeyMove)
}

function startWindLoop(): void {
  const step = () => {
    windTick += 0.045
    // Gentle breeze sway on ribbons
    windRibbons.forEach((r, i) => {
      if (!r.caught) {
        r.y = Math.max(16, Math.min(78, r.y + Math.sin(windTick + i) * 0.16))
      }
    })
    checkRibbonCollision()
    if (ribbonsCaught.value < ribbonGoal && isFlying.value) {
      windFrameId = window.requestAnimationFrame(step)
    }
  }
  windFrameId = window.requestAnimationFrame(step)
}

function checkRibbonCollision(): void {
  windRibbons.forEach((r) => {
    if (r.caught) return
    const dx = kiteX.value - r.x
    const dy = kiteY.value - r.y
    if (Math.hypot(dx, dy) < 13) {
      r.caught = true
      ribbonsCaught.value += 1
      playStar()
      emit('feedback', {
        kind: 'success',
        text: `¡Atrapaste una cinta de viento! (${ribbonsCaught.value} de ${ribbonGoal})`,
      })
      if (ribbonsCaught.value >= ribbonGoal) {
        stopWindLoop()
        emit('guide', {
          mood: 'celebrate',
          message: '¡Tu cometa voló libre por toda la colina! Toca "¡Completar Capítulo 3!" para recibir tu insignia.',
        })
      }
    }
  })
}

function handleSkyPointer(e: PointerEvent): void {
  if (!skyRef.value || ribbonsCaught.value >= ribbonGoal) return
  const rect = skyRef.value.getBoundingClientRect()
  const pctX = ((e.clientX - rect.left) / rect.width) * 100
  const pctY = ((e.clientY - rect.top) / rect.height) * 100
  kiteX.value = Math.max(10, Math.min(90, pctX))
  kiteY.value = Math.max(14, Math.min(84, pctY))
  checkRibbonCollision()
}

function handleKeyMove(e: KeyboardEvent): void {
  if (!isFlying.value || ribbonsCaught.value >= ribbonGoal) return
  const step = 6
  if (e.key === 'ArrowLeft' || e.key === 'a') kiteX.value = Math.max(10, kiteX.value - step)
  if (e.key === 'ArrowRight' || e.key === 'd') kiteX.value = Math.min(90, kiteX.value + step)
  if (e.key === 'ArrowUp' || e.key === 'w') kiteY.value = Math.max(14, kiteY.value - step)
  if (e.key === 'ArrowDown' || e.key === 's') kiteY.value = Math.min(84, kiteY.value + step)
  checkRibbonCollision()
}

function stopWindLoop(): void {
  if (windFrameId !== null) {
    window.cancelAnimationFrame(windFrameId)
    windFrameId = null
  }
  window.removeEventListener('keydown', handleKeyMove)
}

watch(
  () => act,
  (current) => {
    if (current === 1) {
      emit('guide', {
        mood: 'happy',
        message: 'Acto 1: Cada amigo eligió un juego con total libertad. Entrega a cada uno el juguete que pidió.',
      })
    } else if (current === 2) {
      emit('guide', {
        mood: 'happy',
        message: 'Acto 2: Ayuda a los amigos a escucharse y decidir entre todos a qué jugar.',
      })
    } else {
      emit('guide', {
        mood: 'happy',
        message: 'Acto 3: ¡Diseña tu propia cometa de papel con tus colores favoritos y hazla volar por la colina!',
      })
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  stopWindLoop()
})
</script>

<template>
  <div class="level-3">
    <!-- ACT 1 -->
    <div v-if="act === 1" class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 1: Jugamos con libertad, sin etiquetas</h2>
        <span class="progress-chip">{{ deliveredChildIds.length }} / {{ CHILDREN.length }} entregas</span>
      </div>

      <div class="toys-shelf">
        <button
          v-for="toy in TOYS"
          :key="toy.id"
          type="button"
          class="toy-card"
          :class="{
            'is-selected': selectedToyId === toy.id,
            'is-used': deliveredChildIds.some((cId) => CHILDREN.find((c) => c.id === cId)?.toyId === toy.id),
          }"
          draggable="true"
          @dragstart="$event.dataTransfer?.setData('text/plain', toy.id)"
          @click="selectToy(toy.id)"
        >
          <svg width="44" height="44" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="26" :fill="toy.color" opacity="0.2" />
            <template v-if="toy.id === 'rocket'">
              <path d="M32 10 C42 22 44 36 38 48 H26 C20 36 22 22 32 10 Z" fill="#E3644B" stroke="#2B2433" stroke-width="2.4" />
              <circle cx="32" cy="28" r="5" fill="#DFF6F8" stroke="#2B2433" stroke-width="2" />
            </template>
            <template v-else-if="toy.id === 'kitchen'">
              <circle cx="32" cy="30" r="14" fill="#C98A55" stroke="#2B2433" stroke-width="2.2" />
              <circle cx="21" cy="20" r="5" fill="#C98A55" stroke="#2B2433" stroke-width="2" />
              <circle cx="43" cy="20" r="5" fill="#C98A55" stroke="#2B2433" stroke-width="2" />
              <circle cx="28" cy="28" r="2" fill="#2B2433" />
              <circle cx="36" cy="28" r="2" fill="#2B2433" />
            </template>
            <template v-else-if="toy.id === 'soccer'">
              <circle cx="32" cy="32" r="18" fill="#FFFDF7" stroke="#2B2433" stroke-width="2.5" />
              <polygon points="32,22 39,28 36,37 28,37 25,28" fill="#2B2433" />
            </template>
            <template v-else>
              <rect x="14" y="20" width="36" height="24" rx="8" fill="#FFFDF7" stroke="#6C63B5" stroke-width="2.5" />
              <circle cx="23" cy="32" r="4.5" fill="#E3644B" />
              <circle cx="33" cy="29" r="4.5" fill="#F5B82E" />
              <circle cx="42" cy="34" r="4.5" fill="#2493A2" />
            </template>
          </svg>
          <strong>{{ toy.label }}</strong>
        </button>
      </div>

      <div class="children-grid">
        <button
          v-for="child in CHILDREN"
          :key="child.id"
          type="button"
          class="child-card"
          :class="{ 'is-happy': deliveredChildIds.includes(child.id) }"
          @dragover.prevent
          @drop="deliverToChild(child, $event.dataTransfer?.getData('text/plain'))"
          @click="deliverToChild(child)"
        >
          <div class="child-top">
            <strong class="child-name">{{ child.name }}</strong>
            <span v-if="deliveredChildIds.includes(child.id)" class="ok-pill">¡A jugar!</span>
          </div>
          <p class="child-wish">“{{ child.wish }}”</p>
        </button>
      </div>

      <div v-if="act1Done" class="act-footer">
        <button type="button" class="paper-btn paper-btn-primary anim-pop-in" @click="goAct2">
          Subir a la asamblea del viento
        </button>
      </div>
    </div>

    <!-- ACT 2 -->
    <div v-else-if="act === 2" class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 2: Tu opinión cuenta en el grupo</h2>
        <span class="progress-chip">Fichas de amistad: {{ jarTokens }} / {{ GROUP_STEPS.length }}</span>
      </div>

      <div class="group-card">
        <div class="tokens-row" aria-label="Frasco de acuerdos">
          <span
            v-for="n in GROUP_STEPS.length"
            :key="n"
            class="friend-token"
            :class="{ 'is-filled': n <= jarTokens }"
          >
            {{ n <= jarTokens ? '★' : n }}
          </span>
        </div>

        <p class="group-prompt">{{ GROUP_STEPS[groupStepIdx].prompt }}</p>

        <div class="group-options">
          <button
            v-for="opt in GROUP_STEPS[groupStepIdx].options"
            :key="opt.id"
            type="button"
            class="option-btn"
            :class="{ 'is-ok': groupSolvedCurrent && opt.ok }"
            @click="chooseGroupOption(opt)"
          >
            {{ opt.text }}
          </button>
        </div>
      </div>

      <div v-if="groupSolvedCurrent" class="act-footer">
        <button type="button" class="paper-btn paper-btn-primary anim-pop-in" @click="nextGroupStep">
          {{ groupStepIdx < GROUP_STEPS.length - 1 ? 'Siguiente acuerdo' : 'Ir al taller de cometas' }}
        </button>
      </div>
    </div>

    <!-- ACT 3 -->
    <div v-else class="act-block">
      <div class="act-head">
        <h2 class="act-title">
          {{ isFlying ? 'Acto 3: ¡Vuela libre y atrapa 5 cintas de viento!' : 'Acto 3: Crea tu cometa de papel' }}
        </h2>
        <span class="progress-chip">Cintas: {{ ribbonsCaught }} / {{ ribbonGoal }}</span>
      </div>

      <div v-if="!isFlying" class="kite-atelier">
        <div class="kite-preview-stage">
          <svg viewBox="0 0 180 220" class="kite-preview-svg" aria-label="Vista previa de tu cometa">
            <!-- Shape -->
            <template v-if="kiteShape === 'diamond'">
              <polygon points="90,22 146,84 90,152 34,84" :fill="KITE_PALETTES[kitePalette].c1" stroke="#2B2433" stroke-width="3" />
              <polygon points="90,22 146,84 90,84" :fill="KITE_PALETTES[kitePalette].c2" />
              <polygon points="34,84 90,84 90,152" :fill="KITE_PALETTES[kitePalette].c3" />
            </template>
            <template v-else-if="kiteShape === 'star'">
              <polygon
                points="90,18 109,62 156,66 119,98 131,146 90,120 49,146 61,98 24,66 71,62"
                :fill="KITE_PALETTES[kitePalette].c1"
                stroke="#2B2433"
                stroke-width="3"
                stroke-linejoin="round"
              />
              <circle cx="90" cy="86" r="18" :fill="KITE_PALETTES[kitePalette].c3" />
            </template>
            <template v-else>
              <polygon
                points="90,22 142,54 142,114 90,148 38,114 38,54"
                :fill="KITE_PALETTES[kitePalette].c2"
                stroke="#2B2433"
                stroke-width="3"
              />
              <polygon points="90,22 142,54 90,86 38,54" :fill="KITE_PALETTES[kitePalette].c1" />
            </template>

            <!-- Tail -->
            <path d="M90 150 Q108 176 84 192 Q66 204 94 214" fill="none" stroke="#2B2433" stroke-width="3" stroke-linecap="round" />
            <template v-if="kiteTailStyle === 'ribbons'">
              <circle cx="97" cy="172" r="6" :fill="KITE_PALETTES[kitePalette].c2" />
              <circle cx="82" cy="194" r="6" :fill="KITE_PALETTES[kitePalette].c3" />
            </template>
            <template v-else-if="kiteTailStyle === 'stars'">
              <polygon points="97,165 101,173 93,173" :fill="KITE_PALETTES[kitePalette].c1" />
              <polygon points="82,188 86,196 78,196" :fill="KITE_PALETTES[kitePalette].c3" />
            </template>
            <template v-else>
              <rect x="92" y="168" width="10" height="10" transform="rotate(25 97 173)" :fill="KITE_PALETTES[kitePalette].c3" />
              <rect x="78" y="190" width="10" height="10" transform="rotate(-20 83 195)" :fill="KITE_PALETTES[kitePalette].c2" />
            </template>
          </svg>
        </div>

        <div class="kite-controls">
          <div class="ctrl-group">
            <span class="ctrl-label">Forma de papel:</span>
            <div class="ctrl-pills">
              <button type="button" class="mini-pill" :class="{ 'is-active': kiteShape === 'diamond' }" @click="playTap(); kiteShape = 'diamond'">Diamante</button>
              <button type="button" class="mini-pill" :class="{ 'is-active': kiteShape === 'star' }" @click="playTap(); kiteShape = 'star'">Estrella</button>
              <button type="button" class="mini-pill" :class="{ 'is-active': kiteShape === 'hex' }" @click="playTap(); kiteShape = 'hex'">Hexágono</button>
            </div>
          </div>

          <div class="ctrl-group">
            <span class="ctrl-label">Colores del cielo:</span>
            <div class="ctrl-pills">
              <button
                v-for="(pal, i) in KITE_PALETTES"
                :key="pal.name"
                type="button"
                class="mini-pill"
                :class="{ 'is-active': kitePalette === i }"
                @click="playTap(); kitePalette = i"
              >
                <span class="swatch-dot" :style="{ backgroundColor: pal.c1 }" />
                <span>{{ pal.name }}</span>
              </button>
            </div>
          </div>

          <div class="ctrl-group">
            <span class="ctrl-label">Cola decorativa:</span>
            <div class="ctrl-pills">
              <button type="button" class="mini-pill" :class="{ 'is-active': kiteTailStyle === 'ribbons' }" @click="playTap(); kiteTailStyle = 'ribbons'">Moñitos</button>
              <button type="button" class="mini-pill" :class="{ 'is-active': kiteTailStyle === 'stars' }" @click="playTap(); kiteTailStyle = 'stars'">Banderines</button>
              <button type="button" class="mini-pill" :class="{ 'is-active': kiteTailStyle === 'zigzag' }" @click="playTap(); kiteTailStyle = 'zigzag'">Rombitos</button>
            </div>
          </div>

          <button type="button" class="paper-btn paper-btn-primary" @click="launchKite">
            ¡A volar mi cometa!
          </button>
        </div>
      </div>

      <!-- Interactive Flying Sky -->
      <div v-else class="fly-wrap">
        <div
          ref="skyRef"
          class="fly-sky"
          @pointermove="handleSkyPointer"
          @pointerdown="handleSkyPointer"
        >
          <img :src="assetUrl('/art/bg-level3-hill.png')" alt="Colina ventosa" class="sky-bg" />

          <div
            v-for="r in windRibbons"
            :key="r.id"
            class="wind-ribbon"
            :class="{ 'is-caught': r.caught }"
            :style="{ left: `${r.x}%`, top: `${r.y}%` }"
          >
            <svg width="42" height="42" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="18" fill="#FFF2CF" stroke="#E58717" stroke-width="3" />
              <polygon points="24,11 28,20 37,21 30,27 32,36 24,31 16,36 18,27 11,21 20,20" fill="#F5B82E" />
            </svg>
          </div>

          <div
            class="flying-kite"
            :style="{ left: `${kiteX}%`, top: `${kiteY}%` }"
          >
            <svg width="86" height="96" viewBox="0 0 180 220" aria-hidden="true">
              <template v-if="kiteShape === 'diamond'">
                <polygon points="90,22 146,84 90,152 34,84" :fill="KITE_PALETTES[kitePalette].c1" stroke="#2B2433" stroke-width="4" />
                <polygon points="90,22 146,84 90,84" :fill="KITE_PALETTES[kitePalette].c2" />
                <polygon points="34,84 90,84 90,152" :fill="KITE_PALETTES[kitePalette].c3" />
              </template>
              <template v-else-if="kiteShape === 'star'">
                <polygon points="90,18 109,62 156,66 119,98 131,146 90,120 49,146 61,98 24,66 71,62" :fill="KITE_PALETTES[kitePalette].c1" stroke="#2B2433" stroke-width="4" />
              </template>
              <template v-else>
                <polygon points="90,22 142,54 142,114 90,148 38,114 38,54" :fill="KITE_PALETTES[kitePalette].c2" stroke="#2B2433" stroke-width="4" />
              </template>
              <path d="M90 150 Q108 176 84 192 Q66 204 94 214" fill="none" stroke="#2B2433" stroke-width="4" stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <div v-if="ribbonsCaught >= ribbonGoal" class="act-footer">
          <button
            type="button"
            class="paper-btn paper-btn-primary anim-pop-in"
            @click="emit('completeLevel', 3)"
          >
            ¡Completar Capítulo 3!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.level-3,
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

.toys-shelf {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(165px, 1fr));
  gap: 0.7rem;
}

.toy-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 74px;
  padding: 0.65rem 0.85rem;
  border-radius: 18px;
  background-color: #FFFDF7;
  border: 2.5px solid var(--theme-border);
  box-shadow: var(--shadow-paper-sm);
  font-family: var(--font-display);
  text-align: left;
  transition: transform 140ms var(--ease-out), border-color 140ms ease, opacity 140ms ease;
}

.toy-card.is-selected {
  border-color: var(--theme-accent);
  background-color: var(--theme-accent-soft);
  transform: translateY(-3px);
}

.toy-card.is-used {
  opacity: 0.48;
  background-color: #E2F5E9;
  border-color: #38945D;
}

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.8rem;
}

.child-card {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  text-align: left;
  min-height: 108px;
  padding: 0.95rem 1.05rem;
  border-radius: 20px;
  background-color: var(--theme-surface-alt);
  border: 2.5px dashed var(--theme-border);
  transition: transform 150ms var(--ease-out), background-color 150ms ease;
}

.child-card.is-happy {
  background-color: #E2F5E9;
  border-style: solid;
  border-color: #38945D;
}

.child-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.child-name {
  font-family: var(--font-display);
  font-size: 1.15rem;
}

.ok-pill {
  padding: 0.18rem 0.65rem;
  border-radius: 999px;
  background-color: #38945D;
  color: #FFFFFF;
  font-size: 0.82rem;
  font-weight: 800;
}

.child-wish {
  font-weight: 700;
  color: var(--ink-secondary);
}

/* Act 2 */
.group-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.2rem;
  border-radius: 22px;
  background-color: var(--theme-surface-alt);
  border: 2px solid var(--theme-border);
}

.tokens-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.friend-token {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background-color: #EFE5D3;
  border: 2px solid #D3C1A1;
  font-family: var(--font-display);
  font-weight: 700;
}

.friend-token.is-filled {
  background-color: #F5B82E;
  border-color: #C97A0C;
  color: #FFFFFF;
}

.group-prompt {
  font-size: 1.12rem;
  font-weight: 700;
}

.group-options {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.option-btn {
  text-align: left;
  min-height: 58px;
  padding: 0.85rem 1.05rem;
  border-radius: 18px;
  background-color: #FFFDF7;
  border: 2.5px solid var(--theme-border);
  font-size: 1.02rem;
  font-weight: 700;
}

.option-btn.is-ok {
  background-color: #E2F5E9;
  border-color: #38945D;
  color: #1B5432;
}

/* Act 3 */
.kite-atelier {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1.25rem;
  align-items: center;
}

.kite-preview-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-radius: 22px;
  background: linear-gradient(180deg, #DFF6F8 0%, #FFFDF7 100%);
  border: 2px solid var(--theme-border);
}

.kite-preview-svg {
  width: 170px;
  height: auto;
  animation: gentleFloat 4s ease-in-out infinite;
}

.kite-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.9rem;
}

.ctrl-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ctrl-label {
  font-family: var(--font-display);
  font-weight: 700;
}

.ctrl-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.mini-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background-color: #FFFDF7;
  border: 2px solid var(--theme-border);
  font-weight: 700;
}

.mini-pill.is-active {
  background-color: var(--theme-accent-soft);
  border-color: var(--theme-accent);
}

.swatch-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
}

.fly-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.fly-sky {
  position: relative;
  width: 100%;
  min-height: 310px;
  aspect-ratio: 16 / 9;
  max-height: 390px;
  border-radius: 22px;
  overflow: hidden;
  border: 3px solid var(--theme-border);
  touch-action: none;
  cursor: crosshair;
}

.sky-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.wind-ribbon {
  position: absolute;
  transform: translate(-50%, -50%);
  transition: transform 200ms var(--ease-out), opacity 220ms ease;
  pointer-events: none;
}

.wind-ribbon.is-caught {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.3);
}

.flying-kite {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: left 75ms linear, top 75ms linear;
  filter: drop-shadow(0 8px 14px rgba(43, 36, 51, 0.25));
}

.act-footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .kite-atelier {
    grid-template-columns: 1fr;
  }
}
</style>
