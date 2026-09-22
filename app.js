let notes = [
  { n: "C4", clef: "treble" },
  { n: "E4", clef: "treble" },
  { n: "G4", clef: "treble" },
  { n: "F3", clef: "bass" },
  { n: "A3", clef: "bass" },
  { n: "C4", clef: "bass" },
  { n: "D5", clef: "treble" },
  { n: "B3", clef: "treble" }
];

let index = 0;
let showNames = true;

const ranges = {
  practice: {
    start: 40,
    end: 93
  },

  full: {
    start: 21,
    end: 108
  },

  custom: {
    start: 40,
    end: 93
  }
};

let currentRange = "practice";

const staff = document.querySelector("#staff");
const message = document.querySelector("#message");
const counter = document.querySelector("#counter");
const keyboard = document.querySelector("#keyboard");
const namesBtn = document.querySelector("#namesBtn");


/* =========================
   NOTEN / MIDI
========================= */

function noteToMidi(note) {

  const match =
    note.match(/^([A-G])(#|b)?(\d)$/);

  if (!match) return null;

  const base = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11
  };

  let midi =
    12 * (Number(match[3]) + 1) +
    base[match[1]];

  if (match[2] === "#") midi++;
  if (match[2] === "b") midi--;

  return midi;
}


function midiToGermanName(midi) {

  const names = [
    "C",
    "Cis",
    "D",
    "Dis",
    "E",
    "F",
    "Fis",
    "G",
    "Gis",
    "A",
    "B",
    "H"
  ];

  const octave =
    Math.floor(midi / 12) - 1;

  return names[midi % 12] + octave;
}


/* =========================
   NOTENBLATT DARSTELLEN
========================= */

function drawNote() {

  const current = notes[index];

  counter.textContent =
    `Note ${index + 1} von ${notes.length}`;

  message.textContent =
    "Suche die Note auf dem Klavier.";

  const lines = [55, 75, 95, 115, 135];

  const treblePositions = {

    C4: 155,
    D4: 145,
    E4: 135,
    F4: 125,
    G4: 115,
    A4: 105,
    B4: 95,

    C5: 85,
    D5: 75,
    E5: 65,

    F5: 55,
    G5: 45,
    A5: 35
  };

  const bassPositions = {

    C2: 215,
    D2: 205,
    E2: 195,
    F2: 185,
    G2: 175,
    A2: 165,
    B2: 155,

    C3: 145,
    D3: 135,
    E3: 125,
    F3: 115,
    G3: 105,
    A3: 95,
    B3: 85,

    C4: 75
  };

  const positions =
    current.clef === "treble"
      ? treblePositions
      : bassPositions;

  const noteY =
    positions[current.n] ?? 95;

  const noteX = 250;

  let extraLines = "";

  if (
    noteY < 55 ||
    noteY > 135
  ) {

    const nearestLine =
      Math.round(
        (noteY - 55) / 20
      ) * 20 + 55;

    extraLines += `
      <line
        x1="${noteX - 22}"
        y1="${nearestLine}"
        x2="${noteX + 22}"
        y2="${nearestLine}"
        stroke="#333"
        stroke-width="2"
      />
    `;
  }

  staff.innerHTML = `
    <svg viewBox="0 0 700 210">

      <g stroke="#333" stroke-width="2">

        ${lines.map(y => `
          <line
            x1="45"
            y1="${y}"
            x2="660"
            y2="${y}"
          />
        `).join("")}

      </g>

      <text
        x="55"
        y="125"
        font-size="70"
        font-family="serif"
      >
        ${current.clef === "treble"
          ? "𝄞"
          : "𝄢"}
      </text>

      ${extraLines}

      <ellipse
        cx="${noteX}"
        cy="${noteY}"
        rx="12"
        ry="9"
        fill="#111827"
        transform="
          rotate(-18 ${noteX} ${noteY})
        "
      />

      <line
        x1="${noteX + 9}"
        y1="${noteY}"
        x2="${noteX + 9}"
        y2="${noteY - 55}"
        stroke="#111827"
        stroke-width="2"
      />

    </svg>
  `;
}


/* =========================
   KLAVIER
========================= */

function buildKeyboard() {

  keyboard.innerHTML = "";

  const range =
    ranges[currentRange];

  const blackNotes =
    [1, 3, 6, 8, 10];

  let whiteCount = 0;

  for (
    let midi = range.start;
    midi <= range.end;
    midi++
  ) {

    if (
      !blackNotes.includes(
        midi % 12
      )
    ) {
      whiteCount++;
    }
  }

  const whiteWidth = 48;
  const blackWidth = 30;

  let whiteIndex = 0;

  for (
    let midi = range.start;
    midi <= range.end;
    midi++
  ) {

    const pitchClass =
      midi % 12;

    if (
      blackNotes.includes(pitchClass)
    ) {
      continue;
    }

    const key =
      document.createElement("button");

    key.className = "white";

    key.dataset.midi = midi;

    key.type = "button";

    key.style.width =
      `${whiteWidth}px`;

    key.style.left =
      `${whiteIndex * whiteWidth}px`;

    if (showNames) {

      key.innerHTML =
        `<span>
          ${midiToGermanName(midi)}
        </span>`;
    }

    keyboard.appendChild(key);

    whiteIndex++;
  }

  whiteIndex = 0;

  for (
    let midi = range.start;
    midi <= range.end;
    midi++
  ) {

    const pitchClass =
      midi % 12;

    if (
      blackNotes.includes(pitchClass)
    ) {

      const key =
        document.createElement("button");

      key.className = "black";

      key.dataset.midi = midi;

      key.type = "button";

      key.style.width =
        `${blackWidth}px`;

      key.style.left =
        `${whiteIndex * whiteWidth -
          blackWidth / 2}px`;

      keyboard.appendChild(key);

    } else {

      whiteIndex++;
    }
  }

  keyboard.style.width =
    `${whiteCount * whiteWidth}px`;

  keyboard.style.minWidth =
    `${whiteCount * whiteWidth}px`;
}


/* =========================
   TASTE DRÜCKEN
========================= */

function handleKeyPress(event) {

  const key =
    event.target.closest(
      "[data-midi]"
    );

  if (!key) return;

  const selectedMidi =
    Number(key.dataset.midi);

  const correctMidi =
    notes[index].midi ??
    noteToMidi(notes[index].n);

  if (
    selectedMidi === correctMidi
  ) {

    message.textContent =
      "✓ Richtig!";

    index++;

    if (
      index >= notes.length
    ) {

      index = 0;

      message.textContent =
        "✓ Geschafft! Neue Runde beginnt.";

      setTimeout(
        drawNote,
        700
      );

      return;
    }

    setTimeout(
      drawNote,
      350
    );

  } else {

    message.textContent =
      "Noch nicht – suche weiter.";
  }
}


document.addEventListener(
  "click",
  handleKeyPress
);


/* =========================
   NEUE RUNDE
========================= */

document
  .querySelector("#newBtn")
  .addEventListener(
    "click",
    () => {

      index =
        Math.floor(
          Math.random() *
          notes.length
        );

      drawNote();
    }
  );


/* =========================
   TASTENBEREICH
========================= */

document
  .querySelectorAll(".range-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        currentRange =
          button.dataset.range;

        document
          .querySelectorAll(".range-btn")
          .forEach(btn =>
            btn.classList.remove(
              "active"
            )
          );

        button.classList.add(
          "active"
        );

        buildKeyboard();
      }
    );
  });


/* =========================
   TASTENNAMEN
========================= */

namesBtn.addEventListener(
  "click",
  () => {

    showNames =
      !showNames;

    namesBtn.textContent =
      showNames
        ? "Tastennamen ausblenden"
        : "Tastennamen anzeigen";

    buildKeyboard();
  }
);


window.addEventListener(
  "resize",
  buildKeyboard
);


/* =========================
   MUSICXML
========================= */

const musicxmlInput =
  document.querySelector(
    "#musicxmlInput"
  );

const musicxmlStatus =
  document.querySelector(
    "#musicxmlStatus"
  );


function pitchToMidi(
  pitch
) {

  const step =
    pitch.querySelector(
      "step"
    )?.textContent;

  const octave =
    Number(
      pitch.querySelector(
        "octave"
      )?.textContent
    );

  const alter =
    Number(
      pitch.querySelector(
        "alter"
      )?.textContent || 0
    );

  const base = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11
  };

  if (
    !(step in base) ||
    Number.isNaN(octave)
  ) {
    return null;
  }

  return (
    12 * (octave + 1) +
    base[step] +
    alter
  );
}


function midiToDisplayName(
  midi
) {

  return midiToGermanName(midi);
}


function readMusicXML(
  xmlText
) {

  const parser =
    new DOMParser();

  const xml =
    parser.parseFromString(
      xmlText,
      "application/xml"
    );

  if (
    xml.querySelector(
      "parsererror"
    )
  ) {
    throw new Error(
      "MusicXML konnte nicht gelesen werden."
    );
  }


  /*
    Wir lesen die beiden Klaviersysteme.
    G = Violinschlüssel
    F = Bassschlüssel
  */

  const clefs = {};

  xml
    .querySelectorAll("clef")
    .forEach(clef => {

      const number =
        clef.getAttribute(
          "number"
        ) || "1";

      const sign =
        clef.querySelector(
          "sign"
        )?.textContent;

      if (sign === "G") {
        clefs[number] =
          "treble";
      }

      if (sign === "F") {
        clefs[number] =
          "bass";
      }
    });


  const imported = [];

  let absoluteMeasureTime = 0;


  xml
    .querySelectorAll("part > measure")
    .forEach(
      measure => {

        let cursor = 0;

        let maxCursor = 0;

        const localNotes = [];

        measure
          .childNodes
          .forEach(node => {

            if (
              node.nodeType !==
              Node.ELEMENT_NODE
            ) {
              return;
            }

            const tag =
              node.localName;


            /*
              backup:
              zurückspringen,
              z.B. von rechter
              auf linke Hand.
            */

            if (tag === "backup") {

              const duration =
                Number(
                  node.querySelector(
                    "duration"
                  )?.textContent || 0
                );

              cursor -= duration;

              return;
            }


            /*
              forward:
              Zeit vorspringen.
            */

            if (tag === "forward") {

              const duration =
                Number(
                  node.querySelector(
                    "duration"
                  )?.textContent || 0
                );

              cursor += duration;

              maxCursor =
                Math.max(
                  maxCursor,
                  cursor
                );

              return;
            }


            if (tag !== "note") {
              return;
            }


            const rest =
              node.querySelector(
                "rest"
              );

            const pitch =
              node.querySelector(
                "pitch"
              );


            /*
              Pausen überspringen.
            */

            if (
              rest ||
              !pitch
            ) {

              const duration =
                Number(
                  node.querySelector(
                    "duration"
                  )?.textContent || 0
                );

              cursor += duration;

              maxCursor =
                Math.max(
                  maxCursor,
                  cursor
                );

              return;
            }


            const midi =
              pitchToMidi(
                pitch
              );

            if (
              midi === null
            ) {
              return;
            }


            const staffNumber =
              node.querySelector(
                "staff"
              )?.textContent || "1";


            const duration =
              Number(
                node.querySelector(
                  "duration"
                )?.textContent || 0
              );


            /*
              <chord> bedeutet:
              Dieser Ton beginnt
              gleichzeitig mit dem
              vorherigen Ton.

              Wir behandeln die Töne
              zunächst einzeln, behalten
              aber ihre gemeinsame Zeit.
            */

            const isChord =
              !!node.querySelector(
                "chord"
              );

            let noteTime =
              cursor;

            if (
              isChord &&
              localNotes.length
            ) {

              noteTime =
                localNotes[
                  localNotes.length - 1
                ].localTime;
            }


            localNotes.push({

              midi,

              n:
                midiToDisplayName(
                  midi
                ),

              clef:
                clefs[staffNumber] ||
                (
                  staffNumber === "2"
                    ? "bass"
                    : "treble"
                ),

              staff:
                staffNumber,

              localTime:
                noteTime,

              duration

            });


            if (!isChord) {

              cursor += duration;

              maxCursor =
                Math.max(
                  maxCursor,
                  cursor
                );
            }

          });


        /*
          Innerhalb eines Taktes:
          zuerst zeitlich,
          bei Gleichstand rechter
          vor linker Hand.
        */

        localNotes
          .sort(
            (a, b) => {

              if (
                a.localTime !==
                b.localTime
              ) {

                return (
                  a.localTime -
                  b.localTime
                );
              }

              return (
                Number(a.staff) -
                Number(b.staff)
              );
            }
          );


        localNotes.forEach(
          note => {

            imported.push({

              ...note,

              absoluteTime:
                absoluteMeasureTime +
                note.localTime
            });

          });


        absoluteMeasureTime +=
          maxCursor;

      }
    );


  /*
    Endgültige musikalische
    Reihenfolge.
  */

  imported.sort(
    (a, b) => {

      if (
        a.absoluteTime !==
        b.absoluteTime
      ) {

        return (
          a.absoluteTime -
          b.absoluteTime
        );
      }

      return (
        Number(a.staff) -
        Number(b.staff)
      );
    }
  );


  if (
    imported.length === 0
  ) {

    throw new Error(
      "Keine spielbaren Noten gefunden."
    );
  }


  /*
    Für unseren ersten
    Trainingsmodus verwenden
    wir einzelne Töne.
  */

  notes =
    imported.map(
      note => ({

        n: note.n,

        midi: note.midi,

        clef: note.clef,

        staff: note.staff

      })
    );


  index = 0;

  drawNote();

  counter.textContent =
    `Notenblatt: Note 1 von ${notes.length}`;

  message.textContent =
    "Das Notenblatt wurde geladen. Suche die erste Note.";

  if (musicxmlStatus) {

    musicxmlStatus.textContent =
      `✓ ${notes.length} spielbare Töne geladen.`;
  }
}


/* =========================
   MUSICXML DATEI ÖFFNEN
========================= */

if (musicxmlInput) {

  musicxmlInput.addEventListener(
    "change",
    async event => {
console.log("MusicXML-Auswahl wurde erkannt");
      const file =
        event.target.files[0];

      if (!file) return;

      if (musicxmlStatus) {

        musicxmlStatus.textContent =
          "⏳ MusicXML wird gelesen …";
      }

      try {

        const xmlText =
          await file.text();

        readMusicXML(
          xmlText
        );

      } catch (error) {

        console.error(error);

        if (musicxmlStatus) {

          musicxmlStatus.textContent =
            "❌ Die MusicXML-Datei konnte nicht gelesen werden.";
        }
      }

    }
  );
}


/* =========================
   START
========================= */

buildKeyboard();
drawNote();
