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

function saveToLocalStorage() {
  localStorage.setItem('aemona_db', JSON.stringify(AemonaDB));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('aemona_db');
  if (saved) {
    Object.assign(AemonaDB, JSON.parse(saved));
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