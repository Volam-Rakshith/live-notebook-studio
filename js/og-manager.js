// OG Eligibility — first 50 unique viewers per stream. Stable channelId prevents dup counting.
import { DB } from './persistence.js';
export class OGManager {
  constructor(){ this.viewers=DB.viewers(); }
  register(channelId, displayName){
    if(!channelId) return {isOG:false, count:Object.keys(this.viewers).length};
    if(this.viewers[channelId]) return {isOG:this.viewers[channelId].isOG, count:Object.keys(this.viewers).length, already:true};
    const count=Object.keys(this.viewers).length;
    const isOG = count < 50;
    this.viewers[channelId]={displayName, isOG, firstSeen:new Date().toISOString(), order:count+1};
    DB.saveViewers(this.viewers);
    return {isOG, count:count+1};
  }
  count(){ return Object.keys(this.viewers).length; }
  ogCount(){ return Object.values(this.viewers).filter(v=>v.isOG).length; }
  resetStream(){ this.viewers={}; DB.saveViewers(this.viewers); }
}
