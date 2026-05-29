let currentSession = { story: "", questions: [], emotionPairs: [], visual: {}, regulationUsed: "" };
let previousScreen = 'home';   // 记录点击 Archive 之前的页面

// ==================== 8个均衡星球系统 ====================
const emotionVisuals = [
  { id: 1, variant: 1, name: "Volcano Storm", color: "#f87171", desc: "Fear vs Anger - 火山风暴" },
  { id: 2, variant: 2, name: "Rainy Clouds", color: "#60a5fa", desc: "Sadness vs Shame - 阴雨连绵" },
  { id: 3, name: "Sun Rainbow", color: "#fde047", desc: "Joy vs Fear - 阳光彩虹", variant: 3 },
  { id: 4, name: "Fog Valley", color: "#64748b", desc: "Fear vs Sadness - 雾气笼罩", variant: 4 },
  { id: 5, name: "Cracked Sun", color: "#facc15", desc: "Joy vs Shame - 明亮裂痕", variant: 5 },
  { id: 6, name: "Thunder Orbit", color: "#475569", desc: "Anger vs Fear - 雷霆轨道", variant: 6 },
  { id: 7, name: "Clear After Rain", color: "#67e8f9", desc: "Sadness vs Joy - 雨后初晴", variant: 7 },
  { id: 8, name: "Unstable Core", color: "#fb7185", desc: "Mixed Tension - 不稳定核心", variant: 8 }
];

// 平衡计数器
let visualCounts = JSON.parse(localStorage.getItem('aemonaVisualCounts')) || 
  emotionVisuals.reduce((acc, v) => { acc[v.id] = 0; return acc; }, {});

// 选择最均衡的视觉
function selectBalancedVisual() {
  const minCount = Math.min(...Object.values(visualCounts));
  const candidates = emotionVisuals.filter(v => visualCounts[v.id] === minCount);
  
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  
  visualCounts[selected.id]++;
  localStorage.setItem('aemonaVisualCounts', JSON.stringify(visualCounts));
  
  return selected;
}

// 重置计数（调试用，可在首页加按钮调用）
function resetVisualCounts() {
  localStorage.removeItem('aemonaVisualCounts');
  visualCounts = emotionVisuals.reduce((acc, v) => { acc[v.id] = 0; return acc; }, {});
  alert('星球出现计数已重置');
}



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

  const emotionResult = AemonaDB.getEmotionResult(currentSession.questions);
  currentSession.emotionPairs = [emotionResult];

  // === 新增：均衡选择视觉 ===
  const visual = selectBalancedVisual();

  const planetHTML = generatePlanetHTML(
    emotionResult.primary, 
    emotionResult.secondary, 
    visual.variant   // 使用均衡选出的 variant
  );

  document.getElementById('main').innerHTML = `
    <div id="universe-screen" class="screen active">
      <h2>Your Emotion Universe</h2>
      <p style="text-align:center; color:#666; margin-bottom:10px;">
        ${emotionResult.primary} + ${emotionResult.secondary}
      </p>
      
      <div style="text-align:center; margin:30px 0;">
        ${planetHTML}
      </div>

      <div style="text-align:center; margin-top:30px;">
        <button onclick="saveCurrentSession()" style="padding:14px 32px; font-size:17px; background:#8a6f5e;">💾 Save to Memory Archive</button>
        <button onclick="showRegulation()" style="padding:14px 32px; font-size:17px; margin-left:15px;">Continue to Regulation →</button>
      </div>
    </div>
  `;
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
  // 收集答案
  currentSession.questions = [];
  document.querySelectorAll('select').forEach((sel, i) => {
    currentSession.questions.push({
      q: AemonaDB.questionBank[i],
      a: sel.value
    });
  });

  // 根据答案生成情绪和变体
  const emotionResult = AemonaDB.getEmotionResult(currentSession.questions);
  currentSession.emotionPairs = [emotionResult];

  // 生成对应星球
  const planetHTML = generatePlanetHTML(
    emotionResult.primary, 
    emotionResult.secondary, 
    emotionResult.variant
  );

  document.getElementById('main').innerHTML = `
    <div id="universe-screen" class="screen active">
      <h2>Your Emotion Universe</h2>
      <p style="text-align:center; color:#666; margin-bottom:10px;">${emotionResult.primary} + ${emotionResult.secondary}</p>
      
      <div style="text-align:center; margin:30px 0;">
        ${planetHTML}
      </div>

      <div style="text-align:center; margin-top:30px;">
        <button onclick="saveCurrentSession()" style="padding:14px 32px; font-size:17px; background:#8a6f5e;">💾 Save to Memory Archive</button>
        <button onclick="showRegulation()" style="padding:14px 32px; font-size:17px; margin-left:15px;">Continue to Regulation →</button>
      </div>
    </div>
  `;
}

function generatePlanetHTML(primary, secondary, variant = 8) {
  let bg = "#4ade80";
  let terrain = "";
  let label = `${primary} + ${secondary}`;

  switch(variant) {
    case 1: // 1. Volcano Storm - 火山爆发（强烈红色）
      bg = "#f87171";
      terrain = `
        <div style="position:absolute; bottom:20px; left:30px; width:0; height:0; border-left:75px solid transparent; border-right:95px solid transparent; border-bottom:145px solid #b91c1c;"></div>
        <div style="position:absolute; top:40px; left:80px; font-size:72px;">🌋</div>
        <div style="position:absolute; top:68px; right:50px; width:80px; height:80px; background:#fbbf24; border-radius:50%; box-shadow:0 0 60px #fcd34d;"></div>
      `;
      break;

    case 2: // 2. Rainy Clouds - 阴雨连绵
      bg = "#60a5fa";
      terrain = `
        <div style="position:absolute; bottom:28px; left:35px; width:175px; height:30px; background:#93c5fd; border-radius:50px;"></div>
        <div style="position:absolute; top:52px; left:60px; font-size:72px;">☁️</div>
        <div style="position:absolute; top:78px; left:92px; font-size:52px;">☂️</div>
      `;
      break;

    case 3: // 3. Sun Rainbow - 明亮阳光 + 彩虹（黄色主调）
      bg = "#fde047";
      terrain = `
        <div style="position:absolute; top:38px; right:55px; font-size:78px;">☀️</div>
        <div style="position:absolute; bottom:52px; left:70px; width:0; height:0; border-left:65px solid transparent; border-right:75px solid transparent; border-bottom:110px solid #4ade80;"></div>
        <div style="position:absolute; bottom:45px; left:155px; font-size:42px; transform:rotate(12deg);">🌈</div>
      `;
      break;

    case 4: // 4. Fog Valley - 雾气笼罩
      bg = "#64748b";
      terrain = `
        <div style="position:absolute; top:72px; left:50px; width:130px; height:52px; background:#e2e8f0; border-radius:50%; opacity:0.7;"></div>
        <div style="position:absolute; bottom:35px; left:42px; width:160px; height:24px; background:#cbd5e1; border-radius:50px; opacity:0.85;"></div>
        <div style="position:absolute; top:48px; right:65px; font-size:58px; opacity:0.65;">🌫️</div>
      `;
      break;

    case 5: // 5. Cracked Sun - 金色裂痕
      bg = "#facc15";
      terrain = `
        <div style="position:absolute; bottom:45px; left:52px; width:0; height:0; border-left:68px solid transparent; border-right:78px solid transparent; border-bottom:115px solid #eab308;"></div>
        <div style="position:absolute; top:45px; right:58px; font-size:68px;">☀️</div>
        <div style="position:absolute; bottom:62px; left:108px; width:7px; height:95px; background:#78350f; transform:rotate(35deg);"></div>
      `;
      break;

    case 6: // 6. Thunder Orbit - 深色雷霆
      bg = "#475569";
      terrain = `
        <div style="position:absolute; top:35px; left:65px; font-size:82px;">🌩️</div>
        <div style="position:absolute; bottom:30px; left:45px; width:0; height:0; border-left:72px solid transparent; border-right:92px solid transparent; border-bottom:105px solid #334155;"></div>
      `;
      break;

    case 7: // 7. Clear After Rain - 青色雨后初晴（明显不同！）
      bg = "#67e8f9";
      terrain = `
        <div style="position:absolute; top:55px; left:75px; font-size:65px;">☁️</div>
        <div style="position:absolute; bottom:40px; left:65px; width:0; height:0; border-left:58px solid transparent; border-right:78px solid transparent; border-bottom:98px solid #22c55e;"></div>
        <div style="position:absolute; top:42px; right:65px; font-size:58px;">🌈</div>
        <div style="position:absolute; top:68px; left:120px; font-size:32px; opacity:0.9;">✨</div>
      `;
      break;

    case 8: // 8. Unstable Core - 紫红不稳定核心
      bg = "#fb7185";
      terrain = `
        <div style="position:absolute; bottom:32px; left:42px; width:0; height:0; border-left:62px solid transparent; border-right:85px solid transparent; border-bottom:118px solid #e11d48;"></div>
        <div style="position:absolute; top:52px; right:60px; font-size:62px;">🔥</div>
        <div style="position:absolute; bottom:65px; left:102px; width:10px; height:82px; background:#6b21a8; transform:rotate(-38deg); box-shadow:0 0 15px #a855f7;"></div>
      `;
      break;

    default:
      bg = "#e0f2fe";
      terrain = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:90px;">🌌</div>`;
  }

  return `
    <div style="width:400px; height:400px; margin:auto; background: radial-gradient(circle at 48% 38%, #ffffff, ${bg}); border-radius:50%; position:relative; box-shadow: 0 0 75px rgba(0,0,0,0.4); overflow:hidden; border:16px solid #78350f;">
      ${terrain}
      <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; color:white; text-shadow:0 4px 15px rgba(0,0,0,0.75); font-size:26px; font-weight:bold; pointer-events:none;">
        ${label}
      </div>
    </div>
  `;
}

function showArchive() {
  // 记录当前页面（用于返回）
  if (!document.getElementById('archive-screen')) {
    previousScreen = 'home'; // 默认
    // 简单判断当前所在页面
    if (document.getElementById('universe-screen')) previousScreen = 'universe';
    else if (document.getElementById('regulation-screen')) previousScreen = 'regulation';
  }

  let html = `
    <div id="archive-screen" class="screen active">
      <h2>Memory Archive</h2>
      <p style="color:#666;">Your emotional journey over time</p>
  `;

  if (AemonaDB.sessions.length === 0) {
    html += `<p style="text-align:center; padding:80px 20px; color:#888;">No entries yet.<br>Start exploring to create your first memory.</p>`;
  } else {
    AemonaDB.sessions.forEach((s) => {
      html += `
        <div style="background:#f9f5f0; padding:20px; border-radius:12px; margin:15px 0; border-left:6px solid #8a6f5e;">
          <strong>${s.date} ${s.time}</strong><br><br>
          <p style="line-height:1.5; margin-bottom:10px;">${s.story.substring(0, 180)}${s.story.length > 180 ? '...' : ''}</p>
          ${s.emotionPairs && s.emotionPairs.length > 0 ? `<p style="color:#8a6f5e;">${s.emotionPairs[0].primary} + ${s.emotionPairs[0].secondary}</p>` : ''}
        </div>`;
    });
  }

  html += `
    <br>
    <button onclick="goBack()" style="padding:12px 28px; background:#6b5749;">← Back to Previous Page</button>
    <button onclick="goHome()" style="padding:12px 28px; margin-left:12px;">Back to Home</button>
  </div>`;
  
  document.getElementById('main').innerHTML = html;
}

function goBack() {
  if (previousScreen === 'universe') {
    showUniverse();           // 返回情绪宇宙
  } else if (previousScreen === 'regulation') {
    showRegulation();         // 返回调节页面
  } else {
    goHome();                 // 默认返回首页
  }
}

// ==================== 加强版情绪结果生成（确保8个variant都能稳定触发） ====================
AemonaDB.getEmotionResult = function(answers) {
  const intensity = answers[0] ? answers[0].a : "Medium";
  const source = answers[1] ? answers[1].a : "My Thoughts";
  const duration = answers[2] ? answers[2].a : "A few hours";
  const coping = answers[3] ? answers[3].a : "Trying to understand it";
  const need = answers[4] ? answers[4].a : "To be understood";

  let primary = "Fear";
  let secondary = "Anger";
  let variant = 6;

  // 优先级调整：让每个variant都有清晰路径
  if (coping.includes("Talking") || coping.includes("Expression")) {
    if (duration.includes("Several days") || duration.includes("Long time")) {
      // === Variant 7: 雨后初晴 ===
      primary = "Sadness";
      secondary = "Joy";
      variant = 7;
    } 
    else if (intensity === "Medium" || intensity === "Low") {
      // Variant 3: 阳光彩虹
      primary = "Joy";
      secondary = "Fear";
      variant = 3;
    }
  } 
  else if (intensity === "Overwhelming" || intensity === "High") {
    if (source.includes("People")) {
      primary = "Anger"; secondary = "Fear"; variant = 1;
    } else {
      primary = "Fear"; secondary = "Anger"; variant = 6;
    }
  } 
  else if (coping.includes("Suppressing") || coping.includes("Distracting")) {
    primary = "Sadness"; secondary = "Shame"; variant = 2;
  } 
  else if (source.includes("Environment")) {
    primary = "Fear"; secondary = "Sadness"; variant = 4;
  } 
  else if (intensity === "Low") {
    primary = "Joy"; secondary = "Shame"; variant = 5;
  } 
  else if (coping.includes("Trying to understand it")) {
    primary = "Fear"; secondary = "Anger"; variant = 8;
  }

  return {
    primary: primary,
    secondary: secondary,
    variant: variant,
    description: "Unstable Orbit"
  };
};
// 初始化
showHome();