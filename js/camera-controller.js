// Camera Controller — cinematic first-person with subtle idle drift + framing.
import * as THREE from 'three';
export class CameraController {
  constructor(camera){ this.camera=camera; this.target=new THREE.Vector3(0,0.2,1.6); this.basePos=new THREE.Vector3(0,0.35,1.9); this.t=0; this.shake=0; this.lookY=0.2; }
  setShake(v){ this.shake=v; }
  update(dt){
    this.t+=dt;
    const idleX=Math.sin(this.t*0.4)*0.04;
    const idleY=Math.cos(this.t*0.55)*0.025;
    this.camera.position.set(this.basePos.x+idleX, this.basePos.y+idleY, this.basePos.z);
    const sx=this.shake? (Math.random()-0.5)*this.shake*0.05 :0;
    const sy=this.shake? (Math.random()-0.5)*this.shake*0.05 :0;
    this.camera.lookAt(this.target.x+sx, this.target.y+sy+this.lookY, this.target.z);
  }
  intro(done){ // camera sweep in at start
    const start=performance.now();
    const from=new THREE.Vector3(0,1.4,3.2);
    const to=this.basePos.clone();
    const step=()=>{
      const t=Math.min(1,(performance.now()-start)/1800);
      const e=1-Math.pow(1-t,3);
      this.camera.position.lerpVectors(from,to,e);
      this.camera.lookAt(this.target);
      if(t<1) requestAnimationFrame(step); else { this.basePos.copy(to); done?.(); }
    };
    step();
  }
}
