// Membership Manager — cosmetic only. Levels: 1 Member, 2 Royal, 3 Legendary.
export const MEMBERSHIP_BOOKS = { 0:'CLASSIC', 1:'MEMBER', 2:'ROYAL', 3:'LEGENDARY' };
export function bookForMember(level){ return MEMBERSHIP_BOOKS[level]||'CLASSIC'; }
export function parseMembership(snippet){ // YouTube liveChatMessage authorDetails / membership snippet
  try{
    const lvl = snippet?.authorDetails?.isChannelOwner ? 3 : snippet?.authorDetails?.isChatModerator ? 2 : 0;
    const tier = snippet?.authorDetails?.channelId ? lvl : 0;
    return { level: tier, isMember: tier>0 };
  }catch{ return {level:0,isMember:false}; }
}
