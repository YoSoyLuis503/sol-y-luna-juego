<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue'
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

// ---------------- ACT 1: Find 5 Play Sparks ----------------
interface RoomItem {
  id: string
  label: string
  isToy: boolean
  left: string
  top: string
  hint: string
}

const ROOM_ITEMS: readonly RoomItem[] = [
  { id: 'plane', label: 'Avión de papel', isToy: true, left: '15%', top: '26%', hint: '¡Un avión de papel listo para volar en el recreo!' },
  { id: 'hw-1', label: 'Pila gigante de tareas', isToy: false, left: '39%', top: '22%', hint: 'Eso es tarea extra sin fin. ¡Busquemos tus chispas de juego!' },
  { id: 'trompo', label: 'Trompo de madera', isToy: true, left: '62%', top: '28%', hint: '¡Un trompo tradicional! Qué divertido hacerlo bailar.' },
  { id: 'hw-2', label: 'Reloj apurado', isToy: false, left: '85%', top: '23%', hint: '¡Prisa y más prisa! El juego necesita tiempo sin apuros.' },
  { id: 'crayons', label: 'Crayones de colores', isToy: true, left: '16%', top: '69%', hint: '¡Crayones! Dibujar e imaginar también es jugar.' },
  { id: 'hw-3', label: 'Cuaderno repetido', isToy: false, left: '39%', top: '73%', hint: 'Ya hicimos nuestra tarea de hoy; ahora toca encontrar juegos.' },
  { id: 'rope', label: 'Cuerda de saltar', isToy: true, left: '62%', top: '67%', hint: '¡Cuerda de saltar! Para brincar solos o con amigos.' },
  { id: 'ball', label: 'Pelota saltarina', isToy: true, left: '85%', top: '71%', hint: '¡Genial! Con la pelota podemos correr y reír en el patio.' },
]

const foundToyIds = reactive<string[]>([])
const toyGoal = 5

const act1Done = computed(() => foundToyIds.length >= toyGoal)

function tapRoomItem(item: RoomItem): void {
  if (item.isToy) {
    if (foundToyIds.includes(item.id)) return
    foundToyIds.push(item.id)
    playStar()
    emit('feedback', { kind: 'success', text: `${item.label}: ${item.hint}` })

    if (foundToyIds.length >= toyGoal) {
      emit('celebrateAct')
      emit('guide', {
        mood: 'celebrate',
        message: '¡Encontraste las 5 chispas de juego! Ahora pasemos a equilibrar la balanza de tu tarde.',
      })
    } else {
      emit('guide', {
        mood: 'happy',
        message: `¡Bien! Llevas ${foundToyIds.length} de ${toyGoal} chispas. Busca otro juguete escondido.`,
      })
    }
  } else {
    playGentleHint()
    emit('feedback', { kind: 'hint', text: item.hint })
    emit('guide', {
      mood: 'thinking',
      message: item.hint,
    })
  }
}

function goToAct2(): void {
  playTap()
  emit('requestNextAct', 2)
}

// ---------------- ACT 2: Balance Scale ----------------
interface RoutineTile {
  id: string
  label: string
  category: 'study' | 'play' | 'rest' | 'overload'
  weight: number // positive tips toward overload/work, negative toward rest/play, balanced = 0 sum with 3 core pillars
  desc: string
}

const ROUTINE_TILES: readonly RoutineTile[] = [
  { id: 'study-ok', label: 'Hacer mi tarea con calma', category: 'study', weight: 2, desc: 'Aprender un rato cada día' },
  { id: 'play-park', label: 'Jugar libre en el patio', category: 'play', weight: -1, desc: 'Correr, inventar y reír' },
  { id: 'rest-nap', label: 'Descansar y tomar agua', category: 'rest', weight: -1, desc: 'Recuperar energía tranquilo' },
  { id: 'play-art', label: 'Pintar y armar bloques', category: 'play', weight: -1, desc: 'Crear con libertad' },
  { id: 'overload-work', label: 'Solo tareas toda la tarde', category: 'overload', weight: 4, desc: 'Sin recreo ni pausas' },
  { id: 'overload-screen', label: 'Pantallas sin parar hasta noche', category: 'overload', weight: 3, desc: 'Cansa la vista y quita el sueño' },
]

const selectedTileIds = reactive<string[]>([])

const selectedTiles = computed(() =>
  ROUTINE_TILES.filter((t) => selectedTileIds.includes(t.id)),
)

const hasStudy = computed(() => selectedTiles.value.some((t) => t.category === 'study'))
const hasPlay = computed(() => selectedTiles.value.some((t) => t.category === 'play'))
const hasRest = computed(() => selectedTiles.value.some((t) => t.category === 'rest'))
const hasOverload = computed(() => selectedTiles.value.some((t) => t.category === 'overload'))

const scaleTilt = computed(() => {
  if (!selectedTiles.value.length) return 0
  const raw = selectedTiles.value.reduce((sum, t) => sum + t.weight, 0)
  return Math.max(-18, Math.min(18, raw * 4.5))
})

const isBalancedDay = computed(
  () => hasStudy.value && hasPlay.value && hasRest.value && !hasOverload.value,
)

function toggleRoutineTile(tile: RoutineTile): void {
  const idx = selectedTileIds.indexOf(tile.id)
  if (idx >= 0) {
    selectedTileIds.splice(idx, 1)
    playTap()
  } else {
    if (selectedTileIds.length >= 4) {
      playGentleHint()
      emit('feedback', {
        kind: 'hint',
        text: 'Tu tarde ya tiene 4 tarjetas. Toca una tarjeta de la balanza para quitarla si quieres cambiar.',
      })
      return
    }
    selectedTileIds.push(tile.id)
    if (tile.category === 'overload') {
      playGentleHint()
      emit('feedback', {
        kind: 'hint',
        text: `¡Cuidado! "${tile.label}" inclina demasiado la balanza y roba tiempo de juego o descanso.`,
      })
      emit('guide', {
        mood: 'thinking',
        message: 'Esa tarjeta pesa demasiado y desequilibra el día. Prueba quitarla y elegir tiempo de juego o descanso.',
      })
    } else {
      playTap()
    }
  }

  if (isBalancedDay.value) {
    playSuccess()
    emit('celebrateAct')
    emit('feedback', {
      kind: 'success',
      text: '¡Equilibrio perfecto! Aprender, jugar y descansar conviven felices en tu reloj.',
    })
    emit('guide', {
      mood: 'celebrate',
      message: '¡La balanza quedó nivelada! Ya podemos pasar a las decisiones del recreo.',
    })
  }
}

function goToAct3(): void {
  playTap()
  emit('requestNextAct', 3)
}

// ---------------- ACT 3: Four Illustrated Scenarios ----------------
interface DilemmaQuestion {
  id: string
  situation: string
  options: readonly {
    id: string
    label: string
    isCorrect: boolean
    feedback: string
  }[]
}

const QUESTIONS: readonly DilemmaQuestion[] = [
  {
    id: 'q1',
    situation:
      'Suena el timbre del recreo, pero alguien dice: "Jugar es perder el tiempo, mejor quédate copiando diez páginas más". ¿Qué es lo justo?',
    options: [
      {
        id: 'q1-a',
        label: 'No salir nunca al recreo para no perder tiempo.',
        isCorrect: false,
        feedback: 'El recreo no es tiempo perdido: ayuda a tu mente, cuerpo y alegría para aprender mejor después.',
      },
      {
        id: 'q1-b',
        label: 'Salir a jugar en el recreo porque jugar también es un derecho.',
        isCorrect: true,
        feedback: '¡Exacto! El recreo es tu derecho para moverte, compartir y descansar la mente.',
      },
      {
        id: 'q1-c',
        label: 'Esconder los juguetes de todos los compañeros.',
        isCorrect: false,
        feedback: 'Esconder juguetes quita la alegría a los demás. Compartir y disfrutar es mejor.',
      },
    ],
  },
  {
    id: 'q2',
    situation:
      'En casa ya terminaste tus deberes y ayudaste a guardar tus zapatos. Estás cansado pero con ganas de jugar tranquilo. ¿Qué merece tu tarde?',
    options: [
      {
        id: 'q2-a',
        label: 'Tener un rato libre para jugar o descansar sin culpa.',
        isCorrect: true,
        feedback: '¡Muy bien! Cumplir tus pequeñas responsabilidades deja espacio para disfrutar tu infancia.',
      },
      {
        id: 'q2-b',
        label: 'Hacer trabajo pesado de adultos toda la noche.',
        isCorrect: false,
        feedback: 'Los niños no deben hacer trabajos pesados que les quiten su tiempo de juego, estudio y descanso.',
      },
      {
        id: 'q2-c',
        label: 'No dormir nada para seguir mirando pantallas.',
        isCorrect: false,
        feedback: 'Dormir y descansar también es parte de cuidarte y disfrutar mañana.',
      },
    ],
  },
  {
    id: 'q3',
    situation:
      'Dos amigas encuentran una sola pelota en el patio de recreo y ambas quieren divertirse al mismo tiempo. ¿Cómo protegen su derecho a jugar?',
    options: [
      {
        id: 'q3-a',
        label: 'Tomar la pelota y correr sola para que nadie la toque.',
        isCorrect: false,
        feedback: 'Cuando acaparamos un juguete se termina la diversión compartida.',
      },
      {
        id: 'q3-b',
        label: 'Inventar un juego juntas o turnarse para pasar la pelota.',
        isCorrect: true,
        feedback: '¡Bravo! Turnarse y compartir convierte una pelota en alegría para todo el patio.',
      },
      {
        id: 'q3-c',
        label: 'Dejar la pelota guardada y no jugar nunca.',
        isCorrect: false,
        feedback: 'Siempre podemos dialogar y jugar en equipo.',
      },
    ],
  },
  {
    id: 'q4',
    situation:
      'Llevas veinte minutos corriendo en las carreras y sientes el corazón acelerado y las piernas cansadas, pero tus amigos piden una ronda más. ¿Qué decides?',
    options: [
      {
        id: 'q4-a',
        label: 'Decir "necesito descansar un poquito y tomar agua" antes de volver a jugar.',
        isCorrect: true,
        feedback: '¡Excelente! Escuchar al cuerpo y descansar cuando lo necesitas cuida tu salud y tu derecho al descanso.',
      },
      {
        id: 'q4-b',
        label: 'Seguir corriendo sin respirar aunque te sientas mareado.',
        isCorrect: false,
        feedback: 'Jugar nunca debe lastimarte; hacer una pausa te da fuerzas para seguir disfrutando.',
      },
      {
        id: 'q4-c',
        label: 'Enojarte y prohibir que los demás descansen.',
        isCorrect: false,
        feedback: 'Cada cuerpo tiene su propio ritmo y todos merecemos pausar con respeto.',
      },
    ],
  },
]

const questionIndex = shallowRef(0)
const solvedCurrentQ = shallowRef(false)

const currentQuestion = computed(() => QUESTIONS[questionIndex.value])

function chooseDilemmaOption(opt: DilemmaQuestion['options'][number]): void {
  if (solvedCurrentQ.value) return
  if (opt.isCorrect) {
    solvedCurrentQ.value = true
    playSuccess()
    emit('feedback', { kind: 'success', text: opt.feedback })
    emit('guide', {
      mood: 'celebrate',
      message: opt.feedback,
    })
  } else {
    playGentleHint()
    emit('feedback', { kind: 'hint', text: opt.feedback })
    emit('guide', {
      mood: 'thinking',
      message: `${opt.feedback} ¡Intenta otra opción!`,
    })
  }
}

function advanceAct3(): void {
  playTap()
  if (questionIndex.value < QUESTIONS.length - 1) {
    questionIndex.value += 1
    solvedCurrentQ.value = false
    emit('feedback', { kind: 'info', text: `Situación ${questionIndex.value + 1}: escucha con atención y elige.` })
    emit('guide', {
      mood: 'happy',
      message: QUESTIONS[questionIndex.value].situation,
    })
  } else {
    emit('completeLevel', 3)
  }
}

watch(
  () => act,
  (current) => {
    if (current === 1) {
      emit('guide', {
        mood: 'happy',
        message: 'Acto 1: Toca las 5 chispas de juego escondidas en la habitación para despertar el recreo.',
      })
    } else if (current === 2) {
      emit('guide', {
        mood: 'happy',
        message: 'Acto 2: Arma una tarde equilibrada. Elige tarjetas para juntar deber, juego libre y descanso en la balanza.',
      })
    } else {
      emit('guide', {
        mood: 'happy',
        message: 'Acto 3: Lee o escucha estas cuatro situaciones del día y elige la respuesta que defiende tu derecho a jugar y descansar.',
      })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="level-1">
    <!-- ACT 1 -->
    <div v-if="act === 1" class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 1: Encuentra las 5 chispas de juego</h2>
        <span class="progress-chip">{{ foundToyIds.length }} / {{ toyGoal }} encontradas</span>
      </div>

      <div class="bedroom-scene">
        <img
          :src="assetUrl('/art/bg-level1-sunrise.png')"
          alt="Habitación soleada de mañana"
          class="scene-bg"
        />

        <button
          v-for="item in ROOM_ITEMS"
          :key="item.id"
          type="button"
          class="scene-hotspot"
          :class="{
            'is-found': foundToyIds.includes(item.id),
            'is-toy': item.isToy,
          }"
          :style="{ left: item.left, top: item.top }"
          :aria-label="item.label"
          @click="tapRoomItem(item)"
        >
          <!-- Bespoke SVG illustrations for every hidden item -->
          <svg v-if="item.id === 'plane'" width="54" height="54" viewBox="0 0 64 64" aria-hidden="true">
            <polygon points="8,32 56,14 38,52 30,36" fill="#FFFDF7" stroke="#2493A2" stroke-width="3" stroke-linejoin="round" />
            <line x1="56" y1="14" x2="30" y2="36" stroke="#2493A2" stroke-width="2.5" />
          </svg>
          <svg v-else-if="item.id === 'ball'" width="54" height="54" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="22" fill="#E3644B" stroke="#9B321D" stroke-width="3" />
            <path d="M14 22 Q32 34 50 22" stroke="#FFF1D6" stroke-width="4" fill="none" />
            <path d="M14 42 Q32 30 50 42" stroke="#F5B82E" stroke-width="4" fill="none" />
          </svg>
          <svg v-else-if="item.id === 'trompo'" width="54" height="54" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M20 20 H44 L48 34 L32 54 L16 34 Z" fill="#F29F24" stroke="#A65E07" stroke-width="3" stroke-linejoin="round" />
            <line x1="18" y1="30" x2="46" y2="30" stroke="#2493A2" stroke-width="4" />
            <rect x="29" y="10" width="6" height="10" rx="2" fill="#A65E07" />
          </svg>
          <svg v-else-if="item.id === 'crayons'" width="54" height="54" viewBox="0 0 64 64" aria-hidden="true">
            <rect x="14" y="16" width="10" height="36" rx="3" fill="#E3644B" stroke="#2B2433" stroke-width="2" />
            <rect x="27" y="12" width="10" height="40" rx="3" fill="#F5B82E" stroke="#2B2433" stroke-width="2" />
            <rect x="40" y="18" width="10" height="34" rx="3" fill="#2493A2" stroke="#2B2433" stroke-width="2" />
          </svg>
          <svg v-else-if="item.id === 'rope'" width="54" height="54" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M16 18 C14 48 50 48 48 18" fill="none" stroke="#38945D" stroke-width="5" stroke-linecap="round" />
            <rect x="11" y="10" width="10" height="14" rx="4" fill="#F29F24" stroke="#A65E07" stroke-width="2" />
            <rect x="43" y="10" width="10" height="14" rx="4" fill="#F29F24" stroke="#A65E07" stroke-width="2" />
          </svg>
          <svg v-else width="52" height="52" viewBox="0 0 64 64" aria-hidden="true">
            <rect x="12" y="18" width="40" height="30" rx="4" fill="#EAE0CC" stroke="#9B8D74" stroke-width="2.5" />
            <line x1="18" y1="27" x2="46" y2="27" stroke="#9B8D74" stroke-width="2.5" />
            <line x1="18" y1="35" x2="42" y2="35" stroke="#9B8D74" stroke-width="2.5" />
            <line x1="18" y1="42" x2="36" y2="42" stroke="#9B8D74" stroke-width="2.5" />
          </svg>

          <span class="hotspot-label">{{ item.label }}</span>
        </button>
      </div>

      <div class="act-footer">
        <div class="sparks-tray">
          <span
            v-for="n in toyGoal"
            :key="n"
            class="spark-slot"
            :class="{ 'is-filled': n <= foundToyIds.length }"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" :fill="n <= foundToyIds.length ? '#F5B82E' : 'none'" stroke="#C97A0C" stroke-width="2" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
        </div>

        <button
          v-if="act1Done"
          type="button"
          class="paper-btn paper-btn-primary anim-pop-in"
          @click="goToAct2"
        >
          Seguir el rastro de chispas
        </button>
      </div>
    </div>

    <!-- ACT 2 -->
    <div v-else-if="act === 2" class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 2: Equilibra el reloj de la tarde</h2>
        <span class="progress-chip">{{ selectedTileIds.length }} / 4 tarjetas</span>
      </div>

      <div class="scale-stage">
        <svg viewBox="0 0 420 155" class="scale-svg" aria-hidden="true">
          <!-- Fulcrum -->
          <polygon points="210,75 182,142 238,142" fill="#D4A663" stroke="#9B6E30" stroke-width="3" stroke-linejoin="round" />
          <rect x="140" y="138" width="140" height="12" rx="6" fill="#B8833D" />
          <!-- Tilting Beam -->
          <g :style="{ transform: `rotate(${scaleTilt}deg)`, transformOrigin: '210px 76px', transition: 'transform 340ms cubic-bezier(0.34, 1.56, 0.64, 1)' }">
            <rect x="44" y="68" width="332" height="14" rx="7" fill="#2493A2" stroke="#186C78" stroke-width="2.5" />
            <circle cx="210" cy="75" r="10" fill="#FFFDF7" stroke="#186C78" stroke-width="3" />
            <!-- Left pan (Play & Rest) -->
            <path d="M56 82 L44 108 H98 L86 82 Z" fill="#FFE7BA" stroke="#C97A0C" stroke-width="2.5" stroke-linejoin="round" />
            <!-- Right pan (Study / Overload) -->
            <path d="M334 82 L322 108 H376 L364 82 Z" fill="#FFE3DB" stroke="#B8422B" stroke-width="2.5" stroke-linejoin="round" />
          </g>
        </svg>

        <div class="pillars-status">
          <span class="pillar-pill" :class="{ 'is-ok': hasStudy }">Aprender</span>
          <span class="pillar-pill" :class="{ 'is-ok': hasPlay }">Jugar libre</span>
          <span class="pillar-pill" :class="{ 'is-ok': hasRest }">Descansar</span>
          <span v-if="hasOverload" class="pillar-pill is-warn">¡Hay exceso!</span>
        </div>
      </div>

      <div class="routine-grid">
        <button
          v-for="tile in ROUTINE_TILES"
          :key="tile.id"
          type="button"
          class="routine-card"
          :class="{
            'is-selected': selectedTileIds.includes(tile.id),
            'is-overload': tile.category === 'overload' && selectedTileIds.includes(tile.id),
          }"
          @click="toggleRoutineTile(tile)"
        >
          <span class="routine-cat">{{
            tile.category === 'study'
              ? 'Deber'
              : tile.category === 'play'
                ? 'Juego'
                : tile.category === 'rest'
                  ? 'Descanso'
                  : 'Desequilibrio'
          }}</span>
          <strong class="routine-label">{{ tile.label }}</strong>
          <span class="routine-desc">{{ tile.desc }}</span>
        </button>
      </div>

      <div class="act-footer">
        <span class="helper-note">Tip: incluye al menos una tarjeta de Aprender, una de Juego y una de Descanso.</span>
        <button
          v-if="isBalancedDay"
          type="button"
          class="paper-btn paper-btn-primary anim-pop-in"
          @click="goToAct3"
        >
          Escuchar la campana del patio
        </button>
      </div>
    </div>

    <!-- ACT 3 -->
    <div v-else class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 3: Elige lo justo para tu derecho a jugar</h2>
        <span class="progress-chip">Situación {{ questionIndex + 1 }} de {{ QUESTIONS.length }}</span>
      </div>

      <div class="dilemma-card">
        <p class="dilemma-prompt">{{ currentQuestion.situation }}</p>

        <div class="dilemma-options">
          <button
            v-for="opt in currentQuestion.options"
            :key="opt.id"
            type="button"
            class="option-btn"
            :class="{ 'is-correct': solvedCurrentQ && opt.isCorrect }"
            @click="chooseDilemmaOption(opt)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div v-if="solvedCurrentQ" class="act-footer">
        <button type="button" class="paper-btn paper-btn-primary anim-pop-in" @click="advanceAct3">
          {{ questionIndex < QUESTIONS.length - 1 ? 'Siguiente situación' : '¡Completar Capítulo 1!' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.level-1,
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
  gap: 0.65rem;
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
  font-size: 0.95rem;
}

.bedroom-scene {
  position: relative;
  width: 100%;
  min-height: 290px;
  height: 310px;
  border-radius: 22px;
  overflow: hidden;
  border: 3px solid var(--theme-border);
  box-shadow: var(--shadow-paper-sm);
}

.scene-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scene-hotspot {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.45rem;
  min-width: 74px;
  min-height: 74px;
  border-radius: 20px;
  background-color: rgba(255, 253, 247, 0.9);
  border: 2.5px solid #E2CCA4;
  box-shadow: var(--shadow-paper-sm);
  transition: transform 180ms var(--ease-spring), opacity 220ms ease, background-color 180ms ease;
}

.scene-hotspot.is-found {
  background-color: #E3F7EB;
  border-color: #38945D;
  transform: translate(-50%, -50%) scale(0.92);
  opacity: 0.55;
}

@media (hover: hover) and (pointer: fine) {
  .scene-hotspot:hover:not(.is-found) {
    transform: translate(-50%, -56%) scale(1.06);
  }
}

.hotspot-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--ink-primary);
  background-color: rgba(255, 253, 247, 0.95);
  padding: 0.08rem 0.45rem;
  border-radius: 999px;
  white-space: nowrap;
}

.act-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.85rem;
}

.sparks-tray {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spark-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background-color: var(--theme-surface-alt);
  border: 2px dashed var(--theme-border);
}

.spark-slot.is-filled {
  background-color: #FFF2CF;
  border-style: solid;
  border-color: #E58717;
  animation: squashPop 320ms var(--ease-out);
}

/* Act 2 */
.scale-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem;
  border-radius: 22px;
  background-color: var(--theme-surface-alt);
  border: 2px solid var(--theme-border);
}

.scale-svg {
  width: 100%;
  max-width: 390px;
  height: auto;
}

.pillars-status {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.pillar-pill {
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  background-color: #EFE8D8;
  border: 2px solid #D4C5A9;
  font-weight: 800;
  font-size: 0.88rem;
  color: var(--ink-secondary);
}

.pillar-pill.is-ok {
  background-color: #E2F5E9;
  border-color: #38945D;
  color: #1B5432;
}

.pillar-pill.is-warn {
  background-color: #FFE4DD;
  border-color: #E3644B;
  color: #8A2512;
}

.routine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.routine-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 0.3rem;
  min-height: 98px;
  padding: 0.85rem 1rem;
  border-radius: 20px;
  background-color: #FFFDF7;
  border: 2.5px solid var(--theme-border);
  box-shadow: var(--shadow-paper-sm);
  transition: transform 140ms var(--ease-out), border-color 140ms ease, background-color 140ms ease;
}

.routine-card.is-selected {
  background-color: #E3F7EB;
  border-color: #38945D;
  transform: translateY(-2px);
}

.routine-card.is-overload {
  background-color: #FFE6DF;
  border-color: #E3644B;
}

.routine-cat {
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.12rem 0.55rem;
  border-radius: 999px;
  background-color: var(--theme-accent-soft);
  color: var(--theme-ink);
}

.routine-label {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--ink-primary);
}

.routine-desc {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink-secondary);
}

.helper-note {
  font-weight: 700;
  color: var(--ink-secondary);
  font-size: 0.94rem;
}

/* Act 3 */
.dilemma-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.15rem;
  border-radius: 22px;
  background-color: var(--theme-surface-alt);
  border: 2px solid var(--theme-border);
}

.dilemma-prompt {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.45;
}

.dilemma-options {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.option-btn {
  text-align: left;
  min-height: 60px;
  padding: 0.9rem 1.15rem;
  border-radius: 18px;
  background-color: #FFFDF7;
  border: 2.5px solid var(--theme-border);
  font-size: 1.04rem;
  font-weight: 700;
  color: var(--ink-primary);
  box-shadow: var(--shadow-paper-sm);
  transition: transform 140ms var(--ease-out), border-color 140ms ease, background-color 140ms ease;
}

.option-btn.is-correct {
  background-color: #E2F5E9;
  border-color: #38945D;
  color: #1B5432;
}

@media (hover: hover) and (pointer: fine) {
  .option-btn:hover {
    transform: translateY(-2px);
    border-color: var(--theme-accent);
  }
}

@media (max-width: 680px) {
  .bedroom-scene {
    height: auto;
    min-height: 0;
    padding: 0.75rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .scene-hotspot {
    position: relative;
    left: auto !important;
    top: auto !important;
    transform: none !important;
    width: 100%;
    min-height: 92px;
    padding: 0.55rem 0.45rem;
  }

  .scene-hotspot.is-found {
    transform: scale(0.96) !important;
  }

  .hotspot-label {
    white-space: normal;
    text-align: center;
    line-height: 1.2;
  }
}
</style>
