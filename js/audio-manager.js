// Web Audio API — original synth SFX, no assets.
export class AudioManager {
  constructor(){ this.ctx=null; this.enabled=true; }
  ensure(){ if(!this.ctx){ try{ this.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch{} } if(this.ctx?.state==='suspended') this.ctx.resume(); }
  setEnabled(v){ this.enabled=v; }
  tone(freq,dur,type='sine',vol=0.15,when=0){ if(!this.enabled||!this.ctx) return; const t=this.ctx.currentTime+when; const o=this.ctx.createOscillator(); const g=this.ctx.createGain(); o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur); o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t+dur); }
  noise(dur=0.2,vol=0.08,when=0){ if(!this.enabled||!this.ctx) return; const t=this.ctx.currentTime+when; const len=this.ctx.sampleRate*dur; const buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len); const s=this.ctx.createBufferSource(); s.buffer=buf; const g=this.ctx.createGain(); g.gain.value=vol; const f=this.ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1200; s.connect(f).connect(g).connect(this.ctx.destination); s.start(t); }
  pageTurn(){ this.ensure(); this.noise(0.35,0.12); }
  scratch(){ this.ensure(); this.noise(0.08,0.04); }
  complete(){ this.ensure(); this.tone(523,0.25,'sine',0.18); this.tone(659,0.25,'sine',0.18,0.08); this.tone(784,0.4,'sine',0.2,0.16); this.noise(0.3,0.05,0.1); }
  pop(){ this.ensure(); this.tone(880,0.12,'triangle',0.15); }
  theme(){ this.ensure(); this.tone(392,0.3,'sine',0.12); this.tone(523,0.3,'sine',0.12,0.1); }
}
export const audio = new AudioManager();
