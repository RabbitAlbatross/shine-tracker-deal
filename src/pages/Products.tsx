import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { Bell, BellOff, Search, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

interface TrackedProduct {
  id: string;
  product_id: string;
}

export default function Products() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [trackedProducts, setTrackedProducts] = useState<TrackedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchTrackedProducts();
    }
  }, [user]);

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
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tracked_products')
        .select('id, product_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setTrackedProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching tracked products:', error);
    }
  };

  const isTracked = (productId: string) => {
    return trackedProducts.some(tp => tp.product_id === productId);
  };

  const handleTrackProduct = async (product: Product) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to track products',
      });
      navigate('/auth');
      return;
    }

    try {
      if (isTracked(product.id)) {
        // Untrack
        const tracked = trackedProducts.find(tp => tp.product_id === product.id);
        if (tracked) {
          const { error } = await supabase
            .from('tracked_products')
            .delete()
            .eq('id', tracked.id);

          if (error) throw error;
          
          setTrackedProducts(prev => prev.filter(tp => tp.id !== tracked.id));
          toast({
            title: 'Product Untracked',
            description: `Stopped tracking ${product.name}`,
          });
        }
      } else {
        // Track
        const { data, error } = await supabase
          .from('tracked_products')
          .insert({
            user_id: user.id,
            product_id: product.id,
            target_price: product.current_price * 0.9, // 10% discount as default target
            notify_on_drop: true,
          })
          .select()
          .single();

        if (error) throw error;
        
        setTrackedProducts(prev => [...prev, data]);
        toast({
          title: 'Product Tracked',
          description: `Now tracking ${product.name}`,
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
          <p className="text-muted-foreground">Track prices and get notified about deals</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover-scale">
              <div className="aspect-square bg-muted relative">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">
                    ${product.current_price}
                  </span>
                  <span className="text-sm text-muted-foreground">{product.currency}</span>
                </div>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleTrackProduct(product)}
                  variant={isTracked(product.id) ? 'secondary' : 'default'}
                  className="w-full"
                >
                  {isTracked(product.id) ? (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Untrack
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Track Price
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
