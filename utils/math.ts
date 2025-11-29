/**
 * Basic Matrix Operations for Ordinary Least Squares
 * Implements (X^T * X)^-1 * X^T * y
 */

export const transpose = (matrix: number[][]): number[][] => {
  if (matrix.length === 0) return [];
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[][] = Array(cols).fill(0).map(() => Array(rows).fill(0));
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }
  return result;
};

export const multiply = (A: number[][], B: number[][]): number[][] => {
  if (A.length === 0 || B.length === 0) return [];
  const r1 = A.length;
  const c1 = A[0].length;
  const r2 = B.length;
  const c2 = B[0].length;

  if (c1 !== r2) throw new Error(`Matrix multiplication dimension mismatch: ${c1} vs ${r2}`);

  const result: number[][] = Array(r1).fill(0).map(() => Array(c2).fill(0));

  for (let i = 0; i < r1; i++) {
    for (let j = 0; j < c2; j++) {
      let sum = 0;
      for (let k = 0; k < c1; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
};

// Gaussian elimination for matrix inversion
export const inverse = (matrix: number[][]): number[][] => {
  const n = matrix.length;
  if (n !== matrix[0].length) throw new Error("Matrix must be square");

  // Augment matrix with identity
  const M: number[][] = matrix.map((row, i) => [
    ...row,
    ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
  ]);

  for (let i = 0; i < n; i++) {
    // Pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
    }

    [M[i], M[maxRow]] = [M[maxRow], M[i]];

    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-10) throw new Error("Matrix is singular");

    for (let j = i; j < 2 * n; j++) {
      M[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        for (let j = i; j < 2 * n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
  }

  return M.map(row => row.slice(n));
};

export const multiplyVector = (A: number[][], v: number[]): number[] => {
  // Treats v as a column vector
  const vMatrix = v.map(val => [val]);
  const resMatrix = multiply(A, vMatrix);
  return resMatrix.map(row => row[0]);
};