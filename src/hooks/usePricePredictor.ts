import { useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

interface TrainingData {
  price: number;
  date?: string;
  [key: string]: any;
}

export const usePricePredictor = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [normalizer, setNormalizer] = useState<{ min: number; max: number } | null>(null);

  const normalizeData = (data: number[], min?: number, max?: number) => {
    const dataMin = min ?? Math.min(...data);
    const dataMax = max ?? Math.max(...data);
    const normalized = data.map(val => (val - dataMin) / (dataMax - dataMin));
    return { normalized, min: dataMin, max: dataMax };
  };

  const denormalize = (normalizedValue: number, min: number, max: number) => {
    return normalizedValue * (max - min) + min;
  };

  const createSequences = (data: number[], lookback: number = 7) => {
    const xs: number[][] = [];
    const ys: number[] = [];
    
    for (let i = lookback; i < data.length; i++) {
      xs.push(data.slice(i - lookback, i));
      ys.push(data[i]);
    }
    
    return { xs, ys };
  };

  const trainModel = useCallback(async (
    data: TrainingData[], 
    onProgress?: (progress: number) => void
  ) => {
    setIsTraining(true);
    try {
      // Extract prices from data
      const prices = data.map(d => parseFloat(String(d.price))).filter(p => !isNaN(p));
      
      if (prices.length < 10) {
        throw new Error('Need at least 10 data points for training');
      }

      // Normalize data
      const { normalized, min, max } = normalizeData(prices);
      setNormalizer({ min, max });

      // Create sequences
      const lookback = Math.min(7, Math.floor(prices.length / 3));
      const { xs, ys } = createSequences(normalized, lookback);

      // Create tensors
      const xTensor = tf.tensor3d(xs.map(seq => seq.map(val => [val])));
      const yTensor = tf.tensor2d(ys, [ys.length, 1]);

      // Build LSTM model
      const newModel = tf.sequential({
        layers: [
          tf.layers.lstm({
            units: 50,
            returnSequences: true,
            inputShape: [lookback, 1]
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.lstm({
            units: 50,
            returnSequences: false
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 25, activation: 'relu' }),
          tf.layers.dense({ units: 1 })
        ]
      });

      newModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      // Train the model
      await newModel.fit(xTensor, yTensor, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const progress = ((epoch + 1) / 50) * 100;
            onProgress?.(Math.round(progress));
          }
        }
      });

      setModel(newModel);
      
      // Cleanup tensors
      xTensor.dispose();
      yTensor.dispose();

      return newModel;
    } finally {
      setIsTraining(false);
    }
  }, []);

  const predict = useCallback(async (historicalPrices: number[], daysAhead: number = 7) => {
    if (!model || !normalizer) {
      throw new Error('Model not trained yet');
    }

    const lookback = 7;
    if (historicalPrices.length < lookback) {
      throw new Error(`Need at least ${lookback} historical prices`);
    }

    const predictions: number[] = [];
    let currentSequence = [...historicalPrices.slice(-lookback)];

    // Normalize the sequence
    const { normalized } = normalizeData(currentSequence, normalizer.min, normalizer.max);

    for (let i = 0; i < daysAhead; i++) {
      // Prepare input tensor
      const inputTensor = tf.tensor3d([normalized.slice(-lookback).map(val => [val])]);
      
      // Make prediction
      const predictionTensor = model.predict(inputTensor) as tf.Tensor;
      const normalizedPrediction = (await predictionTensor.data())[0];
      
      // Denormalize prediction
      const prediction = denormalize(normalizedPrediction, normalizer.min, normalizer.max);
      predictions.push(prediction);
      
      // Update sequence for next prediction
      normalized.push(normalizedPrediction);
      
      // Cleanup
      inputTensor.dispose();
      predictionTensor.dispose();
    }

    return predictions;
  }, [model, normalizer]);

  return {
    trainModel,
    predict,
    isTraining,
    modelReady: !!model
  };
};
