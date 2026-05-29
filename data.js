const AemonaDB = {
  user: {
    id: "user_001",
    name: "xiaotui",
    persona: "Yuna"
  },

  sessions: [],

  questionBank: [
    "How strong is this feeling?",
    "Where does it mainly come from (people, events, environment)?",
    "How long has it been going on?",
    "How are you currently dealing with it?",
    "What is needed the most right now?",
    "Which part of the body does this feeling most resemble?",
    "If this feeling had a color, what color would it be?"
  ],

  emotionLibrary: {
    Fear: { color: "#6366f1", pair: "Anger" },
    Anger: { color: "#ef4444", pair: "Fear" },
    Sadness: { color: "#3b82f6", pair: "Joy" },
    Joy: { color: "#eab308", pair: "Sadness" },
    Shame: { color: "#8b5cf6", pair: "Pride" }
  }
};

// ==================== 增强版情绪结果生成（支持8个星球） ====================
AemonaDB.getEmotionResult = function(answers) {
  const intensity = answers[0] ? answers[0].a : "Medium";
  const source = answers[1] ? answers[1].a : "My Thoughts";
  const duration = answers[2] ? answers[2].a : "A few hours";
  const coping = answers[3] ? answers[3].a : "Trying to understand it";
  const need = answers[4] ? answers[4].a : "To be understood";

  let primary = "Fear";
  let secondary = "Anger";
  let variant = 6;   // 默认

  // 8种组合逻辑（覆盖所有variant）
  if (intensity === "Overwhelming" || intensity === "High") {
    if (source.includes("People") || source.includes("Environment")) {
      primary = "Anger"; secondary = "Fear"; variant = 1;   // 火山风暴
    } else {
      primary = "Fear"; secondary = "Anger"; variant = 6;   // 雷霆轨道
    }
  } 
  else if (coping.includes("Suppressing") || coping.includes("Distracting")) {
    if (need.includes("Rest") || duration.includes("Long time")) {
      primary = "Sadness"; secondary = "Shame"; variant = 2; // 阴雨连绵
    } else {
      primary = "Fear"; secondary = "Sadness"; variant = 4;  // 雾气笼罩
    }
  } 
  else if (coping.includes("Talking") || coping.includes("Expression")) {
    if (intensity === "Low" || intensity === "Medium") {
      primary = "Joy"; secondary = "Fear"; variant = 3;      // 阳光彩虹
    } else {
      primary = "Joy"; secondary = "Shame"; variant = 5;     // 明亮裂痕
    }
  } 
  else if (source.includes("Environment") || source.includes("Body")) {
    primary = "Fear"; secondary = "Sadness"; variant = 4;    // 雾气笼罩
  } 
  else if (intensity === "Low") {
    primary = "Joy"; secondary = "Shame"; variant = 5;       // 明亮裂痕
  } 
  else if (coping.includes("Trying to understand")) {
    if (need.includes("Expression")) {
      primary = "Sadness"; secondary = "Joy"; variant = 7;   // 雨后初晴
    } else {
      primary = "Fear"; secondary = "Anger"; variant = 8;    // 不稳定核心
    }
  } 
  else {
    // 兜底组合
    primary = "Anger"; secondary = "Shame"; variant = 1;
  }

  return {
    primary: primary,
    secondary: secondary,
    variant: variant,
    description: "Unstable Orbit"
  };
};

// ==================== 本地存储功能 ====================
function saveToLocalStorage() {
  localStorage.setItem('aemona_db', JSON.stringify(AemonaDB));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('aemona_db');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(AemonaDB, parsed);
  }
}

function addSession(sessionData) {
  const newSession = {
    id: "sess_" + Date.now(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}),
    ...sessionData
  };
  AemonaDB.sessions.unshift(newSession);
  saveToLocalStorage();
  return newSession;
}

window.AemonaDB = AemonaDB;
window.saveToLocalStorage = saveToLocalStorage;
window.loadFromLocalStorage = loadFromLocalStorage;
window.addSession = addSession;