import asyncio
import os
import re
from pathlib import Path
import edge_tts

VOICE = "es-MX-DaliaNeural"
RATE = "-4%"
PITCH = "+3Hz"

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "voice"
MANIFEST_PATH = ROOT / "src" / "data" / "voiceManifest.ts"

PHRASES = [
    # Splash
    "¡Qué alegría verte de nuevo! Elige un capítulo en el mapa.",
    "¡Bienvenido a Sol y Luna, el reloj de papel!",

    # Character Intro (5-Beat Story Prologue)
    "¡Hola! Soy Bombo, el guardián de Sol y Luna. El gran reloj de papel perdió su ritmo entre el juego y el descanso. ¿Me ayudas a repararlo juntos en cinco capítulos?",
    "¡Hola! Soy Bombo, el guardián de Sol y Luna. Bienvenido a nuestro pueblo de papel, donde cada día guarda dos tesoros mágicos.",
    "Cuando sale el Sol, todos los niños y niñas tienen derecho a jugar con libertad, imaginar, reír e incluir a cada amigo sin dejar a nadie fuera.",
    "Y cuando sale la Luna, llega el derecho a descansar: tomar agua, respirar en calma, apagar pantallas y dormir tranquilo para crecer sanos.",
    "Pero hoy el gran Reloj de Papel se enredó. Faltan chispas de recreo, juegos seguros y silencio nocturno. ¿Me ayudas a repararlo juntos?",
    "¡Qué alegría tenerte en el equipo! Si quieres escribe tu nombre y elige tu sello, y abramos el mapa de los cinco capítulos.",
    "¡Jijiji! ¡Qué alegría jugar contigo! Escribe tu nombre si quieres y empecemos.",

    # World Map (static audio versions + locked prompts)
    "¡Felicidades! Reparaste los 5 capítulos del reloj de papel. Puedes volver a jugar cualquiera o ver tu Gran Celebración.",
    "¡Hola! Toca el Capítulo 1 para continuar nuestra aventura sobre el derecho a jugar y descansar.",
    "¡Hola! Toca el Capítulo 2 para continuar nuestra aventura sobre el derecho a jugar y descansar.",
    "¡Hola! Toca el Capítulo 3 para continuar nuestra aventura sobre el derecho a jugar y descansar.",
    "¡Hola! Toca el Capítulo 4 para continuar nuestra aventura sobre el derecho a jugar y descansar.",
    "¡Hola! Toca el Capítulo 5 para continuar nuestra aventura sobre el derecho a jugar y descansar.",
    "Primero completa el Capítulo 1 para abrir este camino, o activa el Modo Docente si estás presentando.",
    "Primero completa el Capítulo 2 para abrir este camino, o activa el Modo Docente si estás presentando.",
    "Primero completa el Capítulo 3 para abrir este camino, o activa el Modo Docente si estás presentando.",
    "Primero completa el Capítulo 4 para abrir este camino, o activa el Modo Docente si estás presentando.",

    # Final Celebration
    "¡Bravo! Reparaste el Reloj de Papel de Sol y Luna. Ahora eres Guardián del Derecho a Jugar y Descansar.",

    # Chapter intros, opener scripts, completion takeaways & badges
    "¡Buenos días! Desaparecieron las chispas del recreo entre tantas tareas. Ayúdame a encontrarlas y equilibrar nuestro día.",
    "Capítulo 1: El Recreo Perdido. ¡Buenos días! Desaparecieron las chispas del recreo entre tantas tareas. Ayúdame a encontrarlas y equilibrar nuestro día.",
    "¡Lo lograste! Todos los niños y niñas tenemos derecho a jugar, descansar y aprender en equilibrio.",
    "Insignia Reloj Feliz. Todos los niños y niñas tenemos derecho a jugar, descansar y aprender en equilibrio.",

    "¡Llegamos al parque del barrio! Vamos a construir juegos accesibles para que ningún amigo ni amiga se quede fuera.",
    "Capítulo 2: El Parque de Todos. ¡Llegamos al parque del barrio! Vamos a construir juegos accesibles para que ningún amigo ni amiga se quede fuera.",
    "¡Lo lograste! Jugar juntos respetando nuestras diferencias hace que la diversión sea justa para todos.",
    "Insignia Parque Arcoíris. Jugar juntos respetando nuestras diferencias hace que la diversión sea justa para todos.",

    "¡Siente la brisa de la tarde! Aquí cada niño elige su juego favorito con libertad y decide por turnos con sus amigos.",
    "Capítulo 3: La Colina del Viento. ¡Siente la brisa de la tarde! Aquí cada niño elige su juego favorito con libertad y decide por turnos con sus amigos.",
    "¡Lo lograste! Todos los juguetes son para quien quiera disfrutarlos, y escuchar nuestras opiniones hace el juego más bonito.",
    "Insignia Cometa Libre. Todos los juguetes son para quien quiera disfrutarlos, y escuchar nuestras opiniones hace el juego más bonito.",

    "El sol empieza a bajar. Revisemos que el sendero sea seguro y aprendamos cuándo nuestro cuerpo pide agua y descanso.",
    "Capítulo 4: El Sendero Seguro. El sol empieza a bajar. Revisemos que el sendero sea seguro y aprendamos cuándo nuestro cuerpo pide agua y descanso.",
    "¡Lo lograste! Jugar seguro y descansar cuando sentimos sed o cansancio cuida nuestra alegría y nuestra salud.",
    "Insignia Corazón Sabio. Jugar seguro y descansar cuando sentimos sed o cansancio cuida nuestra alegría y nuestra salud.",

    "Ya salieron las estrellas. Ayúdame a preparar la rutina de descanso, apagar los roba-sueños y respirar con la nube mágica.",
    "Capítulo 5: La Aldea de las Luciérnagas. Ya salieron las estrellas. Ayúdame a preparar la rutina de descanso, apagar los roba-sueños y respirar con la nube mágica.",
    "¡Lo lograste! Descansar tranquilo y dormir bien cada noche es un derecho que nos llena de energía para volver a jugar.",
    "Insignia Luna Serena. Descansar tranquilo y dormir bien cada noche es un derecho que nos llena de energía para volver a jugar.",

    # Level 1
    "Acto 1: Toca las 5 chispas de juego escondidas en la habitación para despertar el recreo.",
    "¡Bien! Llevas 1 de 5 chispas. Busca otro juguete escondido.",
    "¡Bien! Llevas 2 de 5 chispas. Busca otro juguete escondido.",
    "¡Bien! Llevas 3 de 5 chispas. Busca otro juguete escondido.",
    "¡Bien! Llevas 4 de 5 chispas. Busca otro juguete escondido.",
    "¡Encontraste las 5 chispas de juego! Ahora pasemos a equilibrar la balanza de tu tarde.",
    "Eso es tarea extra sin fin. ¡Busquemos tus chispas de juego!",
    "¡Prisa y más prisa! El juego necesita tiempo sin apuros.",
    "Ya hicimos nuestra tarea de hoy; ahora toca encontrar juegos.",
    "Acto 2: Arma una tarde equilibrada. Elige tarjetas para juntar deber, juego libre y descanso en la balanza.",
    "Esa tarjeta pesa demasiado y desequilibra el día. Prueba quitarla y elegir tiempo de juego o descanso.",
    "¡La balanza quedó nivelada! Ya podemos pasar a las decisiones del recreo.",
    "Acto 3: Lee o escucha estas dos situaciones del día y elige la respuesta que defiende tu derecho a jugar y descansar.",
    "Acto 3: Lee o escucha estas cuatro situaciones del día y elige la respuesta que defiende tu derecho a jugar y descansar.",
    "¡Exacto! El recreo es tu derecho para moverte, compartir y descansar la mente.",
    "El recreo no es tiempo perdido: ayuda a tu mente, cuerpo y alegría para aprender mejor después. ¡Intenta otra opción!",
    "Esconder juguetes quita la alegría a los demás. Compartir y disfrutar es mejor. ¡Intenta otra opción!",
    "En casa ya terminaste tus deberes y ayudaste a guardar tus zapatos. Estás cansado pero con ganas de jugar tranquilo. ¿Qué merece tu tarde?",
    "¡Muy bien! Cumplir tus pequeñas responsabilidades deja espacio para disfrutar tu infancia.",
    "Los niños no deben hacer trabajos pesados que les quiten su tiempo de juego, estudio y descanso. ¡Intenta otra opción!",
    "Dormir y descansar también es parte de cuidarte y disfrutar mañana. ¡Intenta otra opción!",
    "Dos amigas encuentran una sola pelota en el patio de recreo y ambas quieren divertirse al mismo tiempo. ¿Cómo protegen su derecho a jugar?",
    "¡Bravo! Turnarse y compartir convierte una pelota en alegría para todo el patio.",
    "Cuando acaparamos un juguete se termina la diversión compartida. ¡Intenta otra opción!",
    "Siempre podemos dialogar y jugar en equipo. ¡Intenta otra opción!",
    "Llevas veinte minutos corriendo en las carreras y sientes el corazón acelerado y las piernas cansadas, pero tus amigos piden una ronda más. ¿Qué decides?",
    "¡Excelente! Escuchar al cuerpo y descansar cuando lo necesitas cuida tu salud y tu derecho al descanso.",
    "Jugar nunca debe lastimarte; hacer una pausa te da fuerzas para seguir disfrutando. ¡Intenta otra opción!",
    "Cada cuerpo tiene su propio ritmo y todos merecemos pausar con respeto. ¡Intenta otra opción!",

    # Level 2
    "Acto 1: Toca o arrastra cada pieza de papel hasta su lugar en el parque para hacerlo accesible.",
    "Casi, casi. Mira la forma y el nombre del espacio en el parque y vuelve a intentar.",
    "¡Qué hermoso parque inclusivo construimos! Ahora recibamos a los amigos que llegaron a jugar.",
    "Acto 2: Conoce a 4 amigos y elige la estación ideal para que nadie quede fuera del juego.",
    "Lía: Usa silla de ruedas y quiere subir al escenario de juegos. ¿A qué rincón del parque la invitamos?",
    "Tomás: Los ruidos muy fuertes le aturden; disfruta juegos serenos. ¿A qué rincón del parque la invitamos?",
    "Valeria: Llegó hoy al barrio y sueña con columpiarse segura. ¿A qué rincón del parque la invitamos?",
    "Diego: Ama inventar cuentos y dibujar con otros amigos. ¿A qué rincón del parque la invitamos?",
    "Escucha lo que necesita Lía y prueba otra estación del parque.",
    "Escucha lo que necesita Tomás y prueba otra estación del parque.",
    "Escucha lo que necesita Valeria y prueba otra estación del parque.",
    "Escucha lo que necesita Diego y prueba otra estación del parque.",
    "¡Nadie quedó fuera! Todos están jugando felices. Vamos al último paso: las reglas justas.",
    "Acto 3: Lee cada cartel del parque y decide si es una regla justa o si debemos cambiarla.",
    "“En este parque jugamos respetando turnos y cuidando a todos.”",
    "“Los niños nuevos del barrio no pueden entrar al juego.”",
    "“Adaptamos el juego si alguien necesita más tiempo o apoyo.”",
    "“Solo quien corre más rápido puede elegir el juego todo el día.”",
    "“Si un amigo usa silla de ruedas o muletas, adaptamos el juego para divertirnos juntos.”",
    "¡Regla justa! Turnarse y cuidarse permite que todos disfruten.",
    "¡Regla cambiada! Todos los niños y niñas merecen ser recibidos sin discriminación.",
    "¡Regla justa! Incluir es hacer espacio para cada manera de jugar.",
    "¡Regla justa! Buscar maneras creativas de jugar juntos protege el derecho de todos.",
    "¡Regla cambiada! En el parque todas las opiniones cuentan por igual.",
    "Piensa: ¿esta regla trata bien e incluye a todos?",
    "Observa bien: ¿esta regla deja fuera o trata injustamente a alguien?",

    # Level 3
    "Acto 1: Cada amigo eligió un juego con total libertad. Entrega a cada uno el juguete que pidió.",
    "Sofía dice: \"¡Hoy quiero viajar en un cohete espacial!\"",
    "Lucas dice: \"¡Quiero preparar sopa rica para mi osito!\"",
    "Camila dice: \"¡Tengo ganas de patear goles con el balón!\"",
    "Mateo dice: \"¡Quiero pintar flores brillantes con acuarela!\"",
    "Escucha el deseo de Sofía y elige el juguete que eligió.",
    "Escucha el deseo de Lucas y elige el juguete que eligió.",
    "Escucha el deseo de Camila y elige el juguete que eligió.",
    "Escucha el deseo de Mateo y elige el juguete que eligió.",
    "¡Bravísimo! Jugar con libertad sin etiquetas nos hace felices. Ahora decidamos un juego en equipo.",
    "Acto 2: Ayuda a los amigos a escucharse y decidir entre todos a qué jugar.",
    "Si no escuchamos a todos, el juego deja de ser libre y justo.",
    "¡Excelente! Todos tenemos derecho a expresar nuestra opinión y ser escuchados.",
    "La mitad quiere jugar a los piratas y la otra mitad a explorar la selva. ¿Cómo lo resuelven juntos?",
    "¡Genial! Piratas exploradores de la selva, o un turno cada juego. ¡Qué buena idea!",
    "Podemos conversar y encontrar un acuerdo donde todos disfruten.",
    "Una amiga tímida todavía no habló en la votación. ¿Qué es lo más amable?",
    "¡Sí! Dar espacio a las voces tranquilas hace el grupo más fuerte y feliz.",
    "Invitar a hablar con respeto ayuda a que nadie quede en silencio.",
    "A mitad del partido, tu amigo dice: \"Ya me cansé de correr, voy a descansar en la sombra un momento\". ¿Cómo respondes?",
    "¡Muy bien! Todos tenemos derecho a parar y descansar sin que nadie se burle.",
    "Cada niño decide cuándo descansar para cuidar su cuerpo.",
    "Acto 3: ¡Diseña tu propia cometa de papel con tus colores favoritos y hazla volar por la colina!",
    "¡Mueve tu cometa por el cielo tocando la pantalla o usando las flechas para atrapar las 5 cintas de viento!",
    "¡Tu cometa voló libre por toda la colina! Toca \"¡Completar Capítulo 3!\" para recibir tu insignia.",

    # Level 4
    "Acto 1: Toca los 4 peligros escondidos en el sendero para repararlos y hacer seguro el juego.",
    "Esta banca con sombra es genial para descansar cuando hace sol.",
    "¡Un punto seguro! Tomar agua mientras jugamos nos mantiene fuertes.",
    "¡Todo el sendero quedó seguro! Ahora vamos a jugar... ¡pero escucha cuando Bombo necesite descansar!",
    "Acto 2: ¡Toca las estrellas para que Bombo brinque y juegue! Cuando Bombo sienta sed o calor, toca la Estación de Pausa.",
    "¡Uf, qué calor! Necesito agua, fruta y sombra antes de seguir brincando.",
    "¡Uf! Jugué mucho y me dio sed. ¿Me das una pausa con agua y sombra?",
    "¡Mmm, qué refrescante! Ahora sí puedo seguir jugando feliz.",
    "¡Excelente pausa! Completamos todo el recorrido con energía sana.",
    "¡Lo lograste! Jugaste con energía y respetaste cada pausa. Vamos al Acto 3.",
    "Acto 3: Une cada señal de tu cuerpo con el cuidado que necesita mientras juegas.",
    "¡Sabes cuidar tu cuerpo mientras juegas! Ya puedes reclamar tu insignia Corazón Sabio.",

    # Level 5
    "Acto 1: Ordena del 1 al 4 los pasos de nuestra rutina tranquila para descansar bien.",
    "¡Qué buena rutina nocturna! Ahora apaguemos los ruidos y pantallas roba-sueños de la aldea.",
    "Acto 2: Toca los 5 roba-sueños para apagarlos con suavidad y liberar luciérnagas tranquilas.",
    "¡Qué paz se siente con las luciérnagas! Vamos al último paso: respirar con la nube mágica.",
    "Acto 3: Mantén presionada la nube mágica mientras crece para inhalar suave, y suéltala para exhalar.",
    "Acto 3: Responde estas dos preguntas sobre el buen dormir antes de respirar con la nube mágica.",
    "¡Exacto! Dormir bien es un derecho que cuida nuestro cerebro, corazón y ganas de jugar.",
    "Sin descanso nocturno amanecemos cansados y sin ánimo para aprender ni jugar.",
    "Ya es hora de dormir, pero la luz de la tablet nos quita el sueño. ¿Qué protege nuestro descanso?",
    "¡Muy bien! Apagar pantallas antes de dormir invita a los sueños felices.",
    "La luz brillante engaña al cerebro y roba el sueño que tu cuerpo merece.",
    "¡Ahora sí! Mantén presionada la nube mágica mientras crece para inhalar suave, y suéltala para exhalar.",
    "¡Qué descanso tan bonito! Ya reparaste todo el reloj. Toca \"¡Completar Capítulo 5!\" para tu gran diploma.",

    # Story Bridges (10 adventure transitions)
    "Las cinco chispas del juego despertaron las manecillas de la mañana. Ahora crucemos el puente de papel hasta la gran balanza para organizar una tarde feliz.",
    "Tu reloj ya late en equilibrio entre deber, juego y descanso. En el patio de papel te esperan amigos con preguntas reales para defender el recreo.",
    "Con la rampa, el columpio adaptado, la sombra tranquila y la mesa baja listos, ¡mira quiénes vienen caminando por el sendero para jugar contigo!",
    "Cada amigo encontró su lugar favorito y nadie quedó fuera. Ahora revisemos el buzón del parque para asegurar que todas las reglas sean justas.",
    "Cada niño recibió su juguete elegido con libertad y sin etiquetas. Ahora sigamos el sendero de la colina donde el grupo quiere acordar un juego entre todos.",
    "¡Escucharse y turnarse llenó el frasco de amistad! Sube a la cima de la colina para construir y volar tu propia cometa de papel.",
    "Reparaste los juegos y despejaste cada peligro del camino. Ahora corre y brinca conmigo por el parque, ¡y recuerda cuidar tu cuerpo cuando pida pausa!",
    "Tomar agua y reposar a tiempo devolvió la sonrisa a Bombo. Acompáñame al mirador del atardecer para reconocer todas las señales del cuerpo.",
    "Ordenaste la rutina nocturna paso a paso como un guardián sabio. Entremos de puntitas al dormitorio estrellado para calmar los ruidos roba-sueños.",
    "Todas las pantallas descansan y la calma abraza la habitación. Acompáñame a la nube mágica para descubrir secretos del buen dormir y respirar profundo.",
]


def normalize_key(text: str) -> str:
    clean = text.strip()
    clean = clean.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    clean = re.sub(r"\s+", " ", clean)
    return clean.lower()


async def synth_one(sem: asyncio.Semaphore, idx: int, text: str) -> tuple[str, str]:
    filename = f"v{idx:03d}.mp3"
    out_file = OUT_DIR / filename
    key = normalize_key(text)

    if out_file.exists() and out_file.stat().st_size > 1000:
        return key, f"/audio/voice/{filename}"

    async with sem:
        last_err = None
        for attempt in range(3):
            try:
                communicate = edge_tts.Communicate(text, voice=VOICE, rate=RATE, pitch=PITCH)
                await communicate.save(str(out_file))
                if out_file.exists() and out_file.stat().st_size > 1000:
                    return key, f"/audio/voice/{filename}"
            except Exception as exc:
                last_err = exc
                await asyncio.sleep(0.8 * (attempt + 1))
        raise RuntimeError(f"Failed synthesizing {filename}: {last_err}")


async def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # Deduplicate preserving order
    seen: set[str] = set()
    unique_phrases: list[str] = []
    for p in PHRASES:
        k = normalize_key(p)
        if k not in seen:
            seen.add(k)
            unique_phrases.append(p)

    sem = asyncio.Semaphore(6)
    tasks = [synth_one(sem, i + 1, p) for i, p in enumerate(unique_phrases)]
    results = await asyncio.gather(*tasks)

    lines = [
        "export function normalizeVoiceKey(text: string): string {",
        "  return text",
        "    .trim()",
        "    .replace(/[“”]/g, '\"')",
        "    .replace(/[‘’]/g, \"'\")",
        "    .replace(/\\s+/g, ' ')",
        "    .toLowerCase()",
        "}",
        "",
        "export const VOICE_MANIFEST: Readonly<Record<string, string>> = {",
    ]
    for key, path in results:
        escaped_key = key.replace("\\", "\\\\").replace("'", "\\'")
        lines.append(f"  '{escaped_key}': '{path}',")
    lines.append("}")
    lines.append("")

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated {len(results)} female Spanish neural voice clips in {OUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
