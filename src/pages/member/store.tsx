import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Coins, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  member_price?: number;
  category: string;
  image_url?: string;
  stock_quantity: number;
}

interface MemberCredits {
  id: string;
  user_id: string;
  balance: number;
}

const MemberStore = () => {
  const { authState } = useAuth();
  
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['store-products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: credits } = useQuery({
    queryKey: ['member-credits', authState.user?.id],
    queryFn: async (): Promise<MemberCredits | null> => {
      if (!authState.user?.id) return null;
      
      const { data, error } = await supabase
        .from('member_credits')
        .select('*')
        .eq('user_id', authState.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!authState.user?.id
  });

  const handleAddToCart = async (product: Product) => {
    if (!authState.user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    // For now, just show a success message
    // In a real app, this would add to a shopping cart
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (productsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading store products...</div>
      </div>
    );
  }

  const productsByCategory = products?.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>) || {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Member Store</h1>
          <p className="text-muted-foreground">Get your supplements, gear, and more!</p>
        </div>
        {credits && (
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-primary" />
            <span className="font-semibold">Credits: ${credits.balance.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Member Benefits Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Member Exclusive Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Enjoy special member prices on all products. Save even more with your membership!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Categories */}
      {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-2xl font-semibold capitalize text-foreground">{category}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-3">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="text-4xl text-muted-foreground">📦</div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {product.member_price && product.member_price < product.price ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">
                              ${product.member_price.toFixed(2)}
                            </span>
                            <Badge variant="secondary">Member Price</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground line-through">
                            Regular: ${product.price.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-foreground">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Stock: {product.stock_quantity}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock_quantity === 0}
                    className="w-full"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {products?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            No products available at the moment. Check back soon!
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberStore;