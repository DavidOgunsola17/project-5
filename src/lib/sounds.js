let soundEnabled = true;

export const toggleSound = () => {
  soundEnabled = !soundEnabled;
  return soundEnabled;
};

export const isSoundEnabled = () => soundEnabled;

const createOscillator = (frequency, duration, type = 'sine') => {
  if (!soundEnabled) return;

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.warn('Audio not supported');
  }
};

export const sounds = {
  tap: () => createOscillator(800, 0.08, 'sine'),

  transition: () => createOscillator(600, 0.12, 'sine'),

  success: () => {
    if (!soundEnabled) return;
    createOscillator(523, 0.08, 'sine');
    setTimeout(() => createOscillator(659, 0.12, 'sine'), 80);
  },

  countdown: () => createOscillator(440, 0.15, 'sine'),

  gameStart: () => {
    if (!soundEnabled) return;
    createOscillator(392, 0.1, 'sine');
    setTimeout(() => createOscillator(523, 0.1, 'sine'), 100);
    setTimeout(() => createOscillator(659, 0.15, 'sine'), 200);
  },

  gameEnd: () => {
    if (!soundEnabled) return;
    createOscillator(659, 0.15, 'sine');
    setTimeout(() => createOscillator(523, 0.2, 'sine'), 150);
  },
};
