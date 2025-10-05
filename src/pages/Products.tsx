import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, TrendingUp, Package, Plus, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

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

export default function Products() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [trackedProductIds, setTrackedProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [targetPrice, setTargetPrice] = useState<{ [key: string]: number }>({});
  const [notifyOnDrop, setNotifyOnDrop] = useState<{ [key: string]: boolean }>({});
  const [dialogOpen, setDialogOpen] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchTrackedProducts();
    }
  }, [user]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
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

  const fetchTrackedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('tracked_products')
        .select('product_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setTrackedProductIds(new Set(data?.map(tp => tp.product_id) || []));
    } catch (error: any) {
      console.error('Error fetching tracked products:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const trackProduct = async (productId: string) => {
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
          product_id: productId,
          target_price: targetPrice[productId] || 0,
          notify_on_drop: notifyOnDrop[productId] !== false,
        });

      if (error) throw error;

      setTrackedProductIds(prev => new Set([...prev, productId]));
      setDialogOpen(prev => ({ ...prev, [productId]: false }));
      toast({
        title: 'Success',
        description: 'Product added to your tracking list',
      });

      const product = products.find(p => p.id === productId);
      if (product) {
        await supabase.from('user_preferences').upsert({
          user_id: user.id,
          category: product.category,
          interest_score: 1,
        }, {
          onConflict: 'user_id,category'
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const untrackProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('tracked_products')
        .delete()
        .eq('user_id', user?.id)
        .eq('product_id', productId);

      if (error) throw error;

      setTrackedProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });

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

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Products</h1>
          <p className="text-muted-foreground">Track prices and get notified when they drop</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const isTracked = trackedProductIds.has(product.id);
              
              return (
                <Card key={product.id} className="overflow-hidden hover-scale">
                  <div className="aspect-square bg-muted relative">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                    {isTracked && (
                      <div className="absolute top-2 right-2 bg-primary text-white p-2 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          ${product.current_price}
                        </p>
                        <p className="text-xs text-muted-foreground">{product.currency}</p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    {!isTracked ? (
                      <Dialog open={dialogOpen[product.id]} onOpenChange={(open) => {
                        setDialogOpen(prev => ({ ...prev, [product.id]: open }));
                        if (open) {
                          setTargetPrice(prev => ({ ...prev, [product.id]: Math.round(product.current_price * 0.9 * 100) / 100 }));
                          setNotifyOnDrop(prev => ({ ...prev, [product.id]: true }));
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Track Product
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
                              <p className="text-2xl font-bold text-primary">${product.current_price}</p>
                            </div>
                            <div>
                              <Label htmlFor={`targetPrice-${product.id}`}>Target Price ($)</Label>
                              <Input
                                id={`targetPrice-${product.id}`}
                                type="number"
                                step="0.01"
                                value={targetPrice[product.id] || ''}
                                onChange={(e) => setTargetPrice(prev => ({ 
                                  ...prev, 
                                  [product.id]: parseFloat(e.target.value) 
                                }))}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`notify-${product.id}`}
                                checked={notifyOnDrop[product.id] !== false}
                                onChange={(e) => setNotifyOnDrop(prev => ({ 
                                  ...prev, 
                                  [product.id]: e.target.checked 
                                }))}
                                className="h-4 w-4"
                              />
                              <Label htmlFor={`notify-${product.id}`}>Notify me when price drops</Label>
                            </div>
                            <Button 
                              className="w-full" 
                              onClick={() => trackProduct(product.id)}
                            >
                              Start Tracking
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => untrackProduct(product.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Tracking
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}