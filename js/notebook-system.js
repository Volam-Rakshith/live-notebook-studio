// Notebook System — book editions (cosmetic), pages, ink layer. Procedural.
import * as THREE from 'three';
export const BOOK_STYLES = {
  CLASSIC:   { cover:0x8a1a1a, accent:0xd4af37, pages:0xf4ecd8 },
  OG:        { cover:0x3a2a08, accent:0xf5d67b, pages:0xfdf3d0 },
  MEMBER:    { cover:0x1a4a3a, accent:0x7be8a8, pages:0xeef5e8 },
  ROYAL:     { cover:0x3a1a4a, accent:0xd8a0ff, pages:0xf0e8f8 },
  LEGENDARY: { cover:0x1a1a2e, accent:0xffd700, pages:0xf8f0d0 },
};
export class NotebookSystem {
  constructor(scene){ this.scene=scene; this.root=new THREE.Group(); scene.add(this.root); this.page=0; this.opened=false; this.writing=false; this.inkMeshes=[]; this.style=BOOK_STYLES.CLASSIC; this.inkColor=0x111111; }
  setBook(name){ if(BOOK_STYLES[name]) this.style=BOOK_STYLES[name]; }
  build(){
    this.dispose();
    const s=this.style;
    // cover
    this.cover=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.28,2.7), new THREE.MeshStandardMaterial({color:s.cover, roughness:.7, metalness:.15}));
    this.cover.castShadow=true; this.root.add(this.cover);
    // spine accent
    const spine=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.28,2.7), new THREE.MeshStandardMaterial({color:s.accent, metalness:.8, roughness:.3}));
    spine.position.set(-1.01,0,0); this.root.add(spine);
    // logo plate
    const plate=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.04,0.6), new THREE.MeshStandardMaterial({color:s.accent, metalness:.8, roughness:.2, emissive:s.accent, emissiveIntensity:0.25}));
    plate.position.set(0,0.16,0.3); plate.rotation.x=-0.2; this.root.add(plate);
    // back
    this.back=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.28,2.7), new THREE.MeshStandardMaterial({color:s.cover, roughness:.8}));
    this.back.position.set(0,0,-2.71); this.root.add(this.back);
    // pages block (visible stack on right edge)
    this.pages=new THREE.Mesh(new THREE.BoxGeometry(1.9,0.24,2.6), new THREE.MeshStandardMaterial({color:s.pages, roughness:.9}));
    this.pages.position.set(0,0,0.05); this.root.add(this.pages);
    // active page plane (for writing)
    this.pageMat=new THREE.MeshStandardMaterial({color:s.pages, roughness:.95, side:THREE.DoubleSide});
    this.activePage=new THREE.Mesh(new THREE.PlaneGeometry(1.86,2.56), this.pageMat);
    this.activePage.position.set(0,0,1.36); this.activePage.rotation.x=-Math.PI/2+0.15;
    this.activePage.receiveShadow=true;
    this.root.add(this.activePage);
    // ink canvas overlay
    this.inkCanvas=document.createElement('canvas'); this.inkCanvas.width=1024; this.inkCanvas.height=1413;
    this.inkTex=new THREE.CanvasTexture(this.inkCanvas); this.inkTex.anisotropy=4;
    this.inkMat=new THREE.MeshBasicMaterial({map:this.inkTex, transparent:true, depthWrite:false});
    this.ink=new THREE.Mesh(new THREE.PlaneGeometry(1.86,2.56), this.inkMat);
    this.ink.position.copy(this.activePage.position); this.ink.rotation.copy(this.activePage.rotation);
    this.root.add(this.ink);
    this.ctx=this.inkCanvas.getContext('2d');
    this.clearInk();
  }
  clearInk(){ this.ctx.clearRect(0,0,1024,1413); this.inkTex.needsUpdate=true; }
  open(){ this.cover.rotation.y=-Math.PI*0.92; this.cover.position.z=1.0; this.opened=true; }
  close(){ this.cover.rotation.y=0; this.cover.position.z=0; this.opened=false; }
  renderText(chars){ // draws full text snapshot onto ink canvas (incremental re-render)
    this.clearInk();
    this.ctx.fillStyle='rgba(10,10,16,0.92)';
    this.ctx.font='bold 54px Georgia, serif';
    this.ctx.textAlign='left'; this.ctx.textBaseline='top';
    const perLine=22;
    chars.forEach((ch,i)=>{ this.ctx.fillText(ch, 40, 60 + Math.floor(i/perLine)*68); });
    this.inkTex.needsUpdate=true;
  }
  setInkColor(hex){ this.inkColor=hex; this.ctx.fillStyle='#'+hex.toString(16).padStart(6,'0'); }
  turnPage(){ // animate page flip: quick rotate + clear ink
    this.page++;
    this.clearInk();
    const p=new THREE.Mesh(new THREE.PlaneGeometry(1.86,2.56), new THREE.MeshStandardMaterial({color:this.style.pages, side:THREE.DoubleSide}));
    p.position.set(0,0,1.36); p.rotation.x=-Math.PI/2+0.15;
    this.root.add(p);
    const start=performance.now();
    const anim=()=>{
      const t=Math.min(1,(performance.now()-start)/700);
      p.rotation.y=t*Math.PI;
      p.position.z=1.36+Math.sin(t*Math.PI)*0.3;
      if(t<1) requestAnimationFrame(anim); else { this.root.remove(p); p.geometry.dispose(); p.material.dispose(); }
    };
    anim();
  }
  dispose(){
    this.root.traverse(o=>{ if(o.isMesh){ o.geometry?.dispose?.(); if(o.material){ (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose()); } } });
    while(this.root.children.length) this.root.remove(this.root.children[0]);
  }
}
