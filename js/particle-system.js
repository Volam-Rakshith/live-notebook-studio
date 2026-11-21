// Particle System — adaptive count, GPU-friendly BufferGeometry. Theme-aware.
import * as THREE from 'three';
export class ParticleSystem {
  constructor(parent, color, theme){
    this.theme=theme; this.count = this.adaptiveCount(theme);
    const geo=new THREE.BufferGeometry();
    const pos=new Float32Array(this.count*3), vel=new Float32Array(this.count*3), life=new Float32Array(this.count);
    for(let i=0;i<this.count;i++){
      const r=()=>(Math.random()-0.5);
      pos[i*3]=r()*6; pos[i*3+1]=Math.random()*3; pos[i*3+2]=r()*3;
      vel[i*3]=r()*0.01; vel[i*3+1]=0.005+Math.random()*0.01; vel[i*3+2]=r()*0.01;
      life[i]=Math.random();
    }
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    this.vel=vel; this.life=life;
    const size = theme==='VIP'?0.09: theme==='CYBER'?0.06:0.05;
    const mat=new THREE.PointsMaterial({color, size, transparent:true, opacity:0.9, depthWrite:false, blending:THREE.AdditiveBlending});
    this.points=new THREE.Points(geo, mat);
    parent.add(this.points);
  }
  adaptiveCount(t){ // respect weaker hardware
    const weak = navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4;
    const base = weak? 90 : 220;
    return Math.round(base * (t==='VIP'||t==='CYBER'?1.3:0.9));
  }
  setIntensity(v){ this.points.material.opacity=Math.min(1, v); this.points.material.size=(this.points.material.size||0.05)*v; }
  update(t, dt=0.016){
    const p=this.points.geometry.attributes.position.array;
    for(let i=0;i<this.count;i++){
      this.life[i]+=dt*0.3;
      p[i*3]+=this.vel[i*3]; p[i*3+1]+=this.vel[i*3+1]; p[i*3+2]+=this.vel[i*3+2];
      if(p[i*3+1]>3.4||this.life[i]>1){
        p[i*3]=(Math.random()-0.5)*6; p[i*3+1]=-0.5; p[i*3+2]=(Math.random()-0.5)*3; this.life[i]=0;
      }
    }
    this.points.geometry.attributes.position.needsUpdate=true;
    if(this.theme==='CYBER'||this.theme==='VIP') this.points.rotation.y+=dt*0.03;
  }
  dispose(){ this.points.geometry.dispose(); this.points.material.dispose(); this.points.parent?.remove(this.points); }
}
