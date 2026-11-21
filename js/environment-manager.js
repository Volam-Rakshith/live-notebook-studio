// Environment Manager — builds theme-specific desk, props, lights, fog. Procedural geometry only (₹0).
import * as THREE from 'three';
import { ParticleSystem } from './particle-system.js';

export class EnvironmentManager {
  constructor(scene){ this.scene=scene; this.group=new THREE.Group(); this.particles=null; this.keyLight=null; this.ambLight=null; this.rimLight=null; scene.add(this.group); }
  rebuild(palette, theme){
    // dispose old
    this.dispose();
    this.group=new THREE.Group(); this.scene.add(this.group);
    this.scene.fog=new THREE.Fog(palette.fog, 4, 22);
    this.scene.background=new THREE.Color(palette.fog);

    this.ambLight=new THREE.AmbientLight(palette.amb, 0.7);
    this.keyLight=new THREE.PointLight(palette.key, 2.2, 30, 2); this.keyLight.position.set(-1.2, 2.6, 1.6); this.keyLight.castShadow=true;
    this.rimLight=new THREE.PointLight(palette.accent, 1.6, 20, 2); this.rimLight.position.set(1.6, 2.2, -1.2);
    this.group.add(this.ambLight, this.keyLight, this.rimLight);

    this.buildDesk(theme, palette);
    if(theme==='CLASSIC') this.candles(palette);
    if(theme==='OG') this.goldenArches(palette);
    if(theme==='VIP') this.purpleOrbs(palette);
    if(theme==='WINTER') this.winterDecor(palette);
    if(theme==='CYBER') this.neonRings(palette);

    if(this.particles) this.particles.dispose();
    this.particles=new ParticleSystem(this.group, palette.particle, theme);
    this.particles.start();
  }
  dispose(){
    this.group.traverse(o=>{ if(o.isMesh||o.isLight){ this.group.remove(o); o.geometry?.dispose?.(); if(o.material){ (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose()); } } });
    if(this.particles){ this.particles.dispose(); this.particles=null; }
    this.group=new THREE.Group(); this.scene.add(this.group);
  }
  buildDesk(theme,p){
    const mat=new THREE.MeshStandardMaterial({color: theme==='CYBER'?0x181822: theme==='OG'?0x3a2a14: theme==='WINTER'?0x4a4038: theme==='VIP'?0x2a1a3a:0x2a1a14, roughness:.75, metalness:theme==='CYBER'?0.6:0.2});
    const desk=new THREE.Mesh(new THREE.BoxGeometry(6,0.18,3), mat); desk.position.set(0,-0.9,0); desk.receiveShadow=true; this.group.add(desk);
    // legs
    for(const [x,z] of [[-2.6,-1.2],[2.6,-1.2],[-2.6,1.2],[2.6,1.2]]){
      const leg=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.5,0.12), new THREE.MeshStandardMaterial({color:theme==='CYBER'?0x00ffd5:theme==='OG'?0x8a6a2a:0x1a1210}));
      leg.position.set(x,-1.74,z); leg.castShadow=true; this.group.add(leg);
    }
    // floor
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40), new THREE.MeshStandardMaterial({color:p.fog, roughness:1})); floor.rotation.x=-Math.PI/2; floor.position.y=-1.8; floor.receiveShadow=true; this.group.add(floor);
  }
  candles(p){
    for(const x of [-1.8,1.8]){
      const stick=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.07,0.5,8), new THREE.MeshStandardMaterial({color:0xe8dcc0})); stick.position.set(x,-0.55,-0.6); stick.castShadow=true; this.group.add(stick);
      const flame=new THREE.Mesh(new THREE.SphereGeometry(0.09,8,8), new THREE.MeshBasicMaterial({color:0xffaa44})); flame.position.set(x,-0.18,-0.6); this.group.add(flame);
      const pl=new THREE.PointLight(0xffaa55,0.6,6,2); pl.position.set(x,-0.15,-0.6); this.group.add(pl);
    }
  }
  goldenArches(p){
    for(const x of [-2.4,2.4]){ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.16,2.2,10), new THREE.MeshStandardMaterial({color:0xd4af37, metalness:0.9, roughness:0.25})); col.position.set(x,-0.7,-1.1); col.castShadow=true; this.group.add(col); }
  }
  purpleOrbs(p){
    for(let i=0;i<6;i++){ const orb=new THREE.Mesh(new THREE.SphereGeometry(0.12+Math.random()*0.1,8,8), new THREE.MeshBasicMaterial({color:p.particle})); orb.position.set((Math.random()-0.5)*4, Math.random()*2-0.3, (Math.random()-0.5)*2.5); this.group.add(orb); }
  }
  winterDecor(){
    for(let i=0;i<14;i++){ const f=new THREE.Mesh(new THREE.SphereGeometry(0.04+Math.random()*0.05,6,6), new THREE.MeshBasicMaterial({color:0xffffff})); f.position.set((Math.random()-0.5)*5, Math.random()*2, (Math.random()-0.5)*3); this.group.add(f); }
  }
  neonRings(p){
    for(let i=0;i<3;i++){ const ring=new THREE.Mesh(new THREE.TorusGeometry(1.2+i*0.4,0.02,8,40), new THREE.MeshBasicMaterial({color:p.accent})); ring.position.set(0,-0.7,-1.6); ring.rotation.x=Math.PI/2+i*0.2; this.group.add(ring); }
  }
  update(t){ if(this.particles) this.particles.update(t); }
}
