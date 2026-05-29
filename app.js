let currentSession = { story: "", questions: [], emotionPairs: [], visual: {}, regulationUsed: "" };

loadFromLocalStorage();

function goTo(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  let target = document.getElementById(screen + '-screen');
  if (target) target.classList.add('active');
}

function showHome() {
  document.getElementById('main').innerHTML = `
    <div id="home-screen" class="screen active">
      <h2>What happened today?</h2>
      <p style="color:#666;">You don't need to know how you feel yet. Just write freely.</p>
      <textarea id="story-input" placeholder="e.g. I had dinner with friends but felt weird the whole time..."></textarea>
      <br><br>
      <button onclick="startJourney()">Start Exploration</button>
    </div>
  `;
}

function startJourney() {
  const story = document.getElementById('story-input').value.trim() || "I had dinner with friends but felt weird the whole time.";
  currentSession.story = story;
  showClarifyScreen();
}

function showClarifyScreen() {
  let html = `
    <div id="clarify-screen" class="screen active">
      <h2>Let's understand this feeling better</h2>
      <p>Please answer the following questions</p>
  `;

  const options = ["Low", "Medium", "High"];

  AemonaDB.questionBank.slice(0, 5).forEach((q, i) => {
    html += `
      <div style="margin:18px 0; padding:10px; background:#f9f5f0; border-radius:12px;">
        <p><strong>${i+1}. ${q}</strong></p>
        <select id="q${i}" style="width:100%; padding:12px; border-radius:8px; font-size:16px;">
    `;

    options.forEach(opt => {
      html += `<option value="${opt}">${opt}</option>`;
    });

    html += `</select></div>`;
  });

  html += `<br><button onclick="showUniverse()">Enter Emotion Universe 🌌</button></div>`;

  document.getElementById('main').innerHTML = html;
}

function showUniverse() {
  currentSession.questions = [];
  document.querySelectorAll('select').forEach((sel, i) => {
    currentSession.questions.push({
      q: AemonaDB.questionBank[i],
      a: sel.value
    });
  });

  document.getElementById('main').innerHTML = `
    <div id="universe-screen" class="screen active">
      <h2>Your Emotion Universe</h2>
      <div style="text-align:center; margin:30px 0; position:relative;">
        <div id="universe" style="width:420px; height:420px; margin:auto; border:3px solid #d4b8a0; border-radius:50%; overflow:hidden; position:relative;">
          <div class="planet" style="background:#6366f1; animation: orbit1 15s linear infinite;">Fear</div>
          <div class="planet" style="background:#ef4444; animation: orbit2 22s linear infinite reverse; width:55px; height:55px;">Anger</div>
        </div>
      </div>
      <button onclick="showRegulation()">Start Regulation</button>
    </div>
  `;

  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes orbit1 { from {transform:rotate(0deg) translate(140px) rotate(0deg);} to {transform:rotate(360deg) translate(140px) rotate(-360deg);} }
    @keyframes orbit2 { from {transform:rotate(0deg) translate(100px) rotate(0deg);} to {transform:rotate(360deg) translate(100px) rotate(-360deg);} }
  `;
  document.head.appendChild(style);
}

function showRegulation() {
  document.getElementById('main').innerHTML = `
    <div id="regulation-screen" class="screen active">
      <h2>Regulate Your Emotion</h2>
      <button onclick="doGesture('drag')">Drag - Regain Control</button><br><br>
      <button onclick="doGesture('pinch')">Pinch - Release Pressure</button><br><br>
      <button onclick="doGesture('breathe')">Follow Rhythm - Slow Breathing</button><br><br>
      <button onclick="doGesture('move')">Move Away - Create Distance</button>
    </div>
  `;
}

function doGesture(type) {
  currentSession.regulationUsed = type;
  let msg = "";
  if (type === 'drag') msg = "You regained a sense of control.";
  else if (type === 'pinch') msg = "The pressure has been released.";
  else if (type === 'breathe') msg = "You feel much calmer after breathing.";
  else msg = "You have created a healthy distance from the emotion.";

  alert(msg);
  saveCurrentSession();
}

function saveCurrentSession() {
  currentSession.visual = { type: "unstable_orbit", description: "Fear vs Anger" };
  currentSession.emotionPairs = [{ primary: "Fear", secondary: "Anger" }];

  addSession(currentSession);
  alert("✅ Session saved to Memory Archive!");

  showArchive();
}

function showArchive() {
  let html = `<div id="archive-screen" class="screen active"><h2>Memory Archive</h2>`;
  
  if (AemonaDB.sessions.length === 0) {
    html += `<p>No records yet.</p>`;
  } else {
    AemonaDB.sessions.forEach(s => {
      html += `
        <div style="background:#f0e6d8; padding:15px; border-radius:12px; margin:10px 0;">
          <strong>${s.date} ${s.time}</strong><br>
          ${s.story.substring(0, 65)}...
        </div>`;
    });
  }
  html += `<button onclick="showHome()">Back to Home</button></div>`;
  document.getElementById('main').innerHTML = html;
}

// 初始化
showHome();