/**
 * High-performance matrix and vector algorithms
 */
export function calculate2x2Determinant(m: number[][]): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

export function calculate3x3Determinant(m: number[][]): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

export function calculateVectorDotProduct(v1: number[], v2: number[]): number {
  return v1[0] * v2[0] + v1[1] * v2[1] + (v1[2] || 0) * (v2[2] || 0);
}

export function calculateVectorCrossProduct(v1: number[], v2: number[]): number[] {
  const [a1, a2, a3 = 0] = v1;
  const [b1, b2, b3 = 0] = v2;
  return [
    a2 * b3 - a3 * b2,
    a3 * b1 - a1 * b3,
    a1 * b2 - a2 * b1
  ];
}

export function calculateVectorMagnitude(v: number[]): number {
  const sumSq = v.reduce((acc, val) => acc + val * val, 0);
  return Math.sqrt(sumSq);
}

/**
 * Descriptive statistics engine
 */
export interface DatasetStatistics {
  count: number;
  sum: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  variance: number;
  stdev: number;
}

export function calculateDatasetStatistics(numbers: number[]): DatasetStatistics | null {
  if (!numbers || numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  let median = 0;
  if (count % 2 === 1) {
    median = sorted[Math.floor(count / 2)];
  } else {
    median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
  }

  const min = sorted[0];
  const max = sorted[count - 1];

  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (count > 1 ? count - 1 : 1);
  const stdev = Math.sqrt(variance);

  return {
    count,
    sum: Number(sum.toFixed(6)),
    mean: Number(mean.toFixed(6)),
    median: Number(median.toFixed(6)),
    min,
    max,
    variance: Number(variance.toFixed(6)),
    stdev: Number(stdev.toFixed(6)),
  };
}

/**
 * Combinatorics & Number Theory
 */
export function calculateFactorial(n: number): number {
  if (n < 0 || Math.floor(n) !== n) return NaN;
  if (n > 170) return Infinity;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

export function calculatePermutation(n: number, r: number): number {
  if (r < 0 || n < 0 || r > n) return 0;
  return calculateFactorial(n) / calculateFactorial(n - r);
}

export function calculateCombination(n: number, r: number): number {
  if (r < 0 || n < 0 || r > n) return 0;
  return calculateFactorial(n) / (calculateFactorial(r) * calculateFactorial(n - r));
}

export function calculateGCD(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function calculateLCM(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  if (!a || !b) return 0;
  return (a * b) / calculateGCD(a, b);
}

export function isPrimeNumber(n: number): boolean {
  n = Math.round(n);
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}
