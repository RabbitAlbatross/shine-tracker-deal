import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Brain, TrendingUp, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Progress } from '@/components/ui/progress';
import { usePricePredictor } from '@/hooks/usePricePredictor';
import { useSentimentAnalyzer } from '@/hooks/useSentimentAnalyzer';

const ModelTraining = () => {
  const [priceTrainingProgress, setPriceTrainingProgress] = useState(0);
  const [sentimentProgress, setSentimentProgress] = useState(0);
  const [priceFile, setPriceFile] = useState<File | null>(null);
  const [sentimentFile, setSentimentFile] = useState<File | null>(null);

  const { trainModel: trainPriceModel, isTraining: isPriceTraining, predict } = usePricePredictor();
  const { analyzeText, isLoading: isSentimentLoading } = useSentimentAnalyzer();

  const handlePriceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
        toast.error('Please upload a CSV or JSON file');
        return;
      }
      setPriceFile(file);
      toast.success('File uploaded successfully');
    }
  };

  const handleSentimentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
        toast.error('Please upload a CSV or JSON file');
        return;
      }
      setSentimentFile(file);
      toast.success('File uploaded successfully');
    }
  };

  const trainPricePredictor = async () => {
    if (!priceFile) {
      toast.error('Please upload a training file first');
      return;
    }

    try {
      const text = await priceFile.text();
      let data;
      
      if (priceFile.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else {
        // Parse CSV
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        data = lines.slice(1).map(line => {
          const values = line.split(',');
          return headers.reduce((obj: any, header, index) => {
            obj[header.trim()] = values[index]?.trim();
            return obj;
          }, {});
        }).filter(row => row.price); // Filter out empty rows
      }

      await trainPriceModel(data, (progress) => {
        setPriceTrainingProgress(progress);
      });

      toast.success('Price prediction model trained successfully!');
    } catch (error) {
      console.error('Training error:', error);
      toast.error('Failed to train model. Please check your data format.');
    }
  };

  const testSentimentAnalysis = async () => {
    const testText = "This product is amazing! Great quality and fast delivery.";
    try {
      const result = await analyzeText(testText);
      toast.success(`Sentiment: ${result.label} (${(result.score * 100).toFixed(1)}% confidence)`);
    } catch (error) {
      toast.error('Failed to analyze sentiment');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">ML Model Training</h1>
          <p className="text-muted-foreground">Train custom models on your scraped data</p>
        </div>

        <Tabs defaultValue="price" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="price" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Price Prediction
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Sentiment Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Price Prediction Model
                </CardTitle>
                <CardDescription>
                  Train a LSTM neural network on historical price data to predict future prices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Data Format Requirements:</h3>
                    <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                      <p className="font-mono">CSV format: price,date,product_id (optional)</p>
                      <p className="font-mono">JSON format: {'[{price: 100, date: "2024-01-01", product_id: "1"}, ...]'}</p>
                      <p className="text-muted-foreground mt-2">The model will learn patterns from your historical price data</p>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="price-file"
                      className="hidden"
                      accept=".csv,.json"
                      onChange={handlePriceFileUpload}
                    />
                    <label htmlFor="price-file" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {priceFile ? priceFile.name : 'Click to upload training data'}
                      </p>
                      <p className="text-xs text-muted-foreground">CSV or JSON file</p>
                    </label>
                  </div>

                  {isPriceTraining && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Training Progress</span>
                        <span>{priceTrainingProgress}%</span>
                      </div>
                      <Progress value={priceTrainingProgress} />
                    </div>
                  )}

                  <Button 
                    onClick={trainPricePredictor} 
                    disabled={!priceFile || isPriceTraining}
                    className="w-full"
                  >
                    {isPriceTraining ? 'Training...' : 'Train Model'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Sentiment Analysis Model
                </CardTitle>
                <CardDescription>
                  Uses a pre-trained transformer model for sentiment analysis (runs in browser)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                    <p className="font-semibold">Model: distilbert-base-uncased-finetuned-sst-2-english</p>
                    <p className="text-muted-foreground">
                      This model is pre-trained and ready to use. It analyzes text sentiment (positive/negative) 
                      with high accuracy. The model runs entirely in your browser using WebAssembly.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Capabilities:</h3>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                      <li>Real-time sentiment analysis of product reviews</li>
                      <li>Analyze product descriptions and customer feedback</li>
                      <li>Batch processing of scraped text data</li>
                      <li>No API keys required - runs locally</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={testSentimentAnalysis} 
                    disabled={isSentimentLoading}
                    className="w-full"
                  >
                    {isSentimentLoading ? 'Loading Model...' : 'Test Sentiment Analysis'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModelTraining;
