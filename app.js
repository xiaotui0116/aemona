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
      <p style="color:#666;">You don't need to know what you're feeling, just write it down.</p>
      <textarea id="story-input" placeholder="For example: When I was having a meal with friends today, I kept feeling that something was off..."></textarea>
      <br><br>
      <button onclick="startJourney()">Start exploring</button>
    </div>
  `;
}

function startJourney() {
  const story = document.getElementById('story-input').value.trim() || "I had a meal with friends today and felt a bit uneasy.";
  currentSession.story = story;
  showClarifyScreen();
}

function showClarifyScreen() {
  let html = `
    <div id="clarify-screen" class="screen active">
      <h2>Let's take a closer look at this feeling</h2>
      <p>Please answer the following questions one by one</p>
  `;

  AemonaDB.questionBank.slice(0, 5).forEach((q, i) => {
    html += `
      <div style="margin:15px 0;">
        <p><strong>${i+1}. ${q}</strong></p>
        <select id="q${i}" style="width:100%; padding:10px; border-radius:8px;">
          <option>low</option><option>medium</option><option>high</option>
        </select>
      </div>`;
  });

  html += `<br><button onclick="showUniverse()">Enter the universe of emotions</button></div>`;
  document.getElementById('main').innerHTML = html;
}

function showUniverse() {
  // 收集答案
  currentSession.questions = [];
  document.querySelectorAll('select').forEach((sel, i) => {
    currentSession.questions.push({
      q: AemonaDB.questionBank[i],
      a: sel.value
    });
  });

  document.getElementById('main').innerHTML = `
    <div id="universe-screen" class="screen active">
      <h2>Your Emotional Universe</h2>
      <div style="text-align:center; margin:30px 0; position:relative;">
        <div id="universe" style="width:420px; height:420px; margin:auto; border:3px solid #d4b8a0; border-radius:50%; overflow:hidden; position:relative;">
          <div class="planet" style="background:#6366f1; animation: orbit1 15s linear infinite;">Fear</div>
          <div class="planet" style="background:#ef4444; animation: orbit2 22s linear infinite reverse; width:55px; height:55px;">Anger</div>
        </div>
      </div>
      <button onclick="showRegulation()">开始调节</button>
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
      <h2>Try to regulate emotions through actions</h2>
      <button onclick="doGesture('drag')">Drag - Regain a Sense of Control</button><br><br>
      <button onclick="doGesture('pinch')">Kneading - Relieve Stress</button><br><br>
      <button onclick="doGesture('breathe')">Follow the rhythm - Breathe slowly</button><br><br>
      <button onclick="doGesture('move')">Keep Distance - Create Distance</button>
    </div>
  `;
}

function doGesture(type) {
  currentSession.regulationUsed = type;
  let msg = "";
  if (type === 'drag') msg = "You regained control by dragging.";
  else if (type === 'pinch') msg = "The pressure is slowly being released.";
  else if (type === 'breathe') msg = "After following the rhythm, you feel much calmer.";
  else msg = "You have maintained a healthy distance from this emotion.";

  alert(msg);
  saveCurrentSession();
}

function saveCurrentSession() {
  currentSession.visual = { type: "unstable_orbit", description: "Fear vs Anger" };
  currentSession.emotionPairs = [{ primary: "Fear", secondary: "Anger" }];

  addSession(currentSession);
  alert("✅ The conversation has been saved to the memory file!");

  showArchive();
}

function showArchive() {
  let html = `<div id="archive-screen" class="screen active"><h2>Memory Archive</h2>`;
  
  if (AemonaDB.sessions.length === 0) {
    html += `<p>No records yet</p>`;
  } else {
    AemonaDB.sessions.forEach(s => {
      html += `
        <div style="background:#f0e6d8; padding:15px; border-radius:12px; margin:10px 0;">
          <strong>${s.date} ${s.time}</strong><br>
          ${s.story.substring(0, 60)}...
        </div>`;
    });
  }
  html += `<button onclick="showHome()">Return to homepage</button></div>`;
  document.getElementById('main').innerHTML = html;
}

// 初始化
showHome();