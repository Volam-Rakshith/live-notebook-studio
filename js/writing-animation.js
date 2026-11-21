// Writing Animation — orchestrates book + hands + ink + SFX + completion.
import { audio } from './audio-manager.js';
export class WritingAnimation {
  constructor(book, hands){ this.book=book; this.hands=hands; this.active=false; this.onComplete=null; this.speed=1; }
  play(text, onComplete){
    if(this.active) return false;
    this.active=true; this.onComplete=onComplete;
    if(!this.book.opened) this.book.open();
    this.hands.startWriting(this.book);
    // sync progressive text with hand sweep duration
    const total = Math.max(900, text.length*70);
    const chars=[...text]; let shown=0;
    const start=performance.now();
    const step=()=>{
      const t=Math.min(1,(performance.now()-start)/(total/this.speed));
      const want=Math.floor(t*chars.length);
      while(shown<want){ shown++; this.book.renderText(chars.slice(0,shown)); audio.scratch(); }
      if(t<1) requestAnimationFrame(step);
      else { this.complete(); }
    };
    step();
    return true;
  }
  complete(){
    this.active=false; this.hands.stop();
    audio.complete();
    this.book.setInkColor(0x111111);
    this.onComplete?.(); this.onComplete=null;
  }
  setSpeed(s){ this.speed=s; this.hands.speed=s; }
}
