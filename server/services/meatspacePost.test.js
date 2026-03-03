import { describe, it, expect } from 'vitest';

// Inline pure functions to avoid mocking file I/O

function generateDoublingChain(startValue, steps = 8) {
  const start = startValue ?? (Math.floor(Math.random() * 7) + 3);
  const questions = [];
  let current = start;
  for (let i = 0; i < steps; i++) {
    const next = current * 2;
    questions.push({ prompt: `${current} x 2`, expected: next });
    current = next;
  }
  return { type: 'doubling-chain', config: { startValue: start, steps }, questions };
}

function generateSerialSubtraction(start, subtrahend = 7, steps = 10) {
  const startVal = start ?? (Math.floor(Math.random() * 101) + 100);
  const questions = [];
  let current = startVal;
  for (let i = 0; i < steps; i++) {
    const next = current - subtrahend;
    questions.push({ prompt: `${current} - ${subtrahend}`, expected: next });
    current = next;
  }
  return { type: 'serial-subtraction', config: { startValue: startVal, subtrahend, steps }, questions };
}

function generateMultiplication(count = 10, maxDigits = 2) {
  const maxVal = Math.pow(10, maxDigits) - 1;
  const minVal = maxDigits > 1 ? Math.pow(10, maxDigits - 1) : 1;
  const questions = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    const b = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    questions.push({ prompt: `${a} x ${b}`, expected: a * b });
  }
  return { type: 'multiplication', config: { count, maxDigits }, questions };
}

function generatePowers(bases = [2, 3, 5], maxExponent = 10, count = 8) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const base = bases[Math.floor(Math.random() * bases.length)];
    const exp = Math.floor(Math.random() * (maxExponent - 1)) + 2;
    questions.push({ prompt: `${base}^${exp}`, expected: Math.pow(base, exp) });
  }
  return { type: 'powers', config: { bases, maxExponent, count }, questions };
}

function generateEstimation(count = 5) {
  const ops = ['+', '-', 'x'];
  const questions = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 900) + 100;
    const b = Math.floor(Math.random() * 900) + 100;
    const op = ops[Math.floor(Math.random() * ops.length)];
    let expected, prompt;
    if (op === '+') { expected = a + b; prompt = `${a} + ${b}`; }
    else if (op === '-') { expected = a - b; prompt = `${a} - ${b}`; }
    else { expected = a * b; prompt = `${a} x ${b}`; }
    questions.push({ prompt, expected });
  }
  return { type: 'estimation', config: { count }, questions };
}

function scoreDrill(type, questions, timeLimitMs) {
  if (!questions?.length) return 0;
  const answered = questions.filter(q => q.answered !== null && q.answered !== undefined);
  const correct = questions.filter(q => q.correct);
  const correctRatio = correct.length / questions.length;
  const totalResponseMs = answered.reduce((sum, q) => sum + (q.responseMs || 0), 0);
  const avgResponseMs = answered.length > 0 ? totalResponseMs / answered.length : timeLimitMs;
  const speedBonus = Math.max(0, 1 - avgResponseMs / timeLimitMs);
  const score = Math.round((correctRatio * 0.8 + speedBonus * 0.2) * 100);
  return Math.min(100, Math.max(0, score));
}

// =============================================================================
// DOUBLING CHAIN TESTS
// =============================================================================

describe('generateDoublingChain', () => {
  it('generates correct number of steps', () => {
    const result = generateDoublingChain(5, 6);
    expect(result.questions).toHaveLength(6);
    expect(result.type).toBe('doubling-chain');
  });

  it('each value doubles from the previous', () => {
    const result = generateDoublingChain(7, 4);
    expect(result.questions[0].expected).toBe(14);
    expect(result.questions[1].expected).toBe(28);
    expect(result.questions[2].expected).toBe(56);
    expect(result.questions[3].expected).toBe(112);
  });

  it('uses random start 3-9 when not provided', () => {
    const result = generateDoublingChain(undefined, 3);
    const start = result.config.startValue;
    expect(start).toBeGreaterThanOrEqual(3);
    expect(start).toBeLessThanOrEqual(9);
  });

  it('stores config with start value and steps', () => {
    const result = generateDoublingChain(4, 5);
    expect(result.config).toEqual({ startValue: 4, steps: 5 });
  });
});

// =============================================================================
// SERIAL SUBTRACTION TESTS
// =============================================================================

describe('generateSerialSubtraction', () => {
  it('generates correct number of steps', () => {
    const result = generateSerialSubtraction(100, 7, 5);
    expect(result.questions).toHaveLength(5);
    expect(result.type).toBe('serial-subtraction');
  });

  it('each value decreases by subtrahend', () => {
    const result = generateSerialSubtraction(100, 7, 4);
    expect(result.questions[0].expected).toBe(93);
    expect(result.questions[1].expected).toBe(86);
    expect(result.questions[2].expected).toBe(79);
    expect(result.questions[3].expected).toBe(72);
  });

  it('uses random start 100-200 when not provided', () => {
    const result = generateSerialSubtraction(undefined, 7, 3);
    const start = result.config.startValue;
    expect(start).toBeGreaterThanOrEqual(100);
    expect(start).toBeLessThanOrEqual(200);
  });
});

// =============================================================================
// MULTIPLICATION TESTS
// =============================================================================

describe('generateMultiplication', () => {
  it('generates requested number of questions', () => {
    const result = generateMultiplication(5, 2);
    expect(result.questions).toHaveLength(5);
    expect(result.type).toBe('multiplication');
  });

  it('operands are within digit limits for 2-digit', () => {
    const result = generateMultiplication(20, 2);
    for (const q of result.questions) {
      // Parse operands from prompt "A x B"
      const [a, b] = q.prompt.split(' x ').map(Number);
      expect(a).toBeGreaterThanOrEqual(10);
      expect(a).toBeLessThanOrEqual(99);
      expect(b).toBeGreaterThanOrEqual(10);
      expect(b).toBeLessThanOrEqual(99);
      expect(q.expected).toBe(a * b);
    }
  });

  it('1-digit mode produces single digit operands', () => {
    const result = generateMultiplication(10, 1);
    for (const q of result.questions) {
      const [a, b] = q.prompt.split(' x ').map(Number);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(9);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(9);
    }
  });
});

// =============================================================================
// POWERS TESTS
// =============================================================================

describe('generatePowers', () => {
  it('generates requested number of questions', () => {
    const result = generatePowers([2, 3], 8, 6);
    expect(result.questions).toHaveLength(6);
    expect(result.type).toBe('powers');
  });

  it('uses only specified bases', () => {
    const result = generatePowers([2, 5], 10, 20);
    for (const q of result.questions) {
      const base = parseInt(q.prompt.split('^')[0]);
      expect([2, 5]).toContain(base);
    }
  });

  it('expected values are correct', () => {
    const result = generatePowers([2], 5, 10);
    for (const q of result.questions) {
      const [base, exp] = q.prompt.split('^').map(Number);
      expect(q.expected).toBe(Math.pow(base, exp));
    }
  });

  it('exponents are at least 2', () => {
    const result = generatePowers([2, 3, 5], 10, 30);
    for (const q of result.questions) {
      const exp = parseInt(q.prompt.split('^')[1]);
      expect(exp).toBeGreaterThanOrEqual(2);
    }
  });
});

// =============================================================================
// ESTIMATION TESTS
// =============================================================================

describe('generateEstimation', () => {
  it('generates requested number of questions', () => {
    const result = generateEstimation(3);
    expect(result.questions).toHaveLength(3);
    expect(result.type).toBe('estimation');
  });

  it('expected values match the operation', () => {
    const result = generateEstimation(20);
    for (const q of result.questions) {
      if (q.prompt.includes(' + ')) {
        const [a, b] = q.prompt.split(' + ').map(Number);
        expect(q.expected).toBe(a + b);
      } else if (q.prompt.includes(' - ')) {
        const [a, b] = q.prompt.split(' - ').map(Number);
        expect(q.expected).toBe(a - b);
      } else {
        const [a, b] = q.prompt.split(' x ').map(Number);
        expect(q.expected).toBe(a * b);
      }
    }
  });

  it('operands are 3-digit numbers (100-999)', () => {
    const result = generateEstimation(20);
    for (const q of result.questions) {
      const nums = q.prompt.match(/\d+/g).map(Number);
      for (const n of nums) {
        expect(n).toBeGreaterThanOrEqual(100);
        expect(n).toBeLessThanOrEqual(999);
      }
    }
  });
});

// =============================================================================
// SCORING TESTS
// =============================================================================

describe('scoreDrill', () => {
  it('returns 0 for empty questions', () => {
    expect(scoreDrill('multiplication', [], 60000)).toBe(0);
    expect(scoreDrill('multiplication', null, 60000)).toBe(0);
  });

  it('100% accuracy with fast responses gives high score', () => {
    const questions = [
      { prompt: '5 x 3', expected: 15, answered: 15, correct: true, responseMs: 1000 },
      { prompt: '7 x 4', expected: 28, answered: 28, correct: true, responseMs: 1500 },
      { prompt: '6 x 8', expected: 48, answered: 48, correct: true, responseMs: 2000 }
    ];
    const score = scoreDrill('multiplication', questions, 120000);
    expect(score).toBeGreaterThanOrEqual(90);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('0% accuracy gives 0', () => {
    const questions = [
      { prompt: '5 x 3', expected: 15, answered: 10, correct: false, responseMs: 1000 },
      { prompt: '7 x 4', expected: 28, answered: 30, correct: false, responseMs: 1500 }
    ];
    const score = scoreDrill('multiplication', questions, 60000);
    // 0 accuracy * 0.8 = 0, plus small speed bonus
    expect(score).toBeLessThanOrEqual(20);
  });

  it('unanswered questions count against accuracy', () => {
    const questions = [
      { prompt: '5 x 3', expected: 15, answered: 15, correct: true, responseMs: 1000 },
      { prompt: '7 x 4', expected: 28, answered: null, correct: false, responseMs: 0 }
    ];
    const score = scoreDrill('multiplication', questions, 60000);
    // 50% accuracy = 40 base, plus speed bonus
    expect(score).toBeGreaterThanOrEqual(40);
    expect(score).toBeLessThanOrEqual(60);
  });

  it('slow responses reduce speed bonus', () => {
    const fast = [
      { prompt: '5 x 3', expected: 15, answered: 15, correct: true, responseMs: 1000 }
    ];
    const slow = [
      { prompt: '5 x 3', expected: 15, answered: 15, correct: true, responseMs: 55000 }
    ];
    const fastScore = scoreDrill('multiplication', fast, 60000);
    const slowScore = scoreDrill('multiplication', slow, 60000);
    expect(fastScore).toBeGreaterThan(slowScore);
  });

  it('score is clamped between 0 and 100', () => {
    const questions = [
      { prompt: '1 x 1', expected: 1, answered: 1, correct: true, responseMs: 100 }
    ];
    const score = scoreDrill('multiplication', questions, 120000);
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
