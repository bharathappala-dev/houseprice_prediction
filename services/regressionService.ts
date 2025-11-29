import { DataPoint, ModelMetrics, ProcessedData } from '../types';
import { transpose, multiply, inverse, multiplyVector } from '../utils/math';

export class RegressionService {
  private data: DataPoint[] = [];
  
  constructor(data: DataPoint[]) {
    this.data = data;
  }

  // Detects if a column is numeric
  private isNumeric(val: any): boolean {
    return !isNaN(parseFloat(val)) && isFinite(val);
  }

  public preprocess(targetCol: string, featureCols: string[]): ProcessedData {
    // 1. Filter rows with valid target
    const validRows = this.data.filter(row => 
      row[targetCol] !== undefined && 
      row[targetCol] !== null && 
      row[targetCol] !== ''
    );

    const featureNamesAfterEncoding: string[] = [];
    const encoders: Record<string, (val: string) => number[]> = {};

    // 2. Build encoders for categorical features
    featureCols.forEach(col => {
      // Check first non-null value to determine type
      const sample = validRows.find(r => r[col] !== undefined && r[col] !== '')?.[col];
      
      if (this.isNumeric(sample)) {
        // Numeric: Identity encoder (but handled as number)
        featureNamesAfterEncoding.push(col);
      } else {
        // Categorical: One-Hot Encoding
        const uniqueValues = Array.from(new Set(validRows.map(r => String(r[col] || 'Unknown'))));
        uniqueValues.sort();
        
        // Remove one category to avoid dummy variable trap (optional, but good practice. 
        // Here we keep all for simplicity of interpretation, or drop first)
        // Let's drop the first one to be safe for linear regression (prevent perfect multicollinearity)
        const categoriesToKeep = uniqueValues.length > 1 ? uniqueValues.slice(1) : uniqueValues;
        
        categoriesToKeep.forEach(val => {
          featureNamesAfterEncoding.push(`${col}_${val}`);
        });

        encoders[col] = (val: string) => {
          const strVal = String(val || 'Unknown');
          return categoriesToKeep.map(cat => (cat === strVal ? 1 : 0));
        };
      }
    });

    // 3. Transform data
    const X: number[][] = [];
    const y: number[] = [];

    validRows.forEach(row => {
      const rowVector: number[] = [];
      
      featureCols.forEach(col => {
        const val = row[col];
        if (encoders[col]) {
          // Categorical
          rowVector.push(...encoders[col](String(val)));
        } else {
          // Numeric
          rowVector.push(this.isNumeric(val) ? parseFloat(String(val)) : 0); // 0 imputation for now
        }
      });
      
      X.push(rowVector);
      y.push(parseFloat(String(row[targetCol])));
    });

    return {
      features: featureCols,
      target: targetCol,
      data: X,
      labels: y,
      encoders,
      featureNamesAfterEncoding
    };
  }

  public train(processed: ProcessedData): ModelMetrics {
    const N = processed.data.length;
    // Add bias term (column of 1s at the start)
    const X_bias = processed.data.map(row => [1, ...row]);
    const y = processed.labels;

    // Normal Equation: theta = (X^T * X)^-1 * X^T * y
    // Note: If matrix is singular, this throws. Real-world apps should use SVD or Pseudo-Inverse.
    // We wrapped inverse in a try-catch in the UI or handle singular matrix error.
    
    try {
      const X_T = transpose(X_bias);
      const X_T_X = multiply(X_T, X_bias);
      const X_T_X_Inv = inverse(X_T_X);
      const X_T_y = multiplyVector(X_T, y);
      const theta = multiplyVector(X_T_X_Inv, X_T_y);

      const intercept = theta[0];
      const coefficients = theta.slice(1);

      // Predictions on training set
      const y_pred = X_bias.map(row => {
        return row.reduce((sum, val, idx) => sum + val * theta[idx], 0);
      });

      // Metrics
      const y_mean = y.reduce((a, b) => a + b, 0) / N;
      const ss_tot = y.reduce((acc, curr) => acc + Math.pow(curr - y_mean, 2), 0);
      const ss_res = y.reduce((acc, curr, idx) => acc + Math.pow(curr - y_pred[idx], 2), 0);
      
      const r2 = 1 - (ss_res / ss_tot);
      const mse = ss_res / N;
      const rmse = Math.sqrt(mse);

      return {
        mse,
        r2,
        rmse,
        coefficients,
        intercept
      };

    } catch (e) {
      console.error("Training error:", e);
      throw new Error("Could not train model. The dataset might be singular (perfect multicollinearity) or too small.");
    }
  }

  public predict(
    inputs: Record<string, string | number>, 
    processed: ProcessedData, 
    model: ModelMetrics
  ): number {
    let inputVector: number[] = [];
    
    processed.features.forEach(col => {
      const val = inputs[col];
      if (processed.encoders[col]) {
        inputVector.push(...processed.encoders[col](String(val)));
      } else {
        inputVector.push(Number(val) || 0);
      }
    });

    // Dot product with coefficients + intercept
    const prediction = inputVector.reduce((sum, val, idx) => sum + val * model.coefficients[idx], 0) + model.intercept;
    return prediction;
  }
}