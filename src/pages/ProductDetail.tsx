import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, TrendingDown, TrendingUp, Plus, Check, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  current_price: number;
  image_url: string;
  source_url: string;
  currency: string;
}

interface PriceHistory {
  price: number;
  recorded_at: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isTracked, setIsTracked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [targetPrice, setTargetPrice] = useState(0);
  const [notifyOnDrop, setNotifyOnDrop] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id, user]);

  const fetchProductDetails = async () => {
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // Fetch price history
      const { data: historyData, error: historyError } = await supabase
        .from('price_history')
        .select('price, recorded_at')
        .eq('product_id', id)
        .order('recorded_at', { ascending: true });

      if (!historyError && historyData) {
        setPriceHistory(historyData);
      }

      // Fetch similar products (same category, exclude current)
      const { data: similarData, error: similarError } = await supabase
        .from('products')
        .select('*')
        .eq('category', productData.category)
        .neq('id', id)
        .limit(4);

      if (!similarError && similarData) {
        setSimilarProducts(similarData);
      }

      // Check if tracked
      if (user) {
        const { data: trackedData } = await supabase
          .from('tracked_products')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', id)
          .single();

        setIsTracked(!!trackedData);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const trackProduct = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to track products',
      });
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase
        .from('tracked_products')
        .insert({
          user_id: user.id,
          product_id: id,
          target_price: targetPrice || 0,
          notify_on_drop: notifyOnDrop,
        });

      if (error) throw error;

      setIsTracked(true);
      setDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Product added to your tracking list',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const untrackProduct = async () => {
    try {
      const { error } = await supabase
        .from('tracked_products')
        .delete()
        .eq('user_id', user?.id)
        .eq('product_id', id);

      if (error) throw error;

      setIsTracked(false);
      toast({
        title: 'Success',
        description: 'Product removed from tracking',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const calculatePriceChange = () => {
    if (priceHistory.length < 2) return null;
    const oldPrice = priceHistory[0].price;
    const currentPrice = product?.current_price || 0;
    const change = ((currentPrice - oldPrice) / oldPrice) * 100;
    return change;
  };

  const priceChange = calculatePriceChange();
  const chartData = priceHistory.map(item => ({
    date: new Date(item.recorded_at).toLocaleDateString(),
    price: item.price,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Product not found</p>
          <Button onClick={() => navigate('/products')} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image and Basic Info */}
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-6">
              <img
                src={product.image_url}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-4">
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-lg text-muted-foreground mb-6">
              {product.description}
            </p>

            <div className="flex items-baseline gap-4 mb-6">
              <div className="text-5xl font-bold text-primary">
                ₹{product.current_price.toLocaleString('en-IN')}
              </div>
              {priceChange !== null && (
                <div className={`flex items-center gap-1 text-sm ${priceChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange < 0 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  <span>{Math.abs(priceChange).toFixed(1)}% since 30 days ago</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 mb-6">
              {!isTracked ? (
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (open) {
                    setTargetPrice(Math.round(product.current_price * 0.9));
                    setNotifyOnDrop(true);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="flex-1">
                      <Plus className="h-5 w-5 mr-2" />
                      Track This Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Track {product.name}</DialogTitle>
                      <DialogDescription>
                        Set your target price and get notified when the price drops
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Current Price</Label>
                        <p className="text-2xl font-bold text-primary">₹{product.current_price.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <Label htmlFor="targetPrice">Target Price (₹)</Label>
                        <Input
                          id="targetPrice"
                          type="number"
                          step="0.01"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="notify"
                          checked={notifyOnDrop}
                          onChange={(e) => setNotifyOnDrop(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="notify">Notify me when price drops</Label>
                      </div>
                      <Button className="w-full" onClick={trackProduct}>
                        Start Tracking
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={untrackProduct}
                >
                  <Check className="h-5 w-5 mr-2" />
                  Tracking
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open(product.source_url, '_blank')}
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                View on Store
              </Button>
            </div>
          </div>
        </div>

        {/* Price History Chart */}
        {chartData.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Price History (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Similar Products in {product.category}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((similarProduct) => (
                <Card
                  key={similarProduct.id}
                  className="overflow-hidden hover-scale cursor-pointer"
                  onClick={() => navigate(`/products/${similarProduct.id}`)}
                >
                  <div className="aspect-square bg-muted">
                    <img
                      src={similarProduct.image_url}
                      alt={similarProduct.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{similarProduct.name}</h3>
                    <p className="text-2xl font-bold text-primary">
                      ₹{similarProduct.current_price.toLocaleString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
