import type { LevelId, StoryBridge } from '@/types/game'

export const STORY_BRIDGES: readonly StoryBridge[] = [
  // Chapter 1
  {
    levelId: 1,
    toAct: 2,
    title: '¡El rastro de chispas ilumina el reloj!',
    storyText:
      'Las cinco chispas del juego despertaron las manecillas de la mañana. Ahora crucemos el puente de papel hasta la gran balanza para organizar una tarde feliz.',
    relicName: 'Llave de Chispas',
    relicIcon: 'key',
    bomboMood: 'celebrate',
    ctaLabel: 'Cruzar a la Balanza',
  },
  {
    levelId: 1,
    toAct: 3,
    title: 'Suena la campana del patio soleado',
    storyText:
      'Tu reloj ya late en equilibrio entre deber, juego y descanso. En el patio de papel te esperan amigos con preguntas reales para defender el recreo.',
    relicName: 'Balanza Dorada',
    relicIcon: 'scale',
    bomboMood: 'happy',
    ctaLabel: 'Entrar al Patio de Decisiones',
  },

  // Chapter 2
  {
    levelId: 2,
    toAct: 2,
    title: 'Se abren las puertas del parque inclusivo',
    storyText:
      'Con la rampa, el columpio adaptado, la sombra tranquila y la mesa baja listos, ¡mira quiénes vienen caminando por el sendero para jugar contigo!',
    relicName: 'Puente de Colores',
    relicIcon: 'bridge',
    bomboMood: 'celebrate',
    ctaLabel: 'Recibir a los Amigos',
  },
  {
    levelId: 2,
    toAct: 3,
    title: 'Un viento alegre trae carteles nuevos',
    storyText:
      'Cada amigo encontró su lugar favorito y nadie quedó fuera. Ahora revisemos el buzón del parque para asegurar que todas las reglas sean justas.',
    relicName: 'Buzón del Parque',
    relicIcon: 'mail',
    bomboMood: 'happy',
    ctaLabel: 'Revisar las Reglas Justas',
  },

  // Chapter 3
  {
    levelId: 3,
    toAct: 2,
    title: '¡Subiendo hacia la plaza del viento!',
    storyText:
      'Cada niño recibió su juguete elegido con libertad y sin etiquetas. Ahora sigamos el sendero de la colina donde el grupo quiere acordar un juego entre todos.',
    relicName: 'Brújula Libre',
    relicIcon: 'compass',
    bomboMood: 'celebrate',
    ctaLabel: 'Ir a la Asamblea de Amigos',
  },
  {
    levelId: 3,
    toAct: 3,
    title: '¡La brisa nos regala hilos de colores!',
    storyText:
      '¡Escucharse y turnarse llenó el frasco de amistad! Sube a la cima de la colina para construir y volar tu propia cometa de papel.',
    relicName: 'Hilo de Viento',
    relicIcon: 'wind',
    bomboMood: 'happy',
    ctaLabel: 'Subir al Taller de Cometas',
  },

  // Chapter 4
  {
    levelId: 4,
    toAct: 2,
    title: 'El sendero brilla limpio y seguro',
    storyText:
      'Reparaste los juegos y despejaste cada peligro del camino. Ahora corre y brinca conmigo por el parque, ¡y recuerda cuidar tu cuerpo cuando pida pausa!',
    relicName: 'Escudo del Sendero',
    relicIcon: 'shield',
    bomboMood: 'celebrate',
    ctaLabel: 'Correr al Campo de Estrellas',
  },
  {
    levelId: 4,
    toAct: 3,
    title: 'Descanso fresco bajo la sombra dorada',
    storyText:
      'Tomar agua y reposar a tiempo devolvió la sonrisa a Bombo. Acompáñame al mirador del atardecer para reconocer todas las señales del cuerpo.',
    relicName: 'Cantimplora Fresca',
    relicIcon: 'drop',
    bomboMood: 'happy',
    ctaLabel: 'Ir al Mirador del Cuerpo',
  },

  // Chapter 5
  {
    levelId: 5,
    toAct: 2,
    title: 'Las estrellas despiertan sobre la aldea',
    storyText:
      'Ordenaste la rutina nocturna paso a paso como un guardián sabio. Entremos de puntitas al dormitorio estrellado para calmar los ruidos roba-sueños.',
    relicName: 'Linterna de Cuentos',
    relicIcon: 'lantern',
    bomboMood: 'sleepy',
    ctaLabel: 'Entrar a la Aldea Nocturna',
  },
  {
    levelId: 5,
    toAct: 3,
    title: 'Un cielo sereno lleno de luciérnagas',
    storyText:
      'Todas las pantallas descansan y la calma abraza la habitación. Acompáñame a la nube mágica para descubrir secretos del buen dormir y respirar profundo.',
    relicName: 'Frasco de Luciérnagas',
    relicIcon: 'firefly',
    bomboMood: 'sleepy',
    ctaLabel: 'Subir a la Nube Mágica',
  },
] as const

export function getStoryBridge(levelId: LevelId, toAct: 2 | 3): StoryBridge {
  const found = STORY_BRIDGES.find((b) => b.levelId === levelId && b.toAct === toAct)
  return found ?? STORY_BRIDGES[0]
}
