import { useState, useCallback, useRef } from 'react';
import { pipeline } from '@huggingface/transformers';

interface SentimentResult {
  label: string;
  score: number;
}

export const useSentimentAnalyzer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pipelineRef = useRef<any>(null);

  const initializePipeline = async () => {
    if (pipelineRef.current) return pipelineRef.current;
    
    setIsLoading(true);
    try {
      // Use sentiment-analysis pipeline with a lightweight model
      const classifier = await pipeline(
        'sentiment-analysis',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      pipelineRef.current = classifier;
      return classifier;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeText = useCallback(async (text: string): Promise<SentimentResult> => {
    try {
      const classifier = await initializePipeline();
      const result = await classifier(text);
      
      if (Array.isArray(result) && result[0]) {
        return {
          label: result[0].label,
          score: result[0].score
        };
      }
      
      throw new Error('Invalid result from model');
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw error;
    }
  }, []);

  const analyzeBatch = useCallback(async (texts: string[]): Promise<SentimentResult[]> => {
    try {
      const classifier = await initializePipeline();
      const results = await Promise.all(texts.map(text => classifier(text)));
      
      return results.map(result => {
        if (Array.isArray(result) && result[0]) {
          return {
            label: result[0].label,
            score: result[0].score
          };
        }
        throw new Error('Invalid result from model');
      });
    } catch (error) {
      console.error('Batch sentiment analysis error:', error);
      throw error;
    }
  }, []);

  return {
    analyzeText,
    analyzeBatch,
    isLoading
  };
};
