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

// ---------------- ACT 1: Accessible Park Puzzle ----------------
interface ParkPiece {
  id: 'ramp' | 'swing' | 'calm' | 'art'
  title: string
  slotLabel: string
  color: string
  detail: string
}

const PARK_PIECES: readonly ParkPiece[] = [
  { id: 'ramp', title: 'Rampa colorida', slotLabel: 'Entrada sin escalones', color: '#E58717', detail: 'Para sillas de ruedas y coches' },
  { id: 'swing', title: 'Columpio adaptado', slotLabel: 'Zona de columpios', color: '#2493A2', detail: 'Con respaldo seguro para todos' },
  { id: 'calm', title: 'Rincón tranquilo', slotLabel: 'Sombra del árbol', color: '#38945D', detail: 'Espacio suave sin ruido fuerte' },
  { id: 'art', title: 'Mesa de arte baja', slotLabel: 'Plaza creativa', color: '#6C63B5', detail: 'Altura cómoda para dibujar juntos' },
]

const selectedPieceId = shallowRef<ParkPiece['id'] | null>(null)
const placedPieceIds = reactive<ParkPiece['id'][]>([])

const act1Complete = computed(() => placedPieceIds.length === PARK_PIECES.length)

function selectPuzzlePiece(id: ParkPiece['id']): void {
  if (placedPieceIds.includes(id)) return
  playTap()
  selectedPieceId.value = selectedPieceId.value === id ? null : id
}

function handleDragStart(e: DragEvent, id: string): void {
  e.dataTransfer?.setData('text/plain', id)
}

function tryPlaceInSlot(targetSlotId: ParkPiece['id'], draggedId?: string): void {
  const activeId = (draggedId as ParkPiece['id'] | undefined) || selectedPieceId.value
  if (!activeId || placedPieceIds.includes(targetSlotId)) return

  if (activeId === targetSlotId) {
    placedPieceIds.push(targetSlotId)
    selectedPieceId.value = null
    playStar()
    const piece = PARK_PIECES.find((p) => p.id === targetSlotId)!
    emit('feedback', { kind: 'success', text: `¡Encajaste ${piece.title}! ${piece.detail}.` })

    if (placedPieceIds.length === PARK_PIECES.length) {
      emit('celebrateAct')
      emit('guide', {
        mood: 'celebrate',
        message: '¡Qué hermoso parque inclusivo construimos! Ahora recibamos a los amigos que llegaron a jugar.',
      })
    }
  } else {
    playGentleHint()
    emit('feedback', { kind: 'hint', text: 'Esa pieza pertenece a otra zona del parque. ¡Mira la pista de cada espacio!' })
    emit('guide', {
      mood: 'thinking',
      message: 'Casi, casi. Mira la forma y el nombre del espacio en el parque y vuelve a intentar.',
    })
  }
}

function goAct2(): void {
  playTap()
  emit('requestNextAct', 2)
}

// ---------------- ACT 2: Inclusive Friend Matching ----------------
interface FriendCard {
  id: 'lia' | 'tomas' | 'valeria' | 'diego'
  name: string
  story: string
  targetId: ParkPiece['id']
  matchText: string
}

const FRIENDS: readonly FriendCard[] = [
  {
    id: 'lia',
    name: 'Lía',
    story: 'Usa silla de ruedas y quiere subir al escenario de juegos.',
    targetId: 'ramp',
    matchText: '¡Genial! Con la rampa colorida, Lía entra sola y feliz.',
  },
  {
    id: 'tomas',
    name: 'Tomás',
    story: 'Los ruidos muy fuertes le aturden; disfruta juegos serenos.',
    targetId: 'calm',
    matchText: '¡Sí! En el rincón tranquilo, Tomás juega a su ritmo y cómodo.',
  },
  {
    id: 'valeria',
    name: 'Valeria',
    story: 'Llegó hoy al barrio y sueña con columpiarse segura.',
    targetId: 'swing',
    matchText: '¡Qué alegría! En el columpio adaptado todos se mecen seguros.',
  },
  {
    id: 'diego',
    name: 'Diego',
    story: 'Ama inventar cuentos y dibujar con otros amigos.',
    targetId: 'art',
    matchText: '¡Perfecto! En la mesa de arte baja, Diego comparte colores e historias.',
  },
]

const selectedFriendId = shallowRef<FriendCard['id'] | null>(null)
const matchedFriendIds = reactive<FriendCard['id'][]>([])

const act2Complete = computed(() => matchedFriendIds.length === FRIENDS.length)

function selectFriend(id: FriendCard['id']): void {
  if (matchedFriendIds.includes(id)) return
  playTap()
  selectedFriendId.value = id
  const friend = FRIENDS.find((f) => f.id === id)!
  emit('guide', {
    mood: 'happy',
    message: `${friend.name}: ${friend.story} ¿A qué rincón del parque la invitamos?`,
  })
}

function assignStationToFriend(stationId: ParkPiece['id']): void {
  if (!selectedFriendId.value) {
    playGentleHint()
    emit('feedback', { kind: 'info', text: 'Primero toca a un amigo o amiga de la izquierda para elegir su estación.' })
    return
  }
  const friend = FRIENDS.find((f) => f.id === selectedFriendId.value)!
  if (friend.targetId === stationId) {
    matchedFriendIds.push(friend.id)
    selectedFriendId.value = null
    playSuccess()
    emit('feedback', { kind: 'success', text: friend.matchText })
    if (matchedFriendIds.length === FRIENDS.length) {
      emit('celebrateAct')
      emit('guide', {
        mood: 'celebrate',
        message: '¡Nadie quedó fuera! Todos están jugando felices. Vamos al último paso: las reglas justas.',
      })
    }
  } else {
    playGentleHint()
    emit('feedback', { kind: 'hint', text: `Pista para ${friend.name}: ${friend.story}` })
    emit('guide', {
      mood: 'thinking',
      message: `Escucha lo que necesita ${friend.name} y prueba otra estación del parque.`,
    })
  }
}

function goAct3(): void {
  playTap()
  emit('requestNextAct', 3)
}

// ---------------- ACT 3: Fair Rules Stamp (5 rules) ----------------
interface RuleBanner {
  id: string
  text: string
  isFair: boolean
  explanation: string
}

const RULES: readonly RuleBanner[] = [
  {
    id: 'r1',
    text: '“En este parque jugamos respetando turnos y cuidando a todos.”',
    isFair: true,
    explanation: '¡Regla justa! Turnarse y cuidarse permite que todos disfruten.',
  },
  {
    id: 'r2',
    text: '“Los niños nuevos del barrio no pueden entrar al juego.”',
    isFair: false,
    explanation: '¡Regla cambiada! Todos los niños y niñas merecen ser recibidos sin discriminación.',
  },
  {
    id: 'r3',
    text: '“Adaptamos el juego si alguien necesita más tiempo o apoyo.”',
    isFair: true,
    explanation: '¡Regla justa! Incluir es hacer espacio para cada manera de jugar.',
  },
  {
    id: 'r4',
    text: '“Solo quien corre más rápido puede elegir el juego todo el día.”',
    isFair: false,
    explanation: '¡Regla cambiada! En el parque todas las opiniones cuentan por igual.',
  },
  {
    id: 'r5',
    text: '“Si un amigo usa silla de ruedas o muletas, adaptamos el juego para divertirnos juntos.”',
    isFair: true,
    explanation: '¡Regla justa! Buscar maneras creativas de jugar juntos protege el derecho de todos.',
  },
]

const ruleIndex = shallowRef(0)
const ruleResolved = shallowRef(false)
const currentRule = computed(() => RULES[ruleIndex.value])

function stampRule(verdictIsFair: boolean): void {
  if (ruleResolved.value) return
  if (verdictIsFair === currentRule.value.isFair) {
    ruleResolved.value = true
    playSuccess()
    emit('feedback', { kind: 'success', text: currentRule.value.explanation })
    emit('guide', {
      mood: 'celebrate',
      message: currentRule.value.explanation,
    })
  } else {
    playGentleHint()
    const tip = currentRule.value.isFair
      ? 'Piensa: ¿esta regla trata bien e incluye a todos?'
      : 'Observa bien: ¿esta regla deja fuera o trata injustamente a alguien?'
    emit('feedback', { kind: 'hint', text: tip })
    emit('guide', { mood: 'thinking', message: tip })
  }
}

function nextRuleOrFinish(): void {
  playTap()
  if (ruleIndex.value < RULES.length - 1) {
    ruleIndex.value += 1
    ruleResolved.value = false
    emit('guide', { mood: 'happy', message: RULES[ruleIndex.value].text })
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
        message: 'Acto 1: Toca o arrastra cada pieza de papel hasta su lugar en el parque para hacerlo accesible.',
      })
    } else if (current === 2) {
      emit('guide', {
        mood: 'happy',
        message: 'Acto 2: Conoce a 4 amigos y elige la estación ideal para que nadie quede fuera del juego.',
      })
    } else {
      emit('guide', {
        mood: 'happy',
        message: 'Acto 3: Lee cada cartel del parque y decide si es una regla justa o si debemos cambiarla.',
      })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="level-2">
    <!-- ACT 1 -->
    <div v-if="act === 1" class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 1: Arma el Parque de Todos</h2>
        <span class="progress-chip">{{ placedPieceIds.length }} / {{ PARK_PIECES.length }} zonas</span>
      </div>

      <div class="puzzle-layout">
        <div class="pieces-tray">
          <button
            v-for="piece in PARK_PIECES"
            :key="piece.id"
            type="button"
            class="piece-btn"
            :class="{
              'is-selected': selectedPieceId === piece.id,
              'is-placed': placedPieceIds.includes(piece.id),
            }"
            :draggable="!placedPieceIds.includes(piece.id)"
            @dragstart="handleDragStart($event, piece.id)"
            @click="selectPuzzlePiece(piece.id)"
          >
            <span class="piece-swatch" :style="{ backgroundColor: piece.color }" aria-hidden="true" />
            <span class="piece-copy">
              <strong>{{ piece.title }}</strong>
              <small>{{ piece.detail }}</small>
            </span>
          </button>
        </div>

        <div class="park-board">
          <img :src="assetUrl('/art/bg-level2-park.png')" alt="Parque del barrio" class="board-bg" />
          <div class="slots-grid">
            <button
              v-for="slot in PARK_PIECES"
              :key="slot.id"
              type="button"
              class="park-slot"
              :class="{ 'is-filled': placedPieceIds.includes(slot.id) }"
              @dragover.prevent
              @drop="tryPlaceInSlot(slot.id, $event.dataTransfer?.getData('text/plain'))"
              @click="tryPlaceInSlot(slot.id)"
            >
              <span class="slot-zone-name">{{ slot.slotLabel }}</span>
              <span v-if="placedPieceIds.includes(slot.id)" class="slot-placed-badge">
                {{ slot.title }}
              </span>
              <span v-else class="slot-hint">Toca o suelta aquí</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="act1Complete" class="act-footer">
        <button type="button" class="paper-btn paper-btn-primary anim-pop-in" @click="goAct2">
          Abrir las puertas del parque
        </button>
      </div>
    </div>

    <!-- ACT 2 -->
    <div v-else-if="act === 2" class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 2: Que nadie quede fuera</h2>
        <span class="progress-chip">{{ matchedFriendIds.length }} / {{ FRIENDS.length }} incluidos</span>
      </div>

      <div class="match-columns">
        <div class="friends-col">
          <button
            v-for="friend in FRIENDS"
            :key="friend.id"
            type="button"
            class="friend-card"
            :class="{
              'is-selected': selectedFriendId === friend.id,
              'is-done': matchedFriendIds.includes(friend.id),
            }"
            @click="selectFriend(friend.id)"
          >
            <svg width="42" height="42" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="21" :fill="friend.id === 'lia' ? '#FFE4C2' : friend.id === 'tomas' ? '#D6F3F5' : friend.id === 'valeria' ? '#FFE3DB' : '#E6E2FA'" stroke="#2B2433" stroke-width="2" />
              <circle cx="19" cy="21" r="2.2" fill="#2B2433" />
              <circle cx="29" cy="21" r="2.2" fill="#2B2433" />
              <path d="M18 28 Q24 33 30 28" stroke="#2B2433" stroke-width="2.2" fill="none" stroke-linecap="round" />
            </svg>
            <div class="friend-copy">
              <strong>{{ friend.name }}</strong>
              <span>{{ friend.story }}</span>
            </div>
          </button>
        </div>

        <div class="stations-col">
          <button
            v-for="st in PARK_PIECES"
            :key="st.id"
            type="button"
            class="station-btn"
            @click="assignStationToFriend(st.id)"
          >
            <span class="station-dot" :style="{ backgroundColor: st.color }" />
            <div>
              <strong>{{ st.title }}</strong>
              <small>{{ st.detail }}</small>
            </div>
          </button>
        </div>
      </div>

      <div v-if="act2Complete" class="act-footer">
        <button type="button" class="paper-btn paper-btn-primary anim-pop-in" @click="goAct3">
          Revisar el buzón de reglas
        </button>
      </div>
    </div>

    <!-- ACT 3 -->
    <div v-else class="act-block">
      <div class="act-head">
        <h2 class="act-title">Acto 3: Sello de Reglas Justas</h2>
        <span class="progress-chip">Cartel {{ ruleIndex + 1 }} de {{ RULES.length }}</span>
      </div>

      <div class="rule-board">
        <p class="rule-text">{{ currentRule.text }}</p>

        <div class="stamp-actions">
          <button
            type="button"
            class="paper-btn paper-btn-green"
            :disabled="ruleResolved"
            @click="stampRule(true)"
          >
            ¡Es una regla justa!
          </button>
          <button
            type="button"
            class="paper-btn paper-btn-primary"
            :disabled="ruleResolved"
            @click="stampRule(false)"
          >
            ¡Cambiar por una regla inclusiva!
          </button>
        </div>
      </div>

      <div v-if="ruleResolved" class="act-footer">
        <button type="button" class="paper-btn paper-btn-primary anim-pop-in" @click="nextRuleOrFinish">
          {{ ruleIndex < RULES.length - 1 ? 'Siguiente cartel' : '¡Completar Capítulo 2!' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.level-2,
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

.puzzle-layout {
  display: grid;
  grid-template-columns: 270px 1fr;
  gap: 1rem;
  align-items: stretch;
}

.pieces-tray {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.piece-btn {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  text-align: left;
  padding: 0.7rem 0.85rem;
  min-height: 70px;
  border-radius: 18px;
  background-color: #FFFDF7;
  border: 2.5px solid var(--theme-border);
  box-shadow: var(--shadow-paper-sm);
  transition: transform 140ms var(--ease-out), border-color 140ms ease, opacity 140ms ease;
}

.piece-btn.is-selected {
  border-color: var(--theme-accent);
  background-color: var(--theme-accent-soft);
  transform: translateY(-2px);
}

.piece-btn.is-placed {
  opacity: 0.48;
  background-color: #E2F5E9;
  border-color: #38945D;
}

.piece-swatch {
  width: 22px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
}

.piece-copy {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.piece-copy strong {
  font-family: var(--font-display);
  font-size: 1rem;
}

.piece-copy small {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--ink-secondary);
}

.park-board {
  position: relative;
  min-height: 290px;
  border-radius: 22px;
  overflow: hidden;
  border: 3px solid var(--theme-border);
  padding: 0.9rem;
  display: flex;
  align-items: center;
}

.board-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.55;
}

.slots-grid {
  position: relative;
  z-index: 2;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.park-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.35rem;
  min-height: 118px;
  padding: 0.8rem;
  border-radius: 20px;
  background-color: rgba(255, 253, 247, 0.88);
  border: 3px dashed #2493A2;
  transition: transform 160ms var(--ease-spring), background-color 160ms ease;
}

.park-slot.is-filled {
  background-color: #E3F7EB;
  border-style: solid;
  border-color: #38945D;
  animation: squashPop 320ms var(--ease-out);
}

.slot-zone-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  color: var(--ink-primary);
}

.slot-placed-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background-color: #38945D;
  color: #FFFFFF;
  font-weight: 800;
  font-size: 0.85rem;
}

.slot-hint {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--theme-accent-deep);
}

/* Act 2 */
.match-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.friends-col,
.stations-col {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.friend-card,
.station-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  min-height: 76px;
  padding: 0.75rem 0.95rem;
  border-radius: 18px;
  background-color: #FFFDF7;
  border: 2.5px solid var(--theme-border);
  box-shadow: var(--shadow-paper-sm);
  transition: transform 140ms var(--ease-out), border-color 140ms ease, background-color 140ms ease;
}

.friend-card.is-selected {
  border-color: #2493A2;
  background-color: #DFF6F8;
  transform: translateY(-2px);
}

.friend-card.is-done {
  background-color: #E2F5E9;
  border-color: #38945D;
  opacity: 0.75;
}

.friend-copy {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.friend-copy strong,
.station-btn strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.05rem;
}

.friend-copy span,
.station-btn small {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink-secondary);
}

.station-dot {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  flex-shrink: 0;
}

/* Act 3 */
.rule-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
  padding: 1.6rem 1.3rem;
  border-radius: 24px;
  background-color: var(--theme-surface-alt);
  border: 2.5px solid var(--theme-border);
}

.rule-text {
  font-family: var(--font-display);
  font-size: clamp(1.22rem, 2.5vw, 1.55rem);
  font-weight: 700;
  color: var(--ink-primary);
  max-width: 34ch;
}

.stamp-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.85rem;
}

.act-footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 780px) {
  .puzzle-layout,
  .match-columns {
    grid-template-columns: 1fr;
  }
}
</style>
