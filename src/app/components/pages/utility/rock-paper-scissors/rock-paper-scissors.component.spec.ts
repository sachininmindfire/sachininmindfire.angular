import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RockPaperScissorsComponent } from './rock-paper-scissors.component';

describe('RockPaperScissorsComponent', () => {
  let component: RockPaperScissorsComponent;
  let fixture: ComponentFixture<RockPaperScissorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RockPaperScissorsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RockPaperScissorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should evaluate winner correctly for rock', () => {
    expect(component.evaluateWinner('rock', 'scissors')).toBe('win');
    expect(component.evaluateWinner('rock', 'paper')).toBe('lose');
    expect(component.evaluateWinner('rock', 'rock')).toBe('draw');
  });

  it('should evaluate winner correctly for paper', () => {
    expect(component.evaluateWinner('paper', 'rock')).toBe('win');
    expect(component.evaluateWinner('paper', 'scissors')).toBe('lose');
    expect(component.evaluateWinner('paper', 'paper')).toBe('draw');
  });

  it('should evaluate winner correctly for scissors', () => {
    expect(component.evaluateWinner('scissors', 'paper')).toBe('win');
    expect(component.evaluateWinner('scissors', 'rock')).toBe('lose');
    expect(component.evaluateWinner('scissors', 'scissors')).toBe('draw');
  });

  it('should counter player in impossible mode', () => {
    component.setDifficulty('impossible');
    expect(component.generateComputerMove('rock')).toBe('paper');
    expect(component.generateComputerMove('paper')).toBe('scissors');
    expect(component.generateComputerMove('scissors')).toBe('rock');
  });

  it('should update scores and history on manual move', () => {
    component.setDifficulty('impossible'); // Predictable outcome -> lose
    component.playManualMove('rock');

    expect(component.playerMove()).toBe('rock');
    expect(component.computerMove()).toBe('paper');
    expect(component.roundResult()).toBe('lose');
    expect(component.computerScore()).toBe(1);
    expect(component.playerScore()).toBe(0);
    expect(component.roundHistory().length).toBe(1);
  });

  it('should compute match winner in best-of-3 format', () => {
    component.setMatchFormat('best-of-3');
    component.playerScore.set(2);
    component.computerScore.set(0);

    expect(component.matchWinner()).toBe('player');
  });

  it('should reset game state properly', () => {
    component.playerScore.set(3);
    component.computerScore.set(2);
    component.drawScore.set(1);
    component.currentStreak.set(3);

    component.resetGame();

    expect(component.playerScore()).toBe(0);
    expect(component.computerScore()).toBe(0);
    expect(component.drawScore()).toBe(0);
    expect(component.currentStreak()).toBe(0);
    expect(component.roundHistory().length).toBe(0);
  });
});
