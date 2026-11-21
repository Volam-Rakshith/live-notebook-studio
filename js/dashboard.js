// Dashboard — private streamer control panel. Drives the public game via BroadcastChannel.
import { DB } from './persistence.js';
import { QueueManager } from './queue-manager.js';
import { OGManager } from './og-manager.js';
import { ChatIntegration } from './chat-integration.js';
import { THEMES } from './theme-manager.js';
import { audio } from './audio-manager.js';

const $=s=>document.querySelector(s);
const channel=new BroadcastChannel('livenotebook');
const prefs=DB.prefs();
const og=new OGManager();
const queue=new QueueManager(renderQueue);
const chat=new ChatIntegration(queue, og);

let entriesInProgress=0;

function send(cmd){ channel.postMessage(cmd); }

// ---- init ----
function init(){
  // restore prefs
  $('#themeGrid').querySelectorAll('.theme-btn').forEach(b=>b.classList.toggle('active', b.dataset.theme===prefs.theme));
  $('#bookGrid').querySelectorAll('.book-btn').forEach(b=>b.classList.toggle('active', b.dataset.book===prefs.book));
  $('#speedRange').value=prefs.speed; $('#speedVal').textContent=prefs.speed.toFixed(1)+'x';
  $('#particleRange').value=prefs.particles; $('#particleVal').textContent=Math.round(prefs.particles*100)+'%';
  $('#soundToggle').checked=prefs.sound;
  $('#autoToggle').checked=prefs.automation;

  send({type:'theme', theme:prefs.theme});
  send({type:'book', book:prefs.book});
  send({type:'sound', value:prefs.sound});
  send({type:'particles', value:prefs.particles});
  send({type:'speed', speed:prefs.speed});

  renderQueue(); renderStats(); renderHistory(); renderOG();
  chat.onLog=(m)=>{ const l=$('#chatLog'); l.textContent=m+'\n'+l.textContent; };
}

// ---- manual entry (default mode) ----
$('#submitBtn').onclick=()=>{
  const text=$('#manualEntry').value.trim();
  if(!text){ log('Entry empty'); return; }
  if(entriesInProgress>0){ log('Entry in progress — use Emergency Stop first'); return; }
  submitEntry(text, 'STREAMER', 'manual');
  $('#manualEntry').value='';
};
$('#submitSuggestBtn').onclick=()=>{
  const item=$('#queueList .queue-item.selected');
  if(!item){ log('Select a suggestion first'); return; }
  const id=item.dataset.id;
  const it=queue.list().find(q=>q.id===id);
  if(!it) return;
  submitEntry(it.text, it.author, it.badge);
  queue.remove(id);
};

function submitEntry(text, author, badge){
  entriesInProgress++;
  setStatus('writing', 'WRITING');
  send({type:'write', text});
  DB.addHistory({text:text.slice(0,40), author, badge});
  renderHistory();
  log(`Submitted (${badge}): "${text.slice(0,30)}"`);
  setTimeout(()=>{ entriesInProgress--; setStatus('live','LIVE'); }, text.length*70+900);
}

// ---- queue ----
function renderQueue(){
  const list=$('#queueList'); list.innerHTML='';
  queue.list().forEach(it=>{
    const el=document.createElement('div'); el.className='queue-item'; el.dataset.id=it.id;
    el.innerHTML=`<div><div class="row" style="justify-content:space-between"><b>${esc(it.author)}</b><span class="badge ${it.badge}">${it.badge}</span></div><p>${esc(it.text)}</p></div>`;
    el.onclick=()=>{ list.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected')); el.classList.add('selected'); };
    list.appendChild(el);
  });
  $('#queueCount').textContent=queue.list().length;
}
$('#delBtn').onclick=()=>{ const s=$('#queueList .queue-item.selected'); if(s) queue.remove(s.dataset.id); };
$('#clearBtn').onclick=()=>queue.clear();

// ---- themes ----
$('#themeGrid').onclick=e=>{
  const b=e.target.closest('.theme-btn'); if(!b) return;
  $('#themeGrid').querySelectorAll('.theme-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); prefs.theme=b.dataset.theme; DB.savePrefs(prefs);
  send({type:'theme', theme:prefs.theme});
  log('Theme: '+prefs.theme);
};
// ---- books ----
$('#bookGrid').onclick=e=>{
  const b=e.target.closest('.book-btn'); if(!b) return;
  $('#bookGrid').querySelectorAll('.book-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); prefs.book=b.dataset.book; DB.savePrefs(prefs);
  send({type:'book', book:prefs.book});
  log('Book: '+prefs.book);
};

// ---- controls ----
$('#pauseBtn').onclick=()=>send({type:'pause'});
$('#estopBtn').onclick=()=>{ send({type:'stop'}); entriesInProgress=0; setStatus('live','LIVE'); };
$('#pageBtn').onclick=()=>send({type:'page'});
$('#resetBtn').onclick=()=>send({type:'reset'});
$('#previewBtn').onclick=()=>window.open('game.html','_blank');

$('#speedRange').oninput=e=>{ prefs.speed=parseFloat(e.target.value); $('#speedVal').textContent=prefs.speed.toFixed(1)+'x'; DB.savePrefs(prefs); send({type:'speed', speed:prefs.speed}); };
$('#particleRange').oninput=e=>{ prefs.particles=parseFloat(e.target.value); $('#particleVal').textContent=Math.round(prefs.particles*100)+'%'; DB.savePrefs(prefs); send({type:'particles', value:prefs.particles}); };
$('#soundToggle').onchange=e=>{ prefs.sound=e.target.checked; DB.savePrefs(prefs); send({type:'sound', value:prefs.sound}); };

// ---- automation (OFF by default) ----
$('#autoToggle').onchange=e=>{
  prefs.automation=e.target.checked; DB.savePrefs(prefs);
  log('Automation: '+(prefs.automation?'ENABLED (approve-only)':'DISABLED'));
  if(prefs.automation && chat.connected) processAutomation();
};
function processAutomation(){
  if(!prefs.automation) return;
  if(entriesInProgress>0) return; // never interrupt in-progress
  const item=queue.list().find(i=>/^(new|og|member)/.test(i.badge));
  if(item){ submitEntry(item.text,item.author,item.badge); queue.remove(item.id); }
  setTimeout(processAutomation, 1500);
}

// ---- chat connect ----
$('#chatConnect').onclick=()=>{
  const ok=chat.connect({apiKey:$('#apiKey').value, liveChatId:$('#liveChatId').value});
  if(ok){ setStatus('chat','CHAT LIVE'); log('Chat connected'); }
  else log('Chat: fill API key + Live Chat ID (see README)');
};
$('#chatDisconnect').onclick=()=>{ chat.disconnect(); setStatus('live','LIVE'); };

// ---- OG ----
$('#ogReset').onclick=()=>{ og.resetStream(); renderOG(); log('OG list reset for new stream'); };
function renderOG(){
  const total=og.count(), ogCount=og.ogCount();
  $('#ogCount').textContent=ogCount+'/50';
  $('#ogBar').style.width=(ogCount/50*100)+'%';
}
// simulate viewer arrival if no chat (demo): register test viewers
setInterval(()=>{ if(!chat.connected && og.count()<50 && Math.random()<0.2){ og.register('demo_'+Math.random().toString(36).slice(2),'Viewer'); renderOG(); } }, 4000);

// ---- stats / history ----
function renderStats(){ $('#statViewers').textContent=og.count(); $('#statEntries').textContent=DB.history().length; $('#statQueue').textContent=queue.list().length; }
function renderHistory(){ const h=DB.history(); $('#historyList').innerHTML=h.slice(0,30).map(x=>`<div>${esc(x.text)} <span class="badge ${x.badge}">${x.badge}</span> <small>${x.author}</small></div>`).join(''); }
function setStatus(kind,label){ const p=$('#liveStatus'); p.className='pill '+kind; p.innerHTML=`<i></i>${label}`; }
function log(m){ const l=$('#log'); l.textContent=m+'\n'+l.textContent; }
function esc(s){ return (s||'').replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])); }

init();
