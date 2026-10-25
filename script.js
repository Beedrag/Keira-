
const story = document.querySelector("#story");
const stage = document.querySelector("#stage");

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (start, end, value) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

const lerp = (start, end, t) =>
  start + (end - start) * t;

// =========================================
// VIGNETTE SETTINGS — EDIT DI SINI
// =========================================

const vignetteSettings = {
  scene1: { radiusX: 71, radiusY: 71, feather: 0 },
  scene2: { radiusX: 71, radiusY: 71, feather: 100 },
  scene3: { radiusX: 71, radiusY: 71, feather: 400 },
  scene4: { radiusX: 0, radiusY: 0, feather: 4000 },
};

// =========================================
// SCENE TRANSITION TIMING
// =========================================

const vignetteTransitions = [
  { start: 0.12, end: 0.52, from: "scene1", to: "scene2" },
  { start: 0.52, end: 0.82, from: "scene2", to: "scene3" },
  { start: 0.82, end: 0.98, from: "scene3", to: "scene4" },
];

// =========================================
// SCENE 3 / SCENE 4 TIMING
// =========================================

const SCENE4_START = 2 / 3;

let ticking = false;

// =========================================
// MAIN SCROLL UPDATE
// =========================================

function updateStory() {
  if (!story || !stage) {
    ticking = false;
    return;
  }

  const rect = story.getBoundingClientRect();

  const scrollableDistance =
    story.offsetHeight - window.innerHeight;

  // OVERALL SCROLL PROGRESS

  const scrollProgress = clamp(
    -rect.top / Math.max(1, scrollableDistance)
  );

  // SCENE 1–3 PROGRESS

  const progress = clamp(
    scrollProgress / SCENE4_START
  );

  // SCENE 4 PROGRESS

  const scene4Progress = smoothstep(
    SCENE4_START,
    1,
    scrollProgress
  );

  stage.style.setProperty(
    "--scene4-background",
    scene4Progress
  );

  stage.style.setProperty(
    "--scene4-opacity",
    scene4Progress
  );

  // HOOK — FADE IN AFTER THE PAPER APPEARS

  const hookProgress = smoothstep(
    0.92,
    1.00,
    scene4Progress
  );

  stage.style.setProperty(
    "--hook-progress",
    hookProgress
  );

  // SCENE 1–3 ANIMATION PROGRESS

  const bloom = smoothstep(0.02, 0.36, progress);
  const reveal = smoothstep(0.52, 0.82, progress);
  const titleReveal = smoothstep(0.64, 0.82, progress);
  const noteReveal = smoothstep(0.76, 0.91, progress);
  const atmosphere = smoothstep(0.08, 0.95, progress);

  // EXISTING SOLID BACKGROUND — SCENE 1–3

  const solidOpacity =
    0.5 * smoothstep(0.15, 0.82, progress);

  const solidProgress =
    smoothstep(0.35, 0.82, progress);

  stage.style.setProperty("--progress", progress);
  stage.style.setProperty("--solid-opacity", solidOpacity);
  stage.style.setProperty("--solid-progress", solidProgress);

  // EXISTING SCENE ANIMATIONS

  stage.style.setProperty("--bloom", bloom);
  stage.style.setProperty("--reveal", reveal);
  stage.style.setProperty("--title-reveal", titleReveal);
  stage.style.setProperty("--note-reveal", noteReveal);
  stage.style.setProperty("--atmosphere", atmosphere);

  // VIGNETTE

  let fromSettings;
  let toSettings;
  let transitionProgress = 0;

  if (progress < vignetteTransitions[0].start) {
    fromSettings = vignetteSettings.scene1;
    toSettings = vignetteSettings.scene1;

  } else if (
    progress >=
    vignetteTransitions[vignetteTransitions.length - 1].end
  ) {
    fromSettings = vignetteSettings.scene4;
    toSettings = vignetteSettings.scene4;

  } else {
    const transition = vignetteTransitions.find(
      (item) =>
        progress >= item.start &&
        progress < item.end
    );

    if (transition) {
      fromSettings = vignetteSettings[transition.from];
      toSettings = vignetteSettings[transition.to];

      transitionProgress = smoothstep(
        transition.start,
        transition.end,
        progress
      );
    } else {
      fromSettings = vignetteSettings.scene1;
      toSettings = vignetteSettings.scene1;
    }
  }

  const radiusX = lerp(
    fromSettings.radiusX,
    toSettings.radiusX,
    transitionProgress
  );

  const radiusY = lerp(
    fromSettings.radiusY,
    toSettings.radiusY,
    transitionProgress
  );

  const feather = lerp(
    fromSettings.feather,
    toSettings.feather,
    transitionProgress
  );

  stage.style.setProperty("--radius-x", `${radiusX}%`);
  stage.style.setProperty("--radius-y", `${radiusY}%`);
  stage.style.setProperty("--feather", `${feather}px`);

  ticking = false;
}

// =========================================
// SCROLL PERFORMANCE
// =========================================

function requestUpdate() {
  if (ticking) return;

  ticking = true;
  requestAnimationFrame(updateStory);
}

window.addEventListener("scroll", requestUpdate, {
  passive: true,
});

window.addEventListener("resize", requestUpdate);

updateStory();

// =========================================
// SCENE 8 — BLOW OUT BIRTHDAY CANDLES
// =========================================

const candles = document.querySelector("#birthday-cake .candles");

const flames = document.querySelectorAll(
  "#birthday-cake .flame, #birthday-cake .flame2, #birthday-cake .flame3"
);

const cake = document.querySelector("#birthday-cake");

if (cake) {
  cake.addEventListener("click", () => {
    cake.classList.add("blown");

    cake.querySelectorAll(".flame, .flame2, .flame3")
      .forEach((flame) => {
        flame.style.display = "none";
      });
  });
}


/* =========================================================
   NEW EFFECTS — PETALS & TWINKLING STARS
========================================================= */

(() => {
  const petalLayer = document.querySelector("#petal-layer");
  const twinkleLayer = document.querySelector("#twinkle-layer");
  const story = document.querySelector("#story");

  if (!petalLayer || !twinkleLayer || !story) return;

  /* -------------------------------------------------------
     CREATE FALLING PETALS
     Visible during Scenes 1–3.
  ------------------------------------------------------- */

  const petalCount = window.innerWidth <= 600 ? 12 : 22;
  const petalFragment = document.createDocumentFragment();

  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement("span");

    petal.className = "falling-petal";

    petal.style.setProperty(
      "--petal-left",
      `${Math.random() * 100}%`
    );

    petal.style.setProperty(
      "--petal-size",
      `${7 + Math.random() * 10}px`
    );

    petal.style.setProperty(
      "--petal-duration",
      `${9 + Math.random() * 12}s`
    );

    petal.style.setProperty(
      "--petal-delay",
      `${-Math.random() * 20}s`
    );

    petal.style.setProperty(
      "--petal-opacity",
      `${0.35 + Math.random() * 0.5}`
    );

    petalFragment.appendChild(petal);
  }

  petalLayer.appendChild(petalFragment);

  /* -------------------------------------------------------
     CREATE TWINKLING STARS
  ------------------------------------------------------- */

  const starCount = window.innerWidth <= 600 ? 24 : 42;
  const starFragment = document.createDocumentFragment();

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("span");

    star.className = "twinkle-star";

    star.style.setProperty(
      "--star-left",
      `${Math.random() * 100}%`
    );

    star.style.setProperty(
      "--star-top",
      `${Math.random() * 100}%`
    );

    star.style.setProperty(
      "--star-size",
      `${1.5 + Math.random() * 2}px`
    );

    star.style.setProperty(
      "--star-duration",
      `${2 + Math.random() * 4}s`
    );

    star.style.setProperty(
      "--star-delay",
      `${-Math.random() * 6}s`
    );

    starFragment.appendChild(star);
  }

  twinkleLayer.appendChild(starFragment);

  
  /* -------------------------------------------------------
     SWITCH EFFECTS — SCENE 4 THROUGH SCENE 8
  ------------------------------------------------------- */

  function updateEffects() {
    const storyRect = story.getBoundingClientRect();

    const scrollableDistance = Math.max(
      1,
      story.offsetHeight - window.innerHeight
    );

    // Match the same scroll progress used by updateStory().
    // Progress remains at 1 after the pinned story ends.
    const storyProgress = clamp(
      -storyRect.top / scrollableDistance
    );

    // Stars begin when Scene 4 starts and stay visible
    // through Scene 7 and Scene 8, including the cake.
    const showStars = storyProgress >= SCENE4_START;

    twinkleLayer.classList.toggle(
      "is-visible",
      showStars
    );

    // Petals gradually disappear as Scene 4 takes over.
    const scene4Progress = smoothstep(
      SCENE4_START,
      1,
      storyProgress
    );

    petalLayer.style.opacity = String(
      1 - scene4Progress
    );
  }

  window.addEventListener("scroll", updateEffects, {
    passive: true
  });

  window.addEventListener("resize", updateEffects);

  updateEffects();
})();


/* =========================================
   SCENE 8 — CONFETTI FROM BOTH SIDES
========================================= */

(() => {
  const confettiLayer = document.querySelector("#confetti-layer");
  const cakeScene = document.querySelector("#scene8");

  if (!confettiLayer || !cakeScene) return;

  let hasBurst = false;
  let previousVisible = false;

  function launchConfetti() {
    confettiLayer.replaceChildren();
    confettiLayer.classList.add("is-active");

    const colors = [
      "#ffd166",
      "#ff6b9a",
      "#c8a6ff",
      "#8ee3ef",
      "#fff0a8",
      "#ff8c69"
    ];

    const countPerSide = window.innerWidth <= 600 ? 28 : 55;

    for (let i = 0; i < countPerSide * 2; i++) {
      const fromLeft = i < countPerSide;
      const piece = document.createElement("span");

      piece.className = "birthday-confetti";

      piece.style.setProperty(
        "--confetti-left",
        fromLeft ? `${Math.random() * 8}%` : `${92 + Math.random() * 8}%`
      );

      piece.style.setProperty(
        "--confetti-top",
        `${15 + Math.random() * 55}%`
      );

      piece.style.setProperty(
        "--confetti-width",
        `${5 + Math.random() * 5}px`
      );

      piece.style.setProperty(
        "--confetti-height",
        `${8 + Math.random() * 8}px`
      );

      piece.style.setProperty(
        "--confetti-color",
        colors[Math.floor(Math.random() * colors.length)]
      );

      piece.style.setProperty(
        "--confetti-x",
        fromLeft
          ? `${20 + Math.random() * 65}vw`
          : `${-(20 + Math.random() * 65)}vw`
      );

      piece.style.setProperty(
        "--confetti-y",
        `${20 + Math.random() * 65}vh`
      );

      piece.style.setProperty(
        "--confetti-rotation",
        `${Math.random() * 1440 - 720}deg`
      );

      piece.style.setProperty(
        "--confetti-duration",
        `${2 + Math.random() * 2}s`
      );

      piece.style.setProperty(
        "--confetti-delay",
        `${Math.random() * 0.45}s`
      );

      confettiLayer.appendChild(piece);
    }

    window.setTimeout(() => {
      confettiLayer.classList.remove("is-active");
      confettiLayer.replaceChildren();
    }, 5000);
  }

  function checkCakeScene() {
    const rect = cakeScene.getBoundingClientRect();

    const visible =
      rect.top < window.innerHeight * 0.75 &&
      rect.bottom > window.innerHeight * 0.25;

    if (visible && !previousVisible && !hasBurst) {
      hasBurst = true;
      launchConfetti();
    }

    // Allow the effect to trigger again after leaving
    // the cake scene and scrolling back to it.
    if (!visible && previousVisible) {
      hasBurst = false;
    }

    previousVisible = visible;
  }

  window.addEventListener("scroll", checkCakeScene, {
    passive: true
  });

  window.addEventListener("resize", checkCakeScene);

  checkCakeScene();
})();


/* =========================================
   CONFETTI — WHEN HAPPY BIRTHDAY APPEARS
========================================= */

(() => {
  const layer = document.querySelector("#confetti-layer");
  const cake = document.querySelector("#birthday-cake");
  const birthdayText = cake?.querySelector(".text");

  if (!layer || !cake || !birthdayText) {
    console.error("Confetti: element tidak ditemukan.");
    return;
  }

  const colors = [
    "#ffd166",
    "#ff6b9a",
    "#c8a6ff",
    "#8ee3ef",
    "#fff0a8",
    "#ff8c69"
  ];

  let wasVisible = false;
  let timeoutId;

  function launchConfetti() {
    layer.replaceChildren();
    layer.classList.add("is-active");

    const perSide = window.innerWidth <= 600 ? 30 : 55;

    for (let i = 0; i < perSide * 2; i++) {
      const fromLeft = i < perSide;
      const piece = document.createElement("span");

      piece.className = "birthday-confetti";

      piece.style.left = fromLeft
        ? `${Math.random() * 7}%`
        : `${93 + Math.random() * 7}%`;

      piece.style.top = `${15 + Math.random() * 55}%`;
      piece.style.width = `${5 + Math.random() * 5}px`;
      piece.style.height = `${8 + Math.random() * 8}px`;
      piece.style.background =
        colors[Math.floor(Math.random() * colors.length)];

      piece.style.setProperty(
        "--confetti-x",
        fromLeft
          ? `${25 + Math.random() * 60}vw`
          : `${-(25 + Math.random() * 60)}vw`
      );

      piece.style.setProperty(
        "--confetti-y",
        `${25 + Math.random() * 65}vh`
      );

      piece.style.setProperty(
        "--confetti-rotation",
        `${Math.random() * 1440 - 720}deg`
      );

      piece.style.setProperty(
        "--confetti-duration",
        `${2.5 + Math.random() * 1.5}s`
      );

      piece.style.setProperty(
        "--confetti-delay",
        `${Math.random() * 0.35}s`
      );

      layer.appendChild(piece);
    }

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      layer.classList.remove("is-active");
      layer.replaceChildren();
    }, 5000);
  }

  function checkBirthdayText() {
    const visible =
      cake.classList.contains("blown") &&
      getComputedStyle(birthdayText).opacity > 0.5;

    if (visible && !wasVisible) {
      launchConfetti();
    }

    wasVisible = visible;
  }

  // Detect the actual CSS transition that reveals the text.
  const observer = new MutationObserver(checkBirthdayText);

  observer.observe(cake, {
    attributes: true,
    attributeFilter: ["class"]
  });

  // Catch the text's opacity transition after the candle is blown.
  birthdayText.addEventListener("transitionrun", checkBirthdayText);
  birthdayText.addEventListener("transitionend", checkBirthdayText);

  // Check periodically while the text is transitioning.
  let lastOpacity = "";

  function monitorText() {
    const opacity = getComputedStyle(birthdayText).opacity;

    if (opacity !== lastOpacity) {
      lastOpacity = opacity;
      checkBirthdayText();
    }

    requestAnimationFrame(monitorText);
  }

  monitorText();
})();


/* =========================================
   COUNTDOWN OPENING
   Spin 0.5s -> Petals burst from both sides
========================================= */

(() => {
  const timer = document.querySelector(".countdown-scene .timer");
  const petalLayer = document.querySelector("#petal-layer");

  if (!timer || !petalLayer) {
    console.error("Countdown opening: element tidak ditemukan.");
    return;
  }

  // Prevent duplicate animation if the script is initialized again.
  if (timer.dataset.openingPlayed === "true") return;
  timer.dataset.openingPlayed = "true";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function launchCountdownPetals() {
    const countPerSide = window.innerWidth <= 600 ? 16 : 32;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < countPerSide * 2; i++) {
      const fromLeft = i < countPerSide;
      const petal = document.createElement("span");

      petal.className = "countdown-burst-petal";

      const startX = fromLeft
        ? Math.random() * 8
        : 92 + Math.random() * 8;

      const distanceX = 25 + Math.random() * 65;

      petal.style.setProperty("--burst-left", `${startX}%`);
      petal.style.setProperty(
        "--burst-top",
        `${15 + Math.random() * 65}%`
      );
      petal.style.setProperty(
        "--burst-size",
        `${7 + Math.random() * 11}px`
      );
      petal.style.setProperty(
        "--burst-x",
        `${fromLeft ? distanceX : -distanceX}vw`
      );
      petal.style.setProperty(
        "--burst-y",
        `${-15 + Math.random() * 90}vh`
      );
      petal.style.setProperty(
        "--burst-rotation",
        `${Math.random() * 1080 - 540}deg`
      );
      petal.style.setProperty(
        "--burst-duration",
        `${1.4 + Math.random() * 1.4}s`
      );
      petal.style.setProperty(
        "--burst-delay",
        `${Math.random() * 0.18}s`
      );

      fragment.appendChild(petal);

      petal.addEventListener("animationend", () => {
        petal.remove();
      }, { once: true });
    }

    petalLayer.appendChild(fragment);
  }

  function startOpening() {
    // Countdown starts with its existing 00:00:00 display.
    if (!reducedMotion) {
      timer.classList.add("is-spinning");
    }

    // Always wait 500ms before launching petals.
    window.setTimeout(() => {
      timer.classList.remove("is-spinning");
      launchCountdownPetals();
    }, 500);
  }

  // Start once the browser has rendered the page.
  requestAnimationFrame(startOpening);
})();
