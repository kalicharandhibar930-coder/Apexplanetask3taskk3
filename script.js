/* ============================================================
   SECTION 1: THREE.JS 3D WIREFRAME SPHERE CANVAS
   ============================================================ */
const canvas = document.getElementById("sphere-canvas");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5.2;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const sphereGroup = new THREE.Group();
scene.add(sphereGroup);

// 1. Outer Cyan Wireframe Sphere (Icosahedron)
const outerGeo = new THREE.IcosahedronGeometry(2.1, 3);
const outerMat = new THREE.MeshBasicMaterial({
  color: 0x00f2fe,
  wireframe: true,
  transparent: true,
  opacity: 0.45
});
const outerSphere = new THREE.Mesh(outerGeo, outerMat);
sphereGroup.add(outerSphere);

// 2. Inner Purple Grid Sphere
const innerGeo = new THREE.SphereGeometry(1.6, 16, 16);
const innerMat = new THREE.MeshBasicMaterial({
  color: 0x9d4edd,
  wireframe: true,
  transparent: true,
  opacity: 0.25
});
const innerSphere = new THREE.Mesh(innerGeo, innerMat);
sphereGroup.add(innerSphere);

// 3. Orbital Ring
const ringGeo = new THREE.TorusGeometry(2.5, 0.015, 8, 64);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0x00f2fe,
  transparent: true,
  opacity: 0.5
});
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 3;
sphereGroup.add(ring);

// 4. Background Dust Particles
const particleCount = 400;
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) {
  particlePositions[i] = (Math.random() - 0.5) * 12;
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMat = new THREE.PointsMaterial({
  size: 0.025,
  color: 0x38bdf8,
  transparent: true,
  opacity: 0.7
});
const particleField = new THREE.Points(particleGeo, particleMat);
scene.add(particleField);

// Interactive Mouse & Touch Drag Controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener("mousedown", (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;

  sphereGroup.rotation.y += deltaX * 0.005;
  sphereGroup.rotation.x += deltaY * 0.005;

  previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener("mouseup", () => { isDragging = false; });

window.addEventListener("touchmove", (e) => {
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const deltaX = touch.clientX - previousMousePosition.x;
    const deltaY = touch.clientY - previousMousePosition.y;
    sphereGroup.rotation.y += deltaX * 0.004;
    sphereGroup.rotation.x += deltaY * 0.004;
    previousMousePosition = { x: touch.clientX, y: touch.clientY };
  }
}, { passive: true });

function animate() {
  requestAnimationFrame(animate);
  sphereGroup.rotation.y += 0.002;
  sphereGroup.rotation.x += 0.001;
  ring.rotation.z -= 0.003;
  particleField.rotation.y += 0.0005;
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ============================================================
   SECTION 2: TASK 02 - 5-QUESTION INTERACTIVE QUIZ
   ============================================================ */
const quizQuestions = [
  {
    q: "Which CSS layout module is designed specifically for two-dimensional grid-based layouts?",
    opts: ["CSS Grid", "Flexbox", "Float", "Inline-block"],
    correct: 0
  },
  {
    q: "Which JavaScript browser API fetches external network data asynchronously?",
    opts: ["JSON.stringify()", "Fetch API", "LocalCache API", "Navigator API"],
    correct: 1
  },
  {
    q: "In mobile-first responsive design, which media query breakpoint parameter is standard?",
    opts: ["max-device-width", "min-width", "max-height", "aspect-ratio: 16/9"],
    correct: 1
  },
  {
    q: "What does the 'await' keyword do inside an async function?",
    opts: ["Halts the entire browser thread", "Pauses execution until the Promise resolves", "Cancels network timeouts", "Reloads DOM elements"],
    correct: 1
  },
  {
    q: "Which CSS property applies glassmorphism background blurring behind an element?",
    opts: ["filter: blur()", "opacity: 0.5", "backdrop-filter: blur()", "box-shadow: inset"],
    correct: 2
  }
];

let quizIndex = 0;
let userScore = 0;
let countdown = 15;
let timerId = null;

const timerBadge = document.getElementById("quiz-timer");
const quizProgress = document.getElementById("quiz-progress");
const questionCount = document.getElementById("question-count");
const questionText = document.getElementById("quiz-question");
const optionsBox = document.getElementById("quiz-options");
const feedbackMsg = document.getElementById("quiz-feedback");
const quizBox = document.getElementById("quiz-box");
const quizResult = document.getElementById("quiz-result");
const finalScore = document.getElementById("final-score");
const retryBtn = document.getElementById("retry-btn");

function runTimer() {
  clearInterval(timerId);
  countdown = 15;
  timerBadge.textContent = `${countdown}s`;
  timerBadge.style.color = "var(--cyan-glow)";

  timerId = setInterval(() => {
    countdown--;
    timerBadge.textContent = `${countdown}s`;
    if (countdown <= 5) timerBadge.style.color = "var(--danger)";
    if (countdown <= 0) {
      clearInterval(timerId);
      evaluateAnswer(-1, null);
    }
  }, 1000);
}

function loadQuestion() {
  const current = quizQuestions[quizIndex];
  questionCount.textContent = `Question ${quizIndex + 1} of ${quizQuestions.length}`;
  questionText.textContent = current.q;
  optionsBox.innerHTML = "";
  feedbackMsg.textContent = "";

  quizProgress.style.width = `${(quizIndex / quizQuestions.length) * 100}%`;

  current.opts.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "cyber-option";
    btn.textContent = text;
    btn.addEventListener("click", () => evaluateAnswer(i, btn));
    optionsBox.appendChild(btn);
  });

  runTimer();
}

function evaluateAnswer(selectedIdx, targetBtn) {
  clearInterval(timerId);
  const correctIdx = quizQuestions[quizIndex].correct;
  const allBtns = optionsBox.querySelectorAll(".cyber-option");
  allBtns.forEach(b => b.disabled = true);

  if (selectedIdx === correctIdx) {
    userScore++;
    if (targetBtn) targetBtn.classList.add("correct");
    feedbackMsg.textContent = "Verified: Correct response.";
    feedbackMsg.style.color = "var(--success)";
  } else {
    if (targetBtn) targetBtn.classList.add("wrong");
    allBtns[correctIdx].classList.add("correct");
    feedbackMsg.textContent = selectedIdx === -1 ? "Timeout reached!" : "Failed: Incorrect answer.";
    feedbackMsg.style.color = "var(--danger)";
  }

  setTimeout(() => {
    quizIndex++;
    if (quizIndex < quizQuestions.length) {
      loadQuestion();
    } else {
      finishQuiz();
    }
  }, 1200);
}

function finishQuiz() {
  quizProgress.style.width = "100%";
  quizBox.classList.add("hidden");
  quizResult.classList.remove("hidden");
  finalScore.textContent = `You scored ${userScore} out of ${quizQuestions.length}!`;
}

retryBtn.addEventListener("click", () => {
  quizIndex = 0;
  userScore = 0;
  quizResult.classList.add("hidden");
  quizBox.classList.remove("hidden");
  loadQuestion();
});

/* ============================================================
   SECTION 3: TASK 03 - REAL-TIME WEATHER & TEMPERATURE API
   ============================================================ */
const citySelect = document.getElementById("city-select");
const fetchWeatherBtn = document.getElementById("fetch-weather-btn");
const tempValue = document.getElementById("temp-value");
const weatherIcon = document.getElementById("weather-icon");
const weatherCond = document.getElementById("weather-cond");
const windSpeed = document.getElementById("wind-speed");
const humidity = document.getElementById("humidity");
const weatherLog = document.getElementById("weather-log");

// City coordinate registry for Open-Meteo API
const cityCoords = {
  kolkata: { lat: 22.5726, lon: 88.3639, name: "Kolkata" },
  delhi: { lat: 28.6139, lon: 77.2090, name: "New Delhi" },
  london: { lat: 51.5074, lon: -0.1278, name: "London" },
  tokyo: { lat: 35.6762, lon: 139.6503, name: "Tokyo" },
  newyork: { lat: 40.7128, lon: -74.0060, name: "New York" }
};

// Weather code mapping
function interpretWmoCode(code) {
  if (code === 0) return { text: "Clear Sky", icon: "☀️" };
  if ([1, 2].includes(code)) return { text: "Partly Cloudy", icon: "⛅" };
  if (code === 3) return { text: "Overcast", icon: "☁️" };
  if ([45, 48].includes(code)) return { text: "Foggy", icon: "🌫️" };
  if ([51, 53, 55, 61, 63].includes(code)) return { text: "Light Rain", icon: "🌦️" };
  if ([65, 80, 81, 82].includes(code)) return { text: "Heavy Rain", icon: "🌧️" };
  if ([71, 73, 75].includes(code)) return { text: "Snowfall", icon: "❄️" };
  if ([95, 96, 99].includes(code)) return { text: "Thunderstorm", icon: "⛈️" };
  return { text: "Moderate", icon: "🌤️" };
}

async function fetchWeatherData() {
  const selectedKey = citySelect.value;
  const city = cityCoords[selectedKey];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;

  try {
    fetchWeatherBtn.disabled = true;
    weatherLog.textContent = `Connecting to telemetry for ${city.name}...`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const current = data.current;
    const condition = interpretWmoCode(current.weather_code);

    // Update DOM
    tempValue.textContent = Math.round(current.temperature_2m);
    weatherIcon.textContent = condition.icon;
    weatherCond.textContent = condition.text;
    windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    humidity.textContent = `${current.relative_humidity_2m}%`;
    weatherLog.textContent = `Updated: Live telemetry active for ${city.name}`;
  } catch (err) {
    weatherLog.textContent = `Connection error: ${err.message}`;
    weatherCond.textContent = "Offline";
  } finally {
    fetchWeatherBtn.disabled = false;
  }
}

fetchWeatherBtn.addEventListener("click", fetchWeatherData);
citySelect.addEventListener("change", fetchWeatherData);

/* ============================================================
   SECTION 4: CAROUSEL COMPONENT
   ============================================================ */
const track = document.getElementById("carousel-track");
const slides = Array.from(track.children);
const prevBtn = document.getElementById("prev-slide");
const nextBtn = document.getElementById("next-slide");
const indicatorDots = document.querySelectorAll(".indicator-dot");
let currentSlide = 0;
let autoPlay = null;

function setSlide(index) {
  track.style.transform = `translateX(-${index * 100}%)`;
  indicatorDots[currentSlide].classList.remove("active");
  indicatorDots[index].classList.add("active");
  currentSlide = index;
}

function next() { setSlide((currentSlide + 1) % slides.length); }
function prev() { setSlide((currentSlide - 1 + slides.length) % slides.length); }

nextBtn.addEventListener("click", () => { next(); restartTimer(); });
prevBtn.addEventListener("click", () => { prev(); restartTimer(); });

indicatorDots.forEach((dot, idx) => {
  dot.addEventListener("click", () => { setSlide(idx); restartTimer(); });
});

function restartTimer() {
  clearInterval(autoPlay);
  autoPlay = setInterval(next, 5000);
}

// Initial Boot
loadQuestion();
fetchWeatherData();
restartTimer();