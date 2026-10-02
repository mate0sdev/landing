/*
 * Todo lo editable de la landing vive aquí.
 * Email y LinkedIn: déjalos vacíos ("") y no se muestran.
 */
export const PROFILE = {
  alias: "mate0s",
  github: "https://github.com/mate0sdev",
  email: "",
  linkedin: "",
};

export const TEXT = {
  es: {
    lang: "es",
    title: "mate0s · desarrollador full stack",
    tagline: "Desarrollador full stack. Me gusta el código rápido y el que se entiende.",
    pitch: "Gánale puntos al bug y te voy contando el resto.",
    skip: "Verlo todo sin jugar",
    playAgain: "Seguir jugando",
    serve: "Sacar",
    serveHint: "Mueve la pala con el ratón, el dedo o las flechas. Espacio para sacar.",
    you: "Tú",
    bug: "Bug",
    courtLabel: "Pista de pádel vista desde arriba. Tu pala está abajo; el bug, arriba.",
    locked: "Gana el {score} para verlo.",
    chapters: [
      {
        score: "15",
        title: "Quién soy",
        body: [
          "Técnico Superior en Desarrollo de Aplicaciones Multiplataforma (DAM).",
          "Trabajo en las dos mitades de la pista: lo que ves en pantalla y lo que pasa en el servidor. Me gusta que todo vaya rápido y saber exactamente por qué.",
        ],
      },
      {
        score: "30",
        title: "Dónde juego",
        body: [
          "Full stack en Kometasoft: plataformas web de principio a fin, de la plantilla a la base de datos.",
          "Entre otros proyectos, he participado en SNP Galaxy.",
        ],
      },
      {
        score: "40",
        title: "Con qué pala juego",
        stack: ["PHP", "JavaScript", "HTML y CSS", "Smarty (.tpl)", "jQuery y AJAX", "Doctrine ORM", "MySQL"],
      },
      {
        score: "Juego",
        title: "Hablemos",
        body: ["¿Un proyecto, una oferta o una revancha? Aquí me encuentras."],
        contact: true,
      },
    ],
    point: (title) => `¡Punto tuyo! Desbloqueado: ${title}.`,
    pointRepeat: "¡Punto tuyo!",
    bugPoint: [
      "Punto para el bug. Salió por la reja.",
      "El bug lo devuelve todo. Como un catch vacío.",
      "Bajada de pared fallida. Pasa en las mejores familias.",
      "Punto del bug. Nadie revisó ese PR.",
      "El bug cerró la red. Toca revancha.",
    ],
    bugGame: "Juego para el bug. Lo que has desbloqueado se queda. Revancha cuando quieras.",
    youGame: "Juego tuyo. Ya lo sabes todo de mí; la bola vuelve a su sitio.",
    skipped: "Todo a la vista. Puedes seguir jugando igualmente.",
    wall: "¡Cristal!",
    footer: "Punto de oro, sin ventaja. Como en las Series.",
  },
  en: {
    lang: "en",
    title: "mate0s · full stack developer",
    tagline: "Full stack developer. I like fast code and code that makes sense.",
    pitch: "Win points off the bug and I'll tell you the rest.",
    skip: "Show everything, skip the game",
    playAgain: "Keep playing",
    serve: "Serve",
    serveHint: "Move the paddle with your mouse, finger or arrow keys. Space to serve.",
    you: "You",
    bug: "Bug",
    courtLabel: "Padel court seen from above. Your paddle is at the bottom; the bug is at the top.",
    locked: "Win the {score} to see this.",
    chapters: [
      {
        score: "15",
        title: "Who I am",
        body: [
          "Higher Technician in Multiplatform Application Development (DAM, Spain).",
          "I play both halves of the court: what you see on screen and what happens on the server. I like things to be fast and to know exactly why.",
        ],
      },
      {
        score: "30",
        title: "Where I play",
        body: [
          "Full stack at Kometasoft: web platforms end to end, from the template to the database.",
          "Among other projects, I've worked on SNP Galaxy.",
        ],
      },
      {
        score: "40",
        title: "My paddle",
        stack: ["PHP", "JavaScript", "HTML & CSS", "Smarty (.tpl)", "jQuery & AJAX", "Doctrine ORM", "MySQL"],
      },
      {
        score: "Game",
        title: "Let's talk",
        body: ["A project, a job offer or a rematch? Here's where to find me."],
        contact: true,
      },
    ],
    point: (title) => `Your point! Unlocked: ${title}.`,
    pointRepeat: "Your point!",
    bugPoint: [
      "Point to the bug. Out through the fence.",
      "The bug returns everything. Like an empty catch.",
      "Missed the off-the-glass shot. Happens to the best of us.",
      "Bug's point. Nobody reviewed that PR.",
      "The bug closed the net. Rematch time.",
    ],
    bugGame: "Game to the bug. Whatever you unlocked stays. Rematch anytime.",
    youGame: "Your game. Now you know all about me; the ball goes back home.",
    skipped: "Everything's out. You can keep playing anyway.",
    wall: "Glass!",
    footer: "Golden point, no advantage. Just like the Series.",
  },
};
