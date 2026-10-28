'use client';

import {Music2,VolumeX} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';

type MobileAudioWindow=Window&{webkitAudioContext?:typeof AudioContext};

const melody=[523.25,659.25,783.99,880,783.99,659.25,587.33,698.46,783.99,987.77,880,783.99,659.25,587.33,523.25,392];
const bass=[130.81,146.83,98,130.81];

function playPianoTone(context:AudioContext,frequency:number,at:number,volume:number){
 const partials:[[number,number],[number,number],[number,number],[number,number]]=[[1,1],[2,.34],[3,.15],[4,.06]];
 for(const [multiple,level] of partials){
  const oscillator=context.createOscillator();
  const envelope=context.createGain();
  oscillator.type='sine';
  oscillator.frequency.setValueAtTime(frequency*multiple,at);
  envelope.gain.setValueAtTime(.0001,at);
  envelope.gain.exponentialRampToValueAtTime(volume*level,at+.012);
  envelope.gain.exponentialRampToValueAtTime(.0001,at+1.3);
  oscillator.connect(envelope);
  envelope.connect(context.destination);
  oscillator.start(at);
  oscillator.stop(at+1.35);
  oscillator.addEventListener('ended',()=>{oscillator.disconnect();envelope.disconnect();},{once:true});
 }
}

export function PianoToggle(){
 const [playing,setPlaying]=useState(false);
 const [unavailable,setUnavailable]=useState(false);
 const contextRef=useRef<AudioContext|null>(null);
 const timerRef=useRef<number|null>(null);

 function stop(){
  if(timerRef.current!==null){window.clearInterval(timerRef.current);timerRef.current=null;}
  const context=contextRef.current;
  contextRef.current=null;
  if(context&&context.state!=='closed')void context.close();
  setPlaying(false);
 }

 async function start(){
  // Older Safari/iOS versions expose Web Audio under the prefixed name.
  const AudioContextClass=window.AudioContext??(window as MobileAudioWindow).webkitAudioContext;
  if(!AudioContextClass){setUnavailable(true);return;}
  try{
   const context=new AudioContextClass();
   contextRef.current=context;
   await context.resume();
   let step=0;
   const play=()=>{
    const now=context.currentTime+.04;
    playPianoTone(context,melody[step%melody.length],now,.17);
    if(step%4===0)playPianoTone(context,bass[Math.floor(step/4)%bass.length],now,.08);
    step++;
   };
   play();
   timerRef.current=window.setInterval(play,850);
   setPlaying(true);
  }catch{
   setUnavailable(true);
   stop();
  }
 }

 function toggle(){if(playing)stop();else void start();}

 useEffect(()=>()=>{
  if(timerRef.current!==null)window.clearInterval(timerRef.current);
  const context=contextRef.current;
  if(context&&context.state!=='closed')void context.close();
 },[]);

 return <>
  <button className="piano-toggle" type="button" onClick={toggle} aria-pressed={playing} aria-label={playing?'Piyano müziğini kapat':'Piyano müziğini aç'} title="Özgün melodi · ses varsayılan olarak kapalı">
   {playing?<VolumeX size={17}/>:<Music2 size={17}/>}<span>Piyano</span>
  </button>
  <span className="sr-only" aria-live="polite">{unavailable?'Bu tarayıcıda piyano sesi kullanılamıyor.':playing?'Özgün piyano melodisi açık.':'Özgün piyano melodisi kapalı.'}</span>
 </>;
}
