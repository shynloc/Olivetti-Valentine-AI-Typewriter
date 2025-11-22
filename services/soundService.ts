
// A synthesized sound service using Web Audio API to avoid external assets
let audioCtx: AudioContext | null = null;
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const startAmbientSound = () => {
    const ctx = getAudioContext();
    if (ambientOsc) return; // Already playing

    const t = ctx.currentTime;
    
    // Low frequency "Room Hum" / Lamp Buzz
    ambientOsc = ctx.createOscillator();
    ambientOsc.type = 'sine';
    ambientOsc.frequency.value = 60; // 60Hz Mains hum

    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0;
    
    ambientOsc.connect(ambientGain);
    ambientGain.connect(ctx.destination);
    
    ambientOsc.start(t);
    ambientGain.gain.linearRampToValueAtTime(0.02, t + 2); // Fade in gently
};

export const stopAmbientSound = () => {
    if (ambientOsc && ambientGain && audioCtx) {
        const t = audioCtx.currentTime;
        ambientGain.gain.linearRampToValueAtTime(0, t + 0.5);
        ambientOsc.stop(t + 0.5);
        setTimeout(() => {
            ambientOsc = null;
            ambientGain = null;
        }, 500);
    }
};

export const playKeySound = () => {
  const ctx = getAudioContext();
  const t = ctx.currentTime;

  // 1. Mechanical "Click" (High frequency burst)
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.5, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);

  // 2. Mechanical "Thud" (Low frequency body resonance)
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.6, t);
  oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);
};

export const playSwitchSound = () => {
  const ctx = getAudioContext();
  const t = ctx.currentTime;

  // Crisp plastic click
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2000;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.05);
};

export const playReturnSound = () => {
  const ctx = getAudioContext();
  const t = ctx.currentTime;

  // 1. The "Zip" slide sound
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const slide = ctx.createBufferSource();
  slide.buffer = noiseBuffer;
  const slideFilter = ctx.createBiquadFilter();
  slideFilter.type = 'bandpass';
  slideFilter.frequency.setValueAtTime(800, t);
  slideFilter.frequency.linearRampToValueAtTime(1200, t + 0.4);
  const slideGain = ctx.createGain();
  slideGain.gain.setValueAtTime(0.1, t);
  slideGain.gain.linearRampToValueAtTime(0.3, t + 0.2);
  slideGain.gain.linearRampToValueAtTime(0.01, t + 0.4);
  slide.connect(slideFilter);
  slideFilter.connect(slideGain);
  slideGain.connect(ctx.destination);
  slide.start(t);

  // 2. The Bell "Ding"
  setTimeout(() => {
     const bellT = ctx.currentTime;
     const osc = ctx.createOscillator();
     osc.type = 'sine';
     osc.frequency.setValueAtTime(1800, bellT);
     const gain = ctx.createGain();
     gain.gain.setValueAtTime(0, bellT);
     gain.gain.linearRampToValueAtTime(0.6, bellT + 0.02);
     gain.gain.exponentialRampToValueAtTime(0.01, bellT + 1.5);
     osc.connect(gain);
     gain.connect(ctx.destination);
     osc.start(bellT);
     osc.stop(bellT + 2);
  }, 350);
};

export const playPaperLoadSound = () => {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.5);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
};

export const playPaperCutSound = () => {
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  
  // Sharp tearing sound
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const cut = ctx.createBufferSource();
  cut.buffer = noiseBuffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 800;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.8, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  
  cut.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  cut.start(t);
};

export const playCrumpleSound = () => {
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    // More chaotic noise for crumpling
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, t);
  filter.frequency.linearRampToValueAtTime(200, t + 0.5);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1.0, t);
  // Multiple peaks to simulate crinkling
  gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
  gain.gain.linearRampToValueAtTime(0.8, t + 0.2);
  gain.gain.linearRampToValueAtTime(0.1, t + 0.4);
  gain.gain.linearRampToValueAtTime(0, t + 0.8);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(t);
};

export const playShutterSound = () => {
  const ctx = getAudioContext();
  const t = ctx.currentTime;

  // 1. Sharp Click (Leaf Shutter)
  const clickOsc = ctx.createOscillator();
  clickOsc.type = 'square';
  clickOsc.frequency.setValueAtTime(800, t);
  clickOsc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
  
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.7, t);
  clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
  
  clickOsc.connect(clickGain);
  clickGain.connect(ctx.destination);
  clickOsc.start(t);
  clickOsc.stop(t + 0.1);

  // 2. High Frequency "Snap"
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const snap = ctx.createBufferSource();
  snap.buffer = noiseBuffer;
  const snapFilter = ctx.createBiquadFilter();
  snapFilter.type = 'highpass';
  snapFilter.frequency.value = 3000;
  
  const snapGain = ctx.createGain();
  snapGain.gain.setValueAtTime(0.6, t);
  snapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

  snap.connect(snapFilter);
  snapFilter.connect(snapGain);
  snapGain.connect(ctx.destination);
  snap.start(t);
};

export const playMotorSound = () => {
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const duration = 2.0; 

  // Modern Electronic Servo Sound

  // 1. The High-Pitched Whine (Triangle wave)
  const osc1 = ctx.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(600, t);
  osc1.frequency.linearRampToValueAtTime(650, t + 0.2); // Spool up fast
  osc1.frequency.linearRampToValueAtTime(640, t + duration - 0.2); 
  osc1.frequency.linearRampToValueAtTime(100, t + duration); // Spool down

  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0, t);
  gain1.gain.linearRampToValueAtTime(0.15, t + 0.1);
  gain1.gain.setValueAtTime(0.15, t + duration - 0.1);
  gain1.gain.linearRampToValueAtTime(0, t + duration);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(t);
  osc1.stop(t + duration);

  // 2. The Smooth Motor Buzz (Sawtooth)
  const osc2 = ctx.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(150, t);
  osc2.frequency.linearRampToValueAtTime(180, t + 0.2);
  osc2.frequency.linearRampToValueAtTime(180, t + duration - 0.2);
  osc2.frequency.linearRampToValueAtTime(50, t + duration);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0, t);
  gain2.gain.linearRampToValueAtTime(0.1, t + 0.1);
  gain2.gain.setValueAtTime(0.1, t + duration - 0.1);
  gain2.gain.linearRampToValueAtTime(0, t + duration);

  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'lowpass';
  filter2.frequency.value = 400;

  osc2.connect(filter2);
  filter2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(t);
  osc2.stop(t + duration);
};
