import type { LevelId, LevelMeta, StickerId } from '@/types/game'
import { assetUrl } from '@/utils/assets'

export const STICKER_OPTIONS: readonly {
  id: StickerId
  label: string
  accent: string
}[] = [
  { id: 'sun', label: 'Sol Alegre', accent: '#F29F24' },
  { id: 'star', label: 'Estrella Dorada', accent: '#E07A2F' },
  { id: 'kite', label: 'Cometa Libre', accent: '#2493A2' },
  { id: 'cloud', label: 'Nube Serena', accent: '#6C63B5' },
]

export const LEVELS: readonly LevelMeta[] = [
  {
    id: 1,
    chapterLabel: 'Capítulo 1',
    title: 'El Recreo Perdido',
    subtitle: 'El reloj de la mañana busca su ritmo',
    facetTitle: 'Derecho al juego libre y equilibrio diario',
    facetSummary:
      'Jugar es tan importante como aprender y descansar; todos los niños merecen tiempo libre cada día.',
    badgeId: 'reloj-feliz',
    badgeName: 'Reloj Feliz',
    badgeColor: '#F29F24',
    themeKey: 'level-1',
    backgroundArt: assetUrl('/art/bg-level1-sunrise.png'),
    introScript:
      '¡Buenos días! Desaparecieron las chispas del recreo entre tantas tareas. Ayúdame a encontrarlas y equilibrar nuestro día.',
    completionTakeaway:
      'Todos los niños y niñas tenemos derecho a jugar, descansar y aprender en equilibrio.',
    acts: [
      'Buscar chispas de juego',
      'Equilibrar el día',
      'Elegir con sabiduría',
    ],
  },
  {
    id: 2,
    chapterLabel: 'Capítulo 2',
    title: 'El Parque de Todos',
    subtitle: 'Un lugar donde cada amigo tiene su espacio',
    facetTitle: 'Derecho a jugar con diversidad e inclusión',
    facetSummary:
      'Sin importar cómo nos movamos, pensemos o sintamos, todos merecemos parques y juegos donde participar.',
    badgeId: 'parque-arcoiris',
    badgeName: 'Parque Arcoíris',
    badgeColor: '#2493A2',
    themeKey: 'level-2',
    backgroundArt: assetUrl('/art/bg-level2-park.png'),
    introScript:
      '¡Llegamos al parque del barrio! Vamos a construir juegos accesibles para que ningún amigo ni amiga se quede fuera.',
    completionTakeaway:
      'Jugar juntos respetando nuestras diferencias hace que la diversión sea justa para todos.',
    acts: [
      'Armar el parque inclusivo',
      'Incluir a cada amigo',
      'Sellar reglas justas',
    ],
  },
  {
    id: 3,
    chapterLabel: 'Capítulo 3',
    title: 'La Colina del Viento',
    subtitle: 'Juegos libres de etiquetas y voces escuchadas',
    facetTitle: 'Derecho a jugar con libertad y expresar gustos',
    facetSummary:
      'Puedes elegir a qué jugar sin prejuicios, expresar tu opinión en el grupo y crear con tu imaginación.',
    badgeId: 'cometa-libre',
    badgeName: 'Cometa Libre',
    badgeColor: '#D95D48',
    themeKey: 'level-3',
    backgroundArt: assetUrl('/art/bg-level3-hill.png'),
    introScript:
      '¡Siente la brisa de la tarde! Aquí cada niño elige su juego favorito con libertad y decide por turnos con sus amigos.',
    completionTakeaway:
      'Todos los juguetes son para quien quiera disfrutarlos, y escuchar nuestras opiniones hace el juego más bonito.',
    acts: [
      'Jugar sin etiquetas',
      'Decidir en equipo',
      'Crear y volar cometa',
    ],
  },
  {
    id: 4,
    chapterLabel: 'Capítulo 4',
    title: 'El Sendero Seguro',
    subtitle: 'Cuidar los espacios y escuchar nuestro cuerpo',
    facetTitle: 'Derecho a jugar en entornos seguros y pausar',
    facetSummary:
      'Merecemos espacios sin peligros para jugar, además de agua, sombra y descanso cuando el cuerpo avisa.',
    badgeId: 'corazon-sabio',
    badgeName: 'Corazón Sabio',
    badgeColor: '#3C9D64',
    themeKey: 'level-4',
    backgroundArt: assetUrl('/art/bg-level4-trail.png'),
    introScript:
      'El sol empieza a bajar. Revisemos que el sendero sea seguro y aprendamos cuándo nuestro cuerpo pide agua y descanso.',
    completionTakeaway:
      'Jugar seguro y descansar cuando sentimos sed o cansancio cuida nuestra alegría y nuestra salud.',
    acts: [
      'Reparar el sendero',
      'Jugar y hacer pausas',
      'Escuchar al cuerpo',
    ],
  },
  {
    id: 5,
    chapterLabel: 'Capítulo 5',
    title: 'La Aldea de las Luciérnagas',
    subtitle: 'Cuando llega la noche, la paz también es un derecho',
    facetTitle: 'Derecho a descansar, desconectar y dormir bien',
    facetSummary:
      'Apagar pantallas y ruidos a tiempo, respirar en calma y dormir lo suficiente recarga nuestros sueños.',
    badgeId: 'luna-serena',
    badgeName: 'Luna Serena',
    badgeColor: '#6C63B5',
    themeKey: 'level-5',
    backgroundArt: assetUrl('/art/bg-level5-village.png'),
    introScript:
      'Ya salieron las estrellas. Ayúdame a preparar la rutina de descanso, apagar los roba-sueños y respirar con la nube mágica.',
    completionTakeaway:
      'Descansar tranquilo y dormir bien cada noche es un derecho que nos llena de energía para volver a jugar.',
    acts: [
      'Ordenar la rutina',
      'Apagar roba-sueños',
      'Respirar con la nube',
    ],
  },
] as const

export function getLevelMeta(id: LevelId): LevelMeta {
  const found = LEVELS.find((lvl) => lvl.id === id)
  return found ?? LEVELS[0]
}
