const notes = [
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
let finished = false;

const staff = document.querySelector("#staff");
const message = document.querySelector("#message");
const counter = document.querySelector("#counter");

function noteToMidi(note) {
  const match = note.match(/^([A-G])(#|b)?(\d)$/);

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

  let value =
    12 * (Number(match[3]) + 1) +
    base[match[1]];

  if (match[2] === "#") value++;
  if (match[2] === "b") value--;

  return value;
}

function drawNote() {
  const current = notes[index];

  finished = false;

  counter.textContent =
    `Demo-Note ${index + 1} von ${notes.length}`;

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
    E5: 65
  };

  const bassPositions = {
    C3: 175,
    D3: 165,
    E3: 155,
    F3: 145,
    G3: 135,
    A3: 125,
    B3: 115,
    C4: 105,
    D4: 95
  };

  const positions =
    current.clef === "treble"
      ? treblePositions
      : bassPositions;

  const noteY = positions[current.n] ?? 95;
  const noteX = 140;

  let extraLines = "";

  if (noteY < 55) {
    extraLines += `
      <line
        x1="${noteX - 18}"
        y1="55"
        x2="${noteX + 18}"
        y2="55"
        stroke="#333"
        stroke-width="2"
      />
    `;
  }

  if (noteY > 135) {
    extraLines += `
      <line
        x1="${noteX - 18}"
        y1="155"
        x2="${noteX + 18}"
        y2="155"
        stroke="#333"
        stroke-width="2"
      />
    `;
  }

  staff.innerHTML = `
    <svg
      viewBox="0 0 700 210"
      role="img"
      aria-label="Aktuelle Musiknote"
    >

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
        ${current.clef === "treble" ? "𝄞" : "𝄢"}
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

function buildKeyboard() {
  const keyboard = document.querySelector("#keyboard");

  keyboard.innerHTML = "";

  const noteNames = [
    "C", "C#", "D", "D#", "E", "F",
    "F#", "G", "G#", "A", "A#", "B"
  ];

  const blackPitchClasses = [1, 3, 6, 8, 10];

  let whiteIndex = 0;

  // 88 Tasten: A0 bis C8
  for (let midi = 21; midi <= 108; midi++) {
    const pitchClass = midi % 12;
    const name = noteNames[pitchClass];
    const octave = Math.floor(midi / 12) - 1;

    if (!name.includes("#")) {
      const key = document.createElement("button");

      key.className = "white";
      key.dataset.midi = midi;
      key.type = "button";

      key.innerHTML = `
        <span>${name}${octave}</span>
      `;

      keyboard.appendChild(key);

      whiteIndex++;
    }
  }

  // Schwarze Tasten
  whiteIndex = 0;

  for (let midi = 21; midi <= 108; midi++) {
    const pitchClass = midi % 12;

    if (blackPitchClasses.includes(pitchClass)) {
      const key = document.createElement("button");

      key.className = "black";
      key.dataset.midi = midi;
      key.type = "button";

      // Position zwischen den weißen Tasten
      key.style.left =
        `${whiteIndex * 42}px`;

      keyboard.appendChild(key);
    } else {
      whiteIndex++;
    }
  }
}

function handleKeyPress(event) {
  const key = event.target.closest("[data-midi]");

  if (!key || finished) return;

  const selectedMidi =
    Number(key.dataset.midi);

  const correctMidi =
    noteToMidi(notes[index].n);

  if (selectedMidi === correctMidi) {

    message.textContent =
      "✓ Richtig!";

    index++;

    if (index >= notes.length) {
      finished = true;

      counter.textContent =
        "Alle Demo-Noten geschafft!";

      message.textContent =
        "✓ Geschafft! Tippe auf „Neue Note“ für eine neue Runde.";

      return;
    }

    setTimeout(() => {
      drawNote();
    }, 350);

  } else {

    message.textContent =
      "Noch nicht – suche weiter.";

  }
}

document.addEventListener(
  "click",
  handleKeyPress
);

document.querySelector("#newBtn")
  .addEventListener("click", () => {

    index =
      Math.floor(
        Math.random() * notes.length
      );

    drawNote();
  });

buildKeyboard();
drawNote();