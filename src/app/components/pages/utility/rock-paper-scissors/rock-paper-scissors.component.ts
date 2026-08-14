import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type GestureType = 'rock' | 'paper' | 'scissors' | 'unknown' | 'none';
export type GameResult = 'win' | 'lose' | 'draw' | null;
export type GameDifficulty = 'classic' | 'smart' | 'impossible';
export type MatchFormat = 'endless' | 'best-of-3' | 'best-of-5';

export interface RoundHistory {
  id: number;
  playerMove: GestureType;
  computerMove: GestureType;
  result: GameResult;
  timestamp: Date;
}

const GESTURE_ICONS: Record<GestureType, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
  unknown: '❓',
  none: '👋'
};

const GESTURE_LABELS: Record<GestureType, string> = {
  rock: 'Rock',
  paper: 'Paper',
  scissors: 'Scissors',
  unknown: 'Detecting...',
  none: 'Show Hand'
};

@Component({
  selector: 'app-rock-paper-scissors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rock-paper-scissors.component.html',
  styleUrl: './rock-paper-scissors.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RockPaperScissorsComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasOverlay') canvasOverlayRef?: ElementRef<HTMLCanvasElement>;

  // Game signals
  readonly isCameraActive = signal<boolean>(false);
  readonly isCameraLoading = signal<boolean>(false);
  readonly cameraError = signal<string | null>(null);
  readonly isModelLoading = signal<boolean>(false);
  readonly modelLoaded = signal<boolean>(false);

  readonly currentDetectedGesture = signal<GestureType>('none');
  readonly gestureConfidence = signal<number>(0);
  readonly isDetecting = signal<boolean>(false);

  readonly isRoundInProgress = signal<boolean>(false);
  readonly countdownValue = signal<number | null>(null);
  readonly countdownText = signal<string>('');

  readonly playerMove = signal<GestureType | null>(null);
  readonly computerMove = signal<GestureType | null>(null);
  readonly roundResult = signal<GameResult>(null);
  readonly resultMessage = signal<string>('');

  readonly playerScore = signal<number>(0);
  readonly computerScore = signal<number>(0);
  readonly drawScore = signal<number>(0);
  readonly currentStreak = signal<number>(0);
  readonly bestStreak = signal<number>(0);

  readonly roundHistory = signal<RoundHistory[]>([]);
  readonly soundEnabled = signal<boolean>(true);
  readonly difficulty = signal<GameDifficulty>('classic');
  readonly matchFormat = signal<MatchFormat>('endless');
  readonly manualMode = signal<boolean>(false);

  readonly matchWinner = computed<'player' | 'computer' | null>(() => {
    const format = this.matchFormat();
    const pScore = this.playerScore();
    const cScore = this.computerScore();
    if (format === 'best-of-3') {
      if (pScore >= 2) return 'player';
      if (cScore >= 2) return 'computer';
    } else if (format === 'best-of-5') {
      if (pScore >= 3) return 'player';
      if (cScore >= 3) return 'computer';
    }
    return null;
  });

  readonly winRate = computed<number>(() => {
    const total = this.playerScore() + this.computerScore() + this.drawScore();
    if (total === 0) return 0;
    return Math.round((this.playerScore() / total) * 100);
  });

  readonly gestureIcons = GESTURE_ICONS;
  readonly gestureLabels = GESTURE_LABELS;

  // MediaPipe & Camera Internals
  private gestureRecognizer: any = null;
  private mediaStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private audioCtx: AudioContext | null = null;
  private lastVideoTime = -1;

  // Player move history for smart AI
  private playerMoveHistory: GestureType[] = [];

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadAudioContext();
      this.initVisionModel();
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
  }

  private loadAudioContext(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    } catch {
      // Audio context might fail in non-interactive state
    }
  }

  private ensureAudioContext(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  async initVisionModel(): Promise<void> {
    if (!this.isBrowser) return;

    try {
      this.isModelLoading.set(true);
      const vision = await import('@mediapipe/tasks-vision');
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      this.gestureRecognizer = await vision.GestureRecognizer.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 1
      });

      this.modelLoaded.set(true);
      this.isModelLoading.set(false);
    } catch (err: any) {
      console.warn('MediaPipe Gesture Recognizer fallback or load issue:', err);
      this.modelLoaded.set(false);
      this.isModelLoading.set(false);
    }
  }

  async startCamera(): Promise<void> {
    if (!this.isBrowser) return;
    this.cameraError.set(null);
    this.isCameraLoading.set(true);
    this.ensureAudioContext();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or connection.');
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      this.isCameraActive.set(true);
      this.isCameraLoading.set(false);
      this.manualMode.set(false);

      // Wait for next tick so video element is rendered
      setTimeout(() => {
        if (this.videoPlayerRef?.nativeElement && this.mediaStream) {
          const video = this.videoPlayerRef.nativeElement;
          video.srcObject = this.mediaStream;
          video.onloadeddata = () => {
            video.play().then(() => {
              this.startDetectionLoop();
            }).catch(e => console.error('Video play failed', e));
          };
        }
      }, 50);

      this.playSound('click');
    } catch (err: any) {
      console.error('Camera access error:', err);
      this.isCameraLoading.set(false);
      this.isCameraActive.set(false);
      this.cameraError.set(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. You can play using Manual Mode below.'
          : 'Could not access camera. Please check your device permissions or switch to Manual Mode.'
      );
    }
  }

  stopCamera(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.videoPlayerRef?.nativeElement) {
      this.videoPlayerRef.nativeElement.srcObject = null;
    }

    this.isCameraActive.set(false);
    this.currentDetectedGesture.set('none');
    this.gestureConfidence.set(0);
  }

  toggleCamera(): void {
    if (this.isCameraActive()) {
      this.stopCamera();
    } else {
      this.startCamera();
    }
  }

  enableManualMode(): void {
    this.stopCamera();
    this.manualMode.set(true);
    this.cameraError.set(null);
    this.playSound('click');
  }

  private startDetectionLoop(): void {
    const video = this.videoPlayerRef?.nativeElement;
    const canvas = this.canvasOverlayRef?.nativeElement;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!this.isCameraActive() || video.paused || video.ended) {
        return;
      }

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (this.gestureRecognizer && video.currentTime !== this.lastVideoTime) {
          this.lastVideoTime = video.currentTime;
          try {
            const results = this.gestureRecognizer.recognizeForVideo(video, Date.now());
            this.processGestureResults(results, ctx, canvas.width, canvas.height);
          } catch (e) {
            // Frame skip
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  private processGestureResults(
    results: any,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    if (!results || !results.landmarks || results.landmarks.length === 0) {
      this.currentDetectedGesture.set('none');
      this.gestureConfidence.set(0);
      return;
    }

    const landmarks = results.landmarks[0];
    this.drawHandLandmarks(ctx, landmarks, width, height);

    let recognizedGesture: GestureType = 'unknown';
    let confidence = 0;

    // Check MediaPipe pre-trained gesture classes
    if (results.gestures && results.gestures.length > 0 && results.gestures[0].length > 0) {
      const topGesture = results.gestures[0][0];
      const category = topGesture.categoryName;
      confidence = Math.round(topGesture.score * 100);

      if (category === 'Closed_Fist') {
        recognizedGesture = 'rock';
      } else if (category === 'Open_Palm') {
        recognizedGesture = 'paper';
      } else if (category === 'Victory') {
        recognizedGesture = 'scissors';
      }
    }

    // Heuristic Landmark Fallback / Booster
    if (recognizedGesture === 'unknown' || confidence < 60) {
      const heuristic = this.classifyHandByLandmarks(landmarks);
      if (heuristic.gesture !== 'unknown') {
        recognizedGesture = heuristic.gesture;
        confidence = heuristic.confidence;
      }
    }

    this.currentDetectedGesture.set(recognizedGesture);
    this.gestureConfidence.set(confidence);
  }

  /**
   * Geometric heuristic calculation based on 21 3D hand landmarks
   */
  private classifyHandByLandmarks(landmarks: Array<{ x: number; y: number; z: number }>): {
    gesture: GestureType;
    confidence: number;
  } {
    if (!landmarks || landmarks.length < 21) {
      return { gesture: 'unknown', confidence: 0 };
    }

    const wrist = landmarks[0];
    const isFingerExtended = (tipIdx: number, pipIdx: number, mcpIdx: number): boolean => {
      const dTip = Math.hypot(landmarks[tipIdx].x - wrist.x, landmarks[tipIdx].y - wrist.y);
      const dPip = Math.hypot(landmarks[pipIdx].x - wrist.x, landmarks[pipIdx].y - wrist.y);
      const dMcp = Math.hypot(landmarks[mcpIdx].x - wrist.x, landmarks[mcpIdx].y - wrist.y);
      return dTip > dPip && dPip > dMcp;
    };

    const indexExtended = isFingerExtended(8, 6, 5);
    const middleExtended = isFingerExtended(12, 10, 9);
    const ringExtended = isFingerExtended(16, 14, 13);
    const pinkyExtended = isFingerExtended(20, 18, 17);

    // Rock: All 4 fingers curled
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: 'rock', confidence: 88 };
    }

    // Paper: All 4 fingers extended
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      return { gesture: 'paper', confidence: 92 };
    }

    // Scissors: Index and Middle extended, Ring and Pinky curled
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: 'scissors', confidence: 90 };
    }

    return { gesture: 'unknown', confidence: 40 };
  }

  private drawHandLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: Array<{ x: number; y: number; z: number }>,
    width: number,
    height: number
  ): void {
    const CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [9, 13], [13, 14], [14, 15], [15, 16],// Ring
      [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [0, 17]                               // Palm base
    ];

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00f0ff';
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;

    // Draw lines
    for (const [start, end] of CONNECTIONS) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }

    // Draw landmark joints
    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i];
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, i === 8 || i === 12 || i === 4 ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = i % 4 === 0 ? '#ffe600' : '#ff007f';
      ctx.fill();
    }

    ctx.restore();
  }

  // GAME LOGIC & ROUND FLOW
  async startRound(): Promise<void> {
    if (this.isRoundInProgress() || this.matchWinner()) return;

    this.ensureAudioContext();
    this.isRoundInProgress.set(true);
    this.playerMove.set(null);
    this.computerMove.set(null);
    this.roundResult.set(null);
    this.resultMessage.set('');

    const steps = [
      { text: '3', count: 3, pitch: 440 },
      { text: '2', count: 2, pitch: 523.25 },
      { text: '1', count: 1, pitch: 659.25 },
      { text: 'SHOOT! 💥', count: 0, pitch: 880 }
    ];

    for (const step of steps) {
      this.countdownValue.set(step.count);
      this.countdownText.set(step.text);
      this.playTone(step.pitch, 0.15, 'sine');
      await this.sleep(800);
    }

    this.countdownValue.set(null);
    this.countdownText.set('');

    // Capture player move
    let chosenPlayerMove: GestureType = this.currentDetectedGesture();
    if (chosenPlayerMove === 'unknown' || chosenPlayerMove === 'none') {
      // Pick random as fallback or prompt
      chosenPlayerMove = 'rock';
    }

    this.executeRound(chosenPlayerMove);
  }

  playManualMove(move: GestureType): void {
    if (this.isRoundInProgress() || this.matchWinner()) return;
    this.ensureAudioContext();
    this.executeRound(move);
  }

  private executeRound(playerGesture: GestureType): void {
    const compGesture = this.generateComputerMove(playerGesture);
    this.playerMove.set(playerGesture);
    this.computerMove.set(compGesture);
    this.playerMoveHistory.push(playerGesture);

    const outcome = this.evaluateWinner(playerGesture, compGesture);
    this.roundResult.set(outcome);

    if (outcome === 'win') {
      this.playerScore.update((s) => s + 1);
      this.currentStreak.update((s) => {
        const newStreak = s + 1;
        if (newStreak > this.bestStreak()) {
          this.bestStreak.set(newStreak);
        }
        return newStreak;
      });
      this.resultMessage.set('You Win This Round! 🎉');
      this.playSound('win');
      this.triggerConfetti();
    } else if (outcome === 'lose') {
      this.computerScore.update((s) => s + 1);
      this.currentStreak.set(0);
      this.resultMessage.set('Computer Wins This Round! 🤖');
      this.playSound('lose');
    } else {
      this.drawScore.update((s) => s + 1);
      this.resultMessage.set('It is a Tie! 🤝');
      this.playSound('draw');
    }

    // Save to history
    this.roundHistory.update((h) => [
      {
        id: Date.now(),
        playerMove: playerGesture,
        computerMove: compGesture,
        result: outcome,
        timestamp: new Date()
      },
      ...h.slice(0, 14)
    ]);

    this.isRoundInProgress.set(false);

    // Check if match won
    if (this.matchWinner() === 'player') {
      this.resultMessage.set('🏆 CHAMPION! You won the match!');
      this.triggerBigConfetti();
      this.playSound('fanfare');
    } else if (this.matchWinner() === 'computer') {
      this.resultMessage.set('💀 Game Over! The AI won the match.');
      this.playSound('lose');
    }
  }

  generateComputerMove(playerMove: GestureType): GestureType {
    const moves: GestureType[] = ['rock', 'paper', 'scissors'];
    const diff = this.difficulty();

    if (diff === 'impossible') {
      // Counters whatever player picked
      if (playerMove === 'rock') return 'paper';
      if (playerMove === 'paper') return 'scissors';
      if (playerMove === 'scissors') return 'rock';
    }

    if (diff === 'smart' && this.playerMoveHistory.length >= 3) {
      // Analyze player's most frequent move
      const counts: Record<string, number> = { rock: 0, paper: 0, scissors: 0 };
      this.playerMoveHistory.forEach((m) => {
        if (counts[m] !== undefined) counts[m]++;
      });
      const topMove = (Object.keys(counts) as GestureType[]).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
      );
      // Counter the top move with 70% probability
      if (Math.random() < 0.7) {
        if (topMove === 'rock') return 'paper';
        if (topMove === 'paper') return 'scissors';
        if (topMove === 'scissors') return 'rock';
      }
    }

    // Classic / Random
    const randomIndex = Math.floor(Math.random() * 3);
    return moves[randomIndex];
  }

  evaluateWinner(player: GestureType, computer: GestureType): GameResult {
    if (player === computer) return 'draw';
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'scissors' && computer === 'paper') ||
      (player === 'paper' && computer === 'rock')
    ) {
      return 'win';
    }
    return 'lose';
  }

  resetGame(): void {
    this.playerScore.set(0);
    this.computerScore.set(0);
    this.drawScore.set(0);
    this.currentStreak.set(0);
    this.playerMove.set(null);
    this.computerMove.set(null);
    this.roundResult.set(null);
    this.resultMessage.set('');
    this.roundHistory.set([]);
    this.playerMoveHistory = [];
    this.playSound('click');
  }

  toggleSound(): void {
    this.soundEnabled.update((v) => !v);
  }

  setDifficulty(d: GameDifficulty): void {
    this.difficulty.set(d);
    this.playSound('click');
  }

  setMatchFormat(f: MatchFormat): void {
    this.matchFormat.set(f);
    this.resetGame();
  }

  // SOUND SYNTHESIZER via Web Audio API
  private playSound(type: 'click' | 'win' | 'lose' | 'draw' | 'fanfare'): void {
    if (!this.soundEnabled() || !this.audioCtx) return;

    if (type === 'click') {
      this.playTone(800, 0.05, 'triangle');
    } else if (type === 'draw') {
      this.playTone(440, 0.2, 'sine');
      setTimeout(() => this.playTone(440, 0.2, 'sine'), 120);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.15, 'sine'), i * 90);
      });
    } else if (type === 'fanfare') {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.25, 'triangle'), i * 110);
      });
    } else if (type === 'lose') {
      const notes = [392, 349.23, 311.13, 261.63];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.18, 'sawtooth'), i * 100);
      });
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.soundEnabled() || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Audio playback failsafe
    }
  }

  // CONFETTI CELEBRATIONS
  private async triggerConfetti(): Promise<void> {
    if (!this.isBrowser) return;
    try {
      const confettiModule = await import('canvas-confetti');
      const confetti = confettiModule.default || confettiModule;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}
  }

  private async triggerBigConfetti(): Promise<void> {
    if (!this.isBrowser) return;
    try {
      const confettiModule = await import('canvas-confetti');
      const confetti = confettiModule.default || confettiModule;
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch {}
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
