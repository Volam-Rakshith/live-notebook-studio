// Persistence Layer — backend-ready. Swap LocalStorageAdapter for ApiAdapter (Firebase/Supabase) later.
export class LocalStorageAdapter {
  constructor(prefix='lns_'){ this.prefix=prefix; }
  get(k, def){ try{ const v=localStorage.getItem(this.prefix+k); return v?JSON.parse(v):def; }catch{ return def; } }
  set(k,v){ try{ localStorage.setItem(this.prefix+k, JSON.stringify(v)); }catch{} }
  remove(k){ localStorage.removeItem(this.prefix+k); }
}
export const store = new LocalStorageAdapter();
export const DB = {
  prefs: () => store.get('prefs', {theme:'CLASSIC', book:'CLASSIC', speed:1, particles:1, sound:true, automation:false}),
  savePrefs(p){ store.set('prefs', p); },
  history: () => store.get('history', []),
  addHistory(e){ const h=this.history(); h.unshift({...e, at:new Date().toISOString()}); store.set('history', h.slice(0,200)); },
  viewers: () => store.get('viewers', {}),
  saveViewers(v){ store.set('viewers', v); },
  session: () => store.get('session', null),
  saveSession(s){ store.set('session', s); },
};
