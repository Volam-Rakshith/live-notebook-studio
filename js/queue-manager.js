// Queue Manager — manual-first, automation OFF by default.
export class QueueManager {
  constructor(onChange){ this.items=[]; this.onChange=onChange||(()=>{}); this.processing=false; this.automation=false; }
  add(entry){ // {id, text, author, channelId, badge}
    const clean=(entry.text||'').trim().slice(0,120);
    if(!clean) return null;
    if(this.items.some(i=>i.text.toLowerCase()===clean.toLowerCase())) return null; // duplicate
    const item={id:Date.now()+Math.random().toString(16).slice(2), text:clean, author:entry.author||'Viewer', channelId:entry.channelId||'', badge:entry.badge||'new', at:Date.now()};
    this.items.push(item); this.onChange(this.items); return item;
  }
  remove(id){ this.items=this.items.filter(i=>i.id!==id); this.onChange(this.items); }
  clear(){ this.items=[]; this.onChange(this.items); }
  list(){ return [...this.items]; }
}
