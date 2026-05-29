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

// 首页快速保存
function quickSave() {
  const story = document.getElementById('story-input').value.trim();
  
  if (!story) {
    alert("Please write something before saving.");
    return;
  }

  const sessionData = {
    story: story,
    questions: [],
    emotionPairs: [],
    visual: { type: "quick_entry", description: "Quick Saved Entry" },
    regulationUsed: "none",
    note: "Quick saved from home"
  };

  addSession(sessionData);
  alert("✅ Saved to Memory Archive!");

  // 清空输入框
  document.getElementById('story-input').value = "";
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

  // 每个问题对应不同的选项
  const questionOptions = [
    ["Low", "Medium", "High", "Overwhelming"],           // 1. Intensity
    ["People", "Events", "Environment", "My Thoughts", "Body Sensations"], // 2. Source
    ["Just started", "A few hours", "All day", "Several days", "Long time"], // 3. Duration
    ["Suppressing it", "Talking to someone", "Distracting myself", "Trying to understand it", "Other"], // 4. Coping
    ["To be understood", "Rest", "Expression", "Action", "Nothing specific"] // 5. Need
  ];

  AemonaDB.questionBank.slice(0, 5).forEach((q, i) => {
    html += `
      <div style="margin:20px 0; padding:15px; background:#f9f5f0; border-radius:12px;">
        <p style="margin-bottom:10px;"><strong>${i+1}. ${q}</strong></p>
        <select id="q${i}" style="width:100%; padding:14px; border-radius:8px; font-size:16px; border:2px solid #d4b8a0;">
    `;

    questionOptions[i].forEach(opt => {
      html += `<option value="${opt}">${opt}</option>`;
    });

    html += `</select></div>`;
  });

  html += `
    <br>
    <button onclick="showUniverse()" style="padding:14px 32px; font-size:17px;">Enter Emotion Universe 🌌</button>
  </div>`;

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
      <p>Choose and interact with one of the gestures below</p>
      
      <div style="display:flex; flex-direction:column; gap:15px; margin:30px 0;">
        <button onclick="startGesture('drag')" style="padding:16px;">Drag - Regain Control</button>
        <button onclick="startGesture('pinch')" style="padding:16px;">Pinch - Release Pressure</button>
        <button onclick="startGesture('breathe')" style="padding:16px;">Follow Rhythm - Slow Breathing</button>
        <button onclick="startGesture('move')" style="padding:16px;">Move Away - Create Distance</button>
      </div>
      
      <div id="gesture-area" style="height:380px; border:2px dashed #d4b8a0; border-radius:16px; position:relative; background:#f9f5f0; margin-top:20px;">
        <!-- 交互区域会动态显示内容 -->
      </div>
    </div>
  `;
}
function startGesture(type) {
  const area = document.getElementById('gesture-area');
  
  if (type === 'drag') {
    area.innerHTML = `
      <div style="text-align:center; padding-top:100px;">
        <p><strong>Drag the planet to regain control</strong></p>
        <div id="draggable-planet" style="width:90px; height:90px; background:#6366f1; border-radius:50%; margin:40px auto; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; cursor:grab;">Fear</div>
        <p style="color:#666; font-size:14px;">Drag it around the area</p>
      </div>
    `;
    makeDraggable();
  } 
  else if (type === 'pinch') {
    area.innerHTML = `
      <div style="text-align:center; padding-top:80px;">
        <p><strong>Click and hold to pinch (release pressure)</strong></p>
        <div id="pinch-planet" style="width:130px; height:130px; background:#ef4444; border-radius:50%; margin:50px auto; display:flex; align-items:center; justify-content:center; color:white; font-size:20px; font-weight:bold; cursor:pointer; transition: all 0.4s ease;">Anger</div>
        <p style="color:#666;">Hold click to shrink • Release to expand</p>
      </div>
    `;
    makeClickablePinch();
  } 
  else if (type === 'breathe') {
    area.innerHTML = `
      <div style="text-align:center; padding-top:40px;">
        <p><strong>Follow the breathing rhythm</strong></p>
        <div id="breathe-container" style="position:relative; width:200px; height:200px; margin:30px auto;">
          <div id="breathe-circle" style="width:160px; height:160px; background:#4ecdc4; border-radius:50%; margin:auto; display:flex; align-items:center; justify-content:center; color:white; font-size:22px; font-weight:bold; transition: all 4s ease-in-out;">In...</div>
        </div>
        <p id="breathe-text" style="color:#666; font-size:16px; margin-top:10px;">In... Hold... Out...</p>
      </div>
    `;
    startBreathingAnimation();
  } 
  else if (type === 'move') {
  area.innerHTML = `
    <div style="text-align:center; padding:20px 0;">
      <p><strong>Drag the emotion away / Click to remove</strong></p>
      <p style="color:#666;">Click the small emotional fragments to create distance</p>
      
      <div id="move-area" style="position:relative; width:100%; height:320px; background:#f9f5f0; border:2px dashed #d4b8a0; border-radius:16px; margin:20px auto; overflow:hidden;">
        <!-- 小球会动态生成在这里 -->
      </div>
      
      <p id="move-status" style="color:#666; font-size:14px;">0 / 4 fragments removed</p>
    </div>
  `;
  startMoveAwayGame();
}
}

// ==================== 深呼吸动画 ====================
function startBreathingAnimation() {
  const circle = document.getElementById('breathe-circle');
  const text = document.getElementById('breathe-text');
  
  let isExpanding = true;

  function breathe() {
    if (isExpanding) {
      // 吸气：变大 + 显示 In
      circle.style.transform = 'scale(1.35)';
      circle.style.background = '#22d3ee';
      circle.textContent = 'In...';
      text.textContent = 'Breathe in...';
    } else {
      // 呼气：变小 + 显示 Out
      circle.style.transform = 'scale(0.75)';
      circle.style.background = '#14b8a6';
      circle.textContent = 'Out...';
      text.textContent = 'Breathe out...';
    }
    
    isExpanding = !isExpanding;
  }

  // 每4秒一个呼吸周期
  setInterval(breathe, 4000);
  breathe(); // 立即开始第一次
}

// === 新的 Pinch 交互（点击按住变小）===
function makeClickablePinch() {
  const planet = document.getElementById('pinch-planet');
  if (!planet) return;

  planet.addEventListener('mousedown', () => {
    planet.style.transform = 'scale(0.6)';     // 按住时变小
    planet.style.background = '#f59e0b';       // 颜色变化提示
    planet.textContent = "Releasing...";
  });

  planet.addEventListener('mouseup', () => {
    planet.style.transform = 'scale(1)';       // 松开恢复
    planet.style.background = '#ef4444';
    planet.textContent = "Anger";
  });

  // 鼠标移出也恢复（防止卡住）
  planet.addEventListener('mouseleave', () => {
    planet.style.transform = 'scale(1)';
    planet.style.background = '#ef4444';
    planet.textContent = "Anger";
  });
}

// 保持原来的拖拽函数（Drag 和 Move Away 使用）
function makeDraggable() {
  let planet = document.querySelector('#draggable-planet, #move-planet');
  if (!planet) return;

  let isDragging = false;
  let offsetX = 0, offsetY = 0;
  let originalLeft = '50%';
  let originalTop = '50%';

  // 保存原始中心位置
  planet.style.position = 'absolute';
  planet.style.left = '50%';
  planet.style.top = '50%';
  planet.style.transform = 'translate(-50%, -50%)';

  planet.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = planet.getBoundingClientRect();
    const parentRect = planet.parentElement.getBoundingClientRect();
    
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    planet.style.transition = 'none';           // 拖动时取消过渡动画
    planet.style.cursor = 'grabbing';
    planet.style.zIndex = '10';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      planet.style.transition = 'all 0.6s ease-out';   // 松开后平滑回到中心
      planet.style.left = originalLeft;
      planet.style.top = originalTop;
      planet.style.cursor = 'grab';
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const parentRect = planet.parentElement.getBoundingClientRect();
    
    let newLeft = e.clientX - parentRect.left - offsetX;
    let newTop = e.clientY - parentRect.top - offsetY;

    // 限制在区域内
    newLeft = Math.max(30, Math.min(newLeft, parentRect.width - planet.offsetWidth - 30));
    newTop = Math.max(30, Math.min(newTop, parentRect.height - planet.offsetHeight - 30));

    planet.style.left = newLeft + 'px';
    planet.style.top = newTop + 'px';
    planet.style.transform = 'translate(0, 0)';
  });
}

// ==================== Move Away 游戏逻辑 ====================
let removedCount = 0;

function startMoveAwayGame() {
  removedCount = 0;
  updateMoveStatus();
  createBalls();
}

function updateMoveStatus() {
  const status = document.getElementById('move-status');
  if (status) status.textContent = `${removedCount} / 4 fragments removed`;
}

function createBalls() {
  const container = document.getElementById('move-area');
  if (!container) return;
  
  // 清空现有小球
  container.innerHTML = '';
  
  // 生成4个小球
  for (let i = 0; i < 4; i++) {
    const ball = document.createElement('div');
    ball.className = 'emotion-fragment';
    ball.style.position = 'absolute';
    ball.style.width = '48px';
    ball.style.height = '48px';
    ball.style.borderRadius = '50%';
    ball.style.background = `hsl(${Math.random()*360}, 70%, 60%)`;
    ball.style.display = 'flex';
    ball.style.alignItems = 'center';
    ball.style.justifyContent = 'center';
    ball.style.color = 'white';
    ball.style.fontSize = '12px';
    ball.style.fontWeight = 'bold';
    ball.style.cursor = 'pointer';
    ball.style.userSelect = 'none';
    ball.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
    ball.textContent = '✦';
    
    // 随机位置
    const maxX = container.offsetWidth - 60;
    const maxY = container.offsetHeight - 60;
    ball.style.left = Math.random() * maxX + 'px';
    ball.style.top = Math.random() * maxY + 'px';
    
    // 点击消失
    ball.addEventListener('click', () => {
      ball.style.transition = 'all 0.3s ease';
      ball.style.transform = 'scale(0)';
      ball.style.opacity = '0';
      
      setTimeout(() => {
        ball.remove();
        removedCount++;
        updateMoveStatus();
        
        // 如果还有剩余，生成新的
        if (document.querySelectorAll('.emotion-fragment').length === 0 && removedCount < 8) {
          createBalls();
        }
        
        // 达到一定数量后给予完成反馈
        if (removedCount >= 6) {
          setTimeout(() => {
            alert("🌌 You have successfully created distance from the emotions!");
          }, 300);
        }
      }, 300);
    });
    
    container.appendChild(ball);
  }
}

function makeDraggableFar() {
  // 类似 drag，但更自由
  makeDraggable();
}
// ==================== 全局导航 ====================
function goHome() {
  currentSession = { story: "", questions: [], emotionPairs: [], visual: {}, regulationUsed: "" };
  showHome();
}

function goTo(screen) {
  if (screen === 'home') {
    goHome();
    return;
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  let target = document.getElementById(screen + '-screen');
  if (target) target.classList.add('active');
}
function saveCurrentSession() {
  currentSession.visual = { type: "unstable_orbit", description: "Fear vs Anger" };
  currentSession.emotionPairs = [{ primary: "Fear", secondary: "Anger" }];

  addSession(currentSession);
  alert("✅ Session has been saved to Memory Archive!");

  // 保存后可以选择回到首页或继续
  if (confirm("Go to Memory Archive now?")) {
    showArchive();
  } else {
    goHome();
  }
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
      <p style="text-align:center; color:#666; margin-bottom:20px;">Mixed emotions are forming a living planet...</p>
      
      <div style="text-align:center; margin:30px 0;">
        <div id="main-planet" style="width:380px; height:380px; margin:auto; background: radial-gradient(circle at 40% 30%, #4ade80, #22c55e, #15803d); border-radius:50%; position:relative; box-shadow: 0 0 60px rgba(0,0,0,0.2); overflow:hidden; border:8px solid #78350f;">
          
          <!-- 山 -->
          <div style="position:absolute; bottom:40px; left:30px; width:0; height:0; border-left:60px solid transparent; border-right:80px solid transparent; border-bottom:110px solid #166534;"></div>
          <div style="position:absolute; bottom:55px; left:90px; width:0; height:0; border-left:50px solid transparent; border-right:70px solid transparent; border-bottom:95px solid #4ade80;"></div>
          
          <!-- 树 -->
          <div style="position:absolute; bottom:45px; left:220px; width:18px; height:70px; background:#78350f;"></div>
          <div style="position:absolute; bottom:100px; left:205px; width:45px; height:45px; background:#166534; border-radius:50%;"></div>
          
          <!-- 河流 -->
          <div style="position:absolute; bottom:25px; left:40px; width:180px; height:12px; background:#60a5fa; transform:rotate(-12deg); border-radius:20px; opacity:0.7;"></div>
          
          <!-- 太阳 -->
          <div style="position:absolute; top:60px; right:70px; width:55px; height:55px; background:#fbbf24; border-radius:50%; box-shadow:0 0 30px #fcd34d;"></div>
          
          <!-- 乌云 -->
          <div style="position:absolute; top:80px; left:60px; width:90px; height:35px; background:#64748b; border-radius:50%; opacity:0.75;"></div>
          <div style="position:absolute; top:75px; left:85px; width:65px; height:40px; background:#64748b; border-radius:50%;"></div>
          
          <!-- 暴雨效果 -->
          <div style="position:absolute; top:100px; left:80px; width:3px; height:60px; background:#93c5fd; animation: rain 0.6s linear infinite;"></div>
          <div style="position:absolute; top:95px; left:110px; width:3px; height:55px; background:#93c5fd; animation: rain 0.8s linear infinite;"></div>
          
          <!-- 情绪标签 -->
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; color:white; text-shadow:0 2px 8px rgba(0,0,0,0.6);">
            <div style="font-size:22px; font-weight:bold;">Fear + Anger</div>
            <div style="font-size:14px; margin-top:8px;">Unstable Orbit</div>
          </div>
        </div>
      </div>

      <div style="text-align:center; margin-top:30px;">
        <button onclick="saveCurrentSession()" style="padding:14px 32px; font-size:17px; background:#8a6f5e;">💾 Save to Memory Archive</button>
        <button onclick="showRegulation()" style="padding:14px 32px; font-size:17px; margin-left:15px;">Continue to Regulation →</button>
      </div>
    </div>
  `;

  // 添加雨滴动画
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes rain {
      0% { transform: translateY(-30px); }
      100% { transform: translateY(120px); }
    }
    .planet { position:absolute; top:50%; left:50%; width:65px; height:65px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; transform:translate(-50%,-50%); }
  `;
  document.head.appendChild(style);
}

function showArchive() {
  let html = `
    <div id="archive-screen" class="screen active">
      <h2>Memory Archive</h2>
      <p style="color:#666;">Your emotional journey over time</p>
  `;

  if (AemonaDB.sessions.length === 0) {
    html += `<p style="text-align:center; padding:60px 20px; color:#888;">No entries yet.<br>Start writing to create your first memory.</p>`;
  } else {
    AemonaDB.sessions.forEach(s => {
      html += `
        <div style="background:#f9f5f0; padding:20px; border-radius:12px; margin:15px 0; border-left:5px solid #8a6f5e;">
          <strong>${s.date} ${s.time}</strong><br><br>
          <p style="line-height:1.5;">${s.story}</p>
          ${s.visual && s.visual.description ? `<p style="color:#8a6f5e; margin-top:10px;">${s.visual.description}</p>` : ''}
        </div>`;
    });
  }

  html += `<br><button onclick="goHome()">Back to Home</button></div>`;
  
  document.getElementById('main').innerHTML = html;
}

// 初始化
showHome();