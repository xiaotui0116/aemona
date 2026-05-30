let user = JSON.parse(localStorage.getItem('user')) || null;
let fullRecords = JSON.parse(localStorage.getItem('fullRecords')) || [];
let calendarCover = JSON.parse(localStorage.getItem('calendarCover')) || {};
const today = new Date().getDate();
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();
let onboardAnswers = new Array(5).fill(null);
let selAnswers = [];
let currentPlanet;
let currentStory = '';

// Page Navigation
function go(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('show'));
  document.getElementById(pageId).classList.add('show');

  if (pageId === 'onboarding') renderOnboarding();
  if (pageId === 'calendar') { renderCalendar(); renderTodayHistory(); }
  if (pageId === 'reg-drag') enableDrag();
  if (pageId === 'reg-pinch') enablePinch();
  if (pageId === 'reg-clear') spawnClearBalls();
}

// Init
if (user) go('calendar');
else go('welcome');

// ------------------------------
// Onboarding
// ------------------------------
function renderOnboarding() {
  const box = document.getElementById('onboardBox');
  box.innerHTML = '';
  ONBOARDING.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'question-block';
    div.innerHTML = `
      <p>${q}</p>
      <div class="options">
        <span class="option" onclick="selOnboard(${i},1)">1</span>
        <span class="option" onclick="selOnboard(${i},2)">2</span>
        <span class="option" onclick="selOnboard(${i},3)">3</span>
        <span class="option" onclick="selOnboard(${i},4)">4</span>
        <span class="option" onclick="selOnboard(${i},5)">5</span>
      </div>
    `;
    box.appendChild(div);
  });
}

function selOnboard(i, v) {
  onboardAnswers[i] = v;
  const opts = document.querySelectorAll('.question-block')[i].querySelectorAll('.option');
  opts.forEach(o => o.classList.remove('active'));
  opts[v-1].classList.add('active');
}

function finishOnboarding() {
  if (onboardAnswers.includes(null)) {
    alert('Please answer all 5 questions!');
    return;
  }
  user = { profile: onboardAnswers };
  localStorage.setItem('user', JSON.stringify(user));
  go('calendar');
}

// ------------------------------
// Calendar (Latest Planet Only)
// ------------------------------
function renderCalendar() {
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  document.getElementById('calendar-month-year').innerText = `${monthNames[currentMonth]} ${currentYear}`;
  
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate();

  for (let i=0; i<firstDay; i++) grid.appendChild(document.createElement('div'));
  for (let d=1; d<=daysInMonth; d++) {
    const el = document.createElement('div');
    el.className = 'calendar-day';
    el.innerText = d;
    if (calendarCover[d]) {
      el.classList.add('has-planet');
      el.style.background = calendarCover[d].color;
    }
    grid.appendChild(el);
  }
}

// ------------------------------
// Today's History (Multiple Entries)
// ------------------------------
function renderTodayHistory() {
  const list = document.getElementById('today-history-list');
  list.innerHTML = '';
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = fullRecords.filter(r => r.date === todayStr);
  
  todayRecords.forEach(record => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-planet" style="background:${record.planet.color};"></div>
      <div class="history-content">
        <div class="history-text">${record.story}</div>
        <div class="history-time">${record.time}</div>
      </div>
    `;
    list.appendChild(item);
  });
}

// ------------------------------
// Questions (Fixed, No AI)
// ------------------------------
function goToQuestions() {
  currentStory = document.getElementById('story').value.trim();
  if (!currentStory) {
    alert('Please write your story!');
    return;
  }
  go('questions');
  renderQuestions();
}

function renderQuestions() {
  const box = document.getElementById('qBox');
  box.innerHTML = '';
  selAnswers = [];
  QUESTION_POOL.forEach((q,i) => {
    const div = document.createElement('div');
    div.className = 'question-block';
    div.innerHTML = `
      <p>${q.q}</p>
      <div class="options">
        <span class="option" onclick="selQ(${i},1)">1</span>
        <span class="option" onclick="selQ(${i},2)">2</span>
        <span class="option" onclick="selQ(${i},3)">3</span>
        <span class="option" onclick="selQ(${i},4)">4</span>
        <span class="option" onclick="selQ(${i},5)">5</span>
      </div>
    `;
    box.appendChild(div);
  });
}

function selQ(i,v) {
  selAnswers[i] = v;
  const opts = document.querySelectorAll('#qBox .question-block')[i].querySelectorAll('.option');
  opts.forEach(o => o.classList.remove('active'));
  opts[v-1].classList.add('active');
}

// ------------------------------
// Generate Planet
// ------------------------------
function generatePlanet() {
  if (selAnswers.length < 4) {
    alert('Please answer all questions!');
    return;
  }
  currentPlanet = PLANETS[Math.floor(Math.random() * PLANETS.length)];
  document.querySelector('.planet-view').style.background = currentPlanet.color;
  document.querySelector('.analysis-text').innerText = currentPlanet.desc;
  go('result');
}

// ------------------------------
// Save (Calendar Overlay + History Keep All)
// ------------------------------
function saveToCalendar() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });

  // Save all records
  fullRecords.unshift({
    date: dateStr,
    time: timeStr,
    story: currentStory,
    planet: currentPlanet
  });
  localStorage.setItem('fullRecords', JSON.stringify(fullRecords));

  // Calendar only keeps latest
  calendarCover[today] = currentPlanet;
  localStorage.setItem('calendarCover', JSON.stringify(calendarCover));

  go('calendar');
}

// ------------------------------
// 4 Regulation Functions
// ------------------------------
// Drag
function enableDrag() {
  const ball = document.querySelector('.drag-ball');
  const area = document.querySelector('.drag-area');
  let dragging = false, ox=0, oy=0;

  ball.style.left = (area.offsetWidth/2 - 40)+'px';
  ball.style.top = (area.offsetHeight/2 - 40)+'px';

  ball.addEventListener('mousedown', e => {
    dragging = true;
    ox = e.clientX - ball.getBoundingClientRect().left;
    oy = e.clientY - ball.getBoundingClientRect().top;
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const r = area.getBoundingClientRect();
    let x = e.clientX - r.left - ox;
    let y = e.clientY - r.top - oy;
    x = Math.max(0, Math.min(x, r.width-80));
    y = Math.max(0, Math.min(y, r.height-80));
    ball.style.left = x+'px';
    ball.style.top = y+'px';
  });
  document.addEventListener('mouseup', () => dragging = false);
}

// Pinch
function enablePinch() {
  const ball = document.querySelector('.pinch-ball');
  ball.addEventListener('mousedown', () => ball.style.transform = 'scale(0.2)');
  ball.addEventListener('mouseup', () => ball.style.transform = 'scale(1)');
  ball.addEventListener('mouseleave', () => ball.style.transform = 'scale(1)');
}

// Clear Balls
function spawnClearBalls() {
  const area = document.getElementById('clearArea');
  area.innerHTML = '';
  for (let i=0; i<6; i++) {
    const b = document.createElement('div');
    b.className = 'clear-ball';
    b.style.left = Math.random()*(area.offsetWidth-50)+'px';
    b.style.top = Math.random()*(area.offsetHeight-50)+'px';
    b.addEventListener('click', () => {
      b.remove();
      if (!document.querySelector('.clear-ball')) alert('✅ Peaceful space created!');
    });
    area.appendChild(b);
  }
}