import confetti from 'canvas-confetti';

export function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#3b82f6', '#f59e0b']
  });
}
