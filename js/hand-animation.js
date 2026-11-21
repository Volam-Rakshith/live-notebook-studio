// Hand & Pen Animation — procedural first-person arms + pen tracking the writing path.
import * as THREE from 'three';
export class HandAnimation {
  constructor(parent){
    this.root=new THREE.Group(); parent.add(this.root);
    this.penTip=new THREE.Group(); this.root.add(this.penTip);
    this.active=false; this.speed=1; this.progress=0;
    this.build();
  }
  build(){
    const skin=new THREE.MeshStandardMaterial({color:0xe8b896, roughness:.7});
    const mat=new THREE.MeshStandardMaterial({color:0x222226, roughness:.6});
    const arm=(x)=>{
      const g=new THREE.Group(); g.position.set(x,0,1.0);
      const upper=new THREE.Mesh(new THREE.CapsuleGeometry(0.09,0.5,6,8), skin); upper.position.y=-0.3; g.add(upper);
      const lower=new THREE.Mesh(new THREE.CapsuleGeometry(0.075,0.45,6,8), skin); lower.position.y=-0.85; g.add(lower);
      const hand=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.22,0.2), skin); hand.position.y=-1.25; g.add(hand);
      g.castShadow=true; return g;
    };
    this.armL=arm(-0.35); this.armR=arm(0.35);
    this.root.add(this.armL, this.armR);
    // pen
    this.pen=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.22,8), new THREE.MeshStandardMaterial({color:0x111111, metalness:.7, roughness:.3})); body.rotation.z=Math.PI/2.4;
    const tip=new THREE.Mesh(new THREE.ConeGeometry(0.012,0.05,8), new THREE.MeshStandardMaterial({color:0x999999, metalness:.9}));
    tip.rotation.z=Math.PI/2.4; tip.position.y=-0.1;
    this.pen.add(body, tip); this.pen.position.set(0,-0.05,0);
    this.penTip.add(this.pen);
  }
  startWriting(book){
    this.active=true; this.progress=0; this.book=book;
  }
  stop(){ this.active=false; }
  update(dt){
    if(!this.active||!this.book) return;
    this.progress += dt*0.5*this.speed;
    if(this.progress>1) this.progress=1;
    // pen sweep across page surface
    const x=-0.85+this.progress*1.7;
    const y=0.5-this.progress*0.3;
    const z=1.42;
    this.penTip.position.set(x,y,z);
    this.penTip.rotation.x = Math.sin(this.progress*Math.PI*6)*0.12;
    this.penTip.rotation.z = Math.cos(this.progress*Math.PI*6)*0.08;
    // hands follow pen
    this.armR.rotation.x = -0.6+this.progress*0.4;
    this.armR.position.x = 0.35 - (x-0.35)*0.35;
    this.armR.position.z = 0.9 + this.progress*0.4;
    this.armL.rotation.x = -0.9+this.progress*0.3;
    if(this.progress>=1){ this.active=false; }
  }
}
