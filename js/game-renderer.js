// Game Renderer — wires all 3D systems, listens for dashboard commands via BroadcastChannel.
import * as THREE from 'three';
import { ThemeManager } from './theme-manager.js';
import { EnvironmentManager } from './environment-manager.js';
import { NotebookSystem } from './notebook-system.js';
import { HandAnimation } from './hand-animation.js';
import { WritingAnimation } from './writing-animation.js';
import { CameraController } from './camera-controller.js';
import { audio } from './audio-manager.js';

export class GameRenderer {
  constructor(container){
    this.container=container;
    this.renderer=new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    this.renderer.shadowMap.enabled=true; this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure=1.1;
    container.appendChild(this.renderer.domElement);

    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(55, container.clientWidth/container.clientHeight, 0.1, 100);
    this.cameraController=new CameraController(this.camera);

    this.themeManager=new ThemeManager();
    this.env=new EnvironmentManager(this.scene);
    this.notebook=new NotebookSystem(this.scene);
    this.hands=new HandAnimation(this.scene);
    this.writing=new WritingAnimation(this.notebook, this.hands);

    this.paused=false; this.running=false; this.clock=new THREE.Clock();
    this.pending=null; this.speed=1; this.particles=1;

    // command channel from dashboard
    this.channel=new BroadcastChannel('livenotebook');
    this.channel.onmessage=(e)=>this.onCommand(e.data);

    window.addEventListener('resize', ()=>this.onResize());
  }
  start(){
    this.themeManager.apply('CLASSIC', this.scene, this.env);
    this.notebook.build(); this.notebook.open();
    audio.setEnabled(true);
    this.running=true;
    this.cameraController.intro(()=>{ this.toast('LIVE NOTEBOOK STUDIO'); });
    this.loop();
  }
  onCommand(cmd){
    if(cmd.type==='theme'){ this.themeManager.apply(cmd.theme, this.scene, this.env); audio.theme(); this.toast('THEME: '+cmd.theme); }
    if(cmd.type==='book'){ this.notebook.setBook(cmd.book); this.notebook.build(); this.notebook.open(); audio.pop(); this.toast('BOOK: '+cmd.book); }
    if(cmd.type==='write'){ if(!this.writing.active) this.doWrite(cmd.text); }
    if(cmd.type==='pause'){ this.paused=!this.paused; this.toast(this.paused?'ANIMATION PAUSED':'ANIMATION RESUMED'); }
    if(cmd.type==='speed'){ this.speed=cmd.speed; this.writing.setSpeed(cmd.speed); }
    if(cmd.type==='particles'){ this.particles=cmd.value; this.env.particles?.setIntensity(cmd.value); }
    if(cmd.type==='sound'){ audio.setEnabled(cmd.value); }
    if(cmd.type==='stop'){ this.writing.active=false; this.writing.complete(); this.toast('EMERGENCY STOP'); }
    if(cmd.type==='page'){ this.notebook.turnPage(); audio.pageTurn(); }
    if(cmd.type==='reset'){ this.notebook.clearInk(); this.notebook.page=0; audio.pop(); }
  }
  doWrite(text){
    this.writing.speed=this.speed;
    this.writing.play(text, ()=>{ this.cameraController.setShake(0.4); setTimeout(()=>this.cameraController.setShake(0),300); });
  }
  toast(msg){ const el=document.getElementById('toast'); if(el){ el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1600); } }
  onResize(){
    const w=this.container.clientWidth, h=this.container.clientHeight;
    this.camera.aspect=w/h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w,h);
  }
  loop(){
    if(!this.running) return;
    requestAnimationFrame(()=>this.loop());
    const dt=this.clock.getDelta();
    if(this.paused) return;
    this.cameraController.update(dt);
    this.hands.update(dt);
    this.env.update(this.clock.elapsedTime);
    this.renderer.render(this.scene,this.camera);
  }
  dispose(){ this.running=false; this.channel?.close(); this.renderer.dispose(); }
}
