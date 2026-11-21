// Theme Manager — each theme owns a full 3D environment (lights, props, particles, fog). Modular.
import * as THREE from 'three';
export const THEMES = ['CLASSIC','OG','VIP','WINTER','CYBER'];
const PALETTE = {
  CLASSIC:{ fog:0x05050a, key:0xffcc88, amb:0x222233, accent:0xd4af37, particle:0xffaa55 },
  OG:     { fog:0x14100a, key:0xffd98a, amb:0x3a2a14, accent:0xf5d67b, particle:0xffe9a0 },
  VIP:    { fog:0x0c0816, key:0xc89aff, amb:0x2a1a44, accent:0x9b59b6, particle:0xe0b0ff },
  WINTER: { fog:0x101820, key:0xcfe8ff, amb:0x33445a, accent:0xa8d8ff, particle:0xffffff },
  CYBER:  { fog:0x020610, key:0x00ffd5, amb:0x112233, accent:0x00ffd5, particle:0x66ffee },
};
export class ThemeManager {
  constructor(){ this.current='CLASSIC'; this.palette=PALETTE.CLASSIC; }
  apply(theme, scene, env){
    if(!THEMES.includes(theme)) return;
    this.current=theme; this.palette=PALETTE[theme];
    if(scene) scene.fog=new THREE.Fog(this.palette.fog, 4, 22);
    if(scene) scene.background=new THREE.Color(this.palette.fog);
    if(env) env.rebuild(this.palette, theme);
  }
  get(){ return this.palette; }
}
