// Demo auth utility - localStorage based (NOT for production)
const USERS_KEY = 'demo_users_v1'
const SESSION_KEY = 'demo_session_v1'
function loadUsers(){try{return JSON.parse(localStorage.getItem(USERS_KEY))||{}}catch(e){return {}}}
function saveUsers(u){localStorage.setItem(USERS_KEY,JSON.stringify(u))}
function hash(str){return btoa(str)} // placeholder
function registerUser(email,password){
  const users = loadUsers(); if(users[email]) return {ok:false, error:'User already exists'}
  users[email] = {email, password: hash(password), created:Date.now()}
  saveUsers(users)
  localStorage.setItem(SESSION_KEY, JSON.stringify({email, created:Date.now()}))
  return {ok:true}
}
function loginUser(email,password){
  const users = loadUsers(); const u = users[email]; if(!u) return {ok:false, error:'No such user'}
  if(u.password!==hash(password)) return {ok:false, error:'Invalid credentials'}
  localStorage.setItem(SESSION_KEY, JSON.stringify({email, loginAt:Date.now()}))
  return {ok:true}
}
function logout(){ localStorage.removeItem(SESSION_KEY) }
function currentUser(){ try{return JSON.parse(localStorage.getItem(SESSION_KEY))||null}catch(e){return null} }

// Helper to protect pages
function requireAuth(redirectTo){ if(!currentUser()){ location.href = redirectTo || '/Webpages/webpage2.html' } }
