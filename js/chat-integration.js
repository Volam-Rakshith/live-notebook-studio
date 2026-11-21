// Chat Integration — YouTube Data API v3. Browser-safe polling; OAuth token exchange must run on a free backend.
export class ChatIntegration {
  constructor(queue, og){ this.queue=queue; this.og=og; this.connected=false; this.apiKey=''; this.liveChatId=''; this.pollTimer=null; this.seen=new Set(); this.quotaWarned=false; this.onLog=(m)=>{}; }
  /*
   * Browser path:
   *   - Provide API key (public-safe) + liveChatId to poll liveChat/messages with your own key.
   *   - Read-only chat history is accessible with a simple API key (no secret exposure needed) for most streams.
   * For sending messages / full OAuth (own chat badges, membership tiers), run this token exchange on a
   * free backend (Cloudflare Worker / Firebase Functions):
   *   POST /auth/token -> user-auth, swap code for access_token (YouTube: oauth2.googleapis.com).
   *   Keep client_secret on the server only.
   */
  connect({apiKey, liveChatId}){
    this.apiKey=apiKey.trim(); this.liveChatId=liveChatId.trim();
    if(!this.apiKey||!this.liveChatId){ this.onLog('Chat: missing API key or Live Chat ID'); return false; }
    this.connected=true; this.start(); return true;
  }
  disconnect(){ this.connected=false; clearInterval(this.pollTimer); this.pollTimer=null; this.onLog('Chat: disconnected'); }
  start(){
    if(this.pollTimer) clearInterval(this.pollTimer);
    this.poll();
    this.pollTimer=setInterval(()=>this.poll(), 3000);
  }
  async poll(){
    if(!this.connected) return;
    try{
      const url=`https://www.googleapis.com/youtube/v3/live/chat/messages?liveChatId=${this.liveChatId}&part=snippet,authorDetails&maxResults=50&key=${this.apiKey}`;
      const r=await fetch(url);
      if(r.status===403 && !this.quotaWarned){ this.quotaWarned=true; this.onLog('Chat: API quota exceeded — polling paused'); return; }
      if(!r.ok) return;
      const data=await r.json();
      for(const m of data.items||[]){
        const id=m.id; if(this.seen.has(id)) continue; this.seen.add(id);
        if(this.seen.size>5000) this.seen.clear();
        this.handleMessage(m);
      }
    }catch{ /* network — auto reconnect handled by interval */ }
  }
  handleMessage(m){
    const text=(m.snippet?.textDisplay||'').trim().slice(0,120);
    if(!text) return;
    if(this.isBlocked(text)) return;
    const author=m.snippet?.authorDetails?.displayName||'Viewer';
    const channelId=m.snippet?.authorDetails?.channelId||'';
    const {level,isMember}=this.membershipFrom(m);
    const badge = isMember ? `member L${level}` : (channelId && this.og.register(channelId,author).isOG ? 'og' : 'new');
    this.queue.add({text, author, channelId, badge});
  }
  membershipFrom(m){
    const ad=m.snippet?.authorDetails||{};
    let level=0;
    if(ad.isChannelOwner) level=3;
    else if(ad.isChatModerator || ad.isSuperChat|| ad.isMember) level=Math.max(level,1);
    return {level, isMember: level>0};
  }
  isBlocked(t){
    const bad=/(https?:\/\/|do this again|kill|suicide|nude|porn|http)/i;
    return bad.test(t);
  }
}
