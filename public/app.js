const API = "/api";
let currentUser = null; // { name, username }

function getToken(){ return localStorage.getItem('haven_token'); }
function setToken(t){ localStorage.setItem('haven_token', t); }
function clearToken(){ localStorage.removeItem('haven_token'); }

async function api(path, options = {}){
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if(token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if(!res.ok){
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}

// ---------- pick up a token from a Google OAuth redirect (?token=...) ----------
(function checkGoogleRedirect(){
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if(token){
    setToken(token);
    window.history.replaceState({}, '', '/');
  }
  const googleError = params.get('googleError');
  if(googleError){
    window.history.replaceState({}, '', '/');
  }
})();

// ---------- tabs ----------
function switchTab(tab){
  document.getElementById('tabLoginBtn').classList.toggle('active', tab==='login');
  document.getElementById('tabSignupBtn').classList.toggle('active', tab==='signup');
  document.getElementById('loginForm').style.display = tab==='login' ? 'flex' : 'none';
  document.getElementById('signupForm').style.display = tab==='signup' ? 'flex' : 'none';
  document.getElementById('loginForm').style.flexDirection='column';
  document.getElementById('signupForm').style.flexDirection='column';
}

// ---------- password show/hide ----------
function togglePassword(inputId, btn){
  const input = document.getElementById(inputId);
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  btn.textContent = showing ? 'Show' : 'Hide';
}

// ---------- password strength meter ----------
function updateStrength(){
  const val = document.getElementById('signupPass').value;
  const fill = document.getElementById('strengthFill');
  const text = document.getElementById('strengthText');
  let score = 0;
  if(val.length >= 6) score++;
  if(val.length >= 10) score++;
  if(/[A-Z]/.test(val)) score++;
  if(/[0-9]/.test(val)) score++;
  if(/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { pct: 0,   color:'#e2ddd0', label:'—' },
    { pct: 20,  color:'#c9524a', label:'Weak' },
    { pct: 45,  color:'#c9524a', label:'Weak' },
    { pct: 65,  color:'#c9a44a', label:'Okay' },
    { pct: 85,  color:'#7fa17e', label:'Good' },
    { pct: 100, color:'#42574c', label:'Strong' }
  ];
  const lvl = levels[Math.min(score, 5)];
  fill.style.width = lvl.pct + '%';
  fill.style.background = lvl.color;
  text.textContent = val.length === 0 ? "Password strength: —" : "Password strength: " + lvl.label;
}

// ---------- auth ----------
async function handleLogin(){
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const msg = document.getElementById('loginMsg');
  const btn = document.getElementById('loginBtn');

  if(!username || !password){
    msg.textContent = "Please enter both a username and password.";
    msg.className = "form-msg error";
    return;
  }

  btn.disabled = true; btn.textContent = "Logging in...";
  try{
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    setToken(data.token);
    currentUser = data.user;
    msg.textContent = "";
    enterDashboard();
  } catch(err){
    msg.textContent = err.message;
    msg.className = "form-msg error";
  } finally {
    btn.disabled = false; btn.textContent = "Log in";
  }
}

async function handleSignup(){
  const name = document.getElementById('signupName').value.trim();
  const username = document.getElementById('signupUser').value.trim();
  const password = document.getElementById('signupPass').value;
  const msg = document.getElementById('signupMsg');
  const btn = document.getElementById('signupBtn');

  if(!name || !username || !password){
    msg.textContent = "Please fill in every field.";
    msg.className = "form-msg error";
    return;
  }

  btn.disabled = true; btn.textContent = "Creating account...";
  try{
    const data = await api('/auth/signup', { method: 'POST', body: JSON.stringify({ name, username, password }) });
    setToken(data.token);
    currentUser = data.user;
    msg.textContent = "";
    enterDashboard();
  } catch(err){
    msg.textContent = err.message;
    msg.className = "form-msg error";
  } finally {
    btn.disabled = false; btn.textContent = "Create account";
  }
}

function handleLogout(){
  clearToken();
  currentUser = null;
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('loginPass').value = '';
}

async function enterDashboard(){
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('welcomeText').textContent = "Welcome back" + (currentUser ? ", " + currentUser.name : "");
  document.getElementById('dateText').textContent = new Date().toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' });
  renderMoodRow();
  await loadMoods();
  await loadJournal();
  nextQuote();
}

// ---------- forgot password ----------
let resetUsername = null;

function openForgotPassword(){
  document.getElementById('forgotStep1').classList.add('active');
  document.getElementById('forgotStep2').classList.remove('active');
  document.getElementById('forgotStep3').classList.remove('active');
  document.getElementById('forgotUser').value = '';
  document.getElementById('forgotMsg1').textContent = '';
  document.getElementById('forgotModal').classList.add('open');
}
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

async function sendResetCode(){
  const username = document.getElementById('forgotUser').value.trim();
  const msg = document.getElementById('forgotMsg1');
  try{
    const data = await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ username }) });
    resetUsername = username;
    document.getElementById('demoCode').textContent = data.demoCode;
    document.getElementById('forgotStep1').classList.remove('active');
    document.getElementById('forgotStep2').classList.add('active');
  } catch(err){
    msg.textContent = err.message;
    msg.className = "form-msg error";
  }
}

async function verifyResetCode(){
  const code = document.getElementById('codeInput').value.trim();
  document.getElementById('forgotStep2').dataset.code = code;
  document.getElementById('forgotStep2').classList.remove('active');
  document.getElementById('forgotStep3').classList.add('active');
}

async function finishReset(){
  const code = document.getElementById('forgotStep2').dataset.code;
  const newPassword = document.getElementById('newPass').value;
  const msg = document.getElementById('forgotMsg3');
  try{
    await api('/auth/reset-password', { method: 'POST', body: JSON.stringify({ username: resetUsername, code, newPassword }) });
    closeModal('forgotModal');
    switchTab('login');
    document.getElementById('loginUser').value = resetUsername;
    document.getElementById('loginMsg').textContent = "Password updated — log in with your new password.";
    document.getElementById('loginMsg').className = "form-msg ok";
  } catch(err){
    msg.textContent = err.message;
    msg.className = "form-msg error";
  }
}

// ---------- mood tracker ----------
const moodOptions = ["😊","😐","😔","😤","😴"];
function renderMoodRow(){
  const row = document.getElementById('moodRow');
  row.innerHTML = "";
  moodOptions.forEach(emoji=>{
    const btn = document.createElement('button');
    btn.className = 'mood-btn';
    btn.textContent = emoji;
    btn.onclick = ()=>logMood(emoji, btn);
    row.appendChild(btn);
  });
}
async function logMood(emoji, btn){
  document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  try{
    await api('/wellness/mood', { method: 'POST', body: JSON.stringify({ emoji }) });
    await loadMoods();
  } catch(err){
    document.getElementById('moodLog').textContent = err.message;
  }
}
async function loadMoods(){
  try{
    const data = await api('/wellness/mood');
    const entries = data.entries || [];
    const log = document.getElementById('moodLog');
    if(entries.length === 0){
      log.textContent = "No check-ins yet today.";
      return;
    }
    log.innerHTML = entries.slice(0, 4).map(e =>
      `${e.emoji} logged at ${new Date(e.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`
    ).join("<br>");
  } catch(err){
    document.getElementById('moodLog').textContent = "Couldn't load check-ins.";
  }
}

// ---------- quotes (static content, no API needed) ----------
const quotes = [
  "You don't have to have it all figured out to move forward.",
  "Rest is part of the work, not a break from it.",
  "One small good thing still counts as a good thing.",
  "It's okay to ask for help — that's a strength, not a weakness.",
  "Today doesn't have to be perfect to be worth showing up for.",
  "Breathe. You've gotten through every hard day so far."
];
let quoteIndex = -1;
function nextQuote(){
  let next;
  do { next = Math.floor(Math.random() * quotes.length); } while(next === quoteIndex && quotes.length > 1);
  quoteIndex = next;
  document.getElementById('quoteText').textContent = quotes[quoteIndex];
}

// ---------- journal ----------
async function addJournal(){
  const input = document.getElementById('journalInput');
  const text = input.value.trim();
  if(!text) return;
  try{
    await api('/wellness/journal', { method: 'POST', body: JSON.stringify({ text }) });
    input.value = "";
    await loadJournal();
  } catch(err){
    alert(err.message);
  }
}
function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
async function loadJournal(){
  try{
    const data = await api('/wellness/journal');
    const list = document.getElementById('journalList');
    list.innerHTML = (data.entries || []).map(e =>
      `<div class="journal-entry">${new Date(e.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} — ${escapeHtml(e.text)}</div>`
    ).join("");
  } catch(err){
    /* not logged in yet - ignore */
  }
}

// ---------- breathing label sync ----------
let breathState = "in";
setInterval(()=>{
  breathState = breathState === "in" ? "out" : "in";
  const label = document.getElementById('breathLabel');
  if(label) label.textContent = breathState === "in" ? "Breathe in..." : "Breathe out...";
}, 4000);

// allow Enter key to submit login
document.getElementById('loginPass').addEventListener('keydown', e=>{
  if(e.key === 'Enter') handleLogin();
});

// ---------- on page load: if we already have a token (from Google redirect
// or a previous "remember me" session), try to jump straight to the dashboard ----------
(async function init(){
  if(getToken()){
    try{
      await loadJournal(); // cheap way to confirm the token still works
      currentUser = { name: '' };
      enterDashboard();
    } catch(err){
      clearToken();
    }
  }
})();
