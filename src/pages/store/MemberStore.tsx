import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingBag } from 'lucide-react';
import { mockProducts } from '@/utils/mockData';
import { ProductCard } from '@/components/store/ProductCard';
import { ShoppingCartSheet } from '@/components/store/ShoppingCart';
import { CheckoutDialog } from '@/components/store/CheckoutDialog';
import { useCart } from '@/hooks/useCart';

export const MemberStore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCheckout, setShowCheckout] = useState(false);
  
  const { getTotalItems } = useCart();

  const categories = ['all', 'supplements', 'apparel', 'equipment', 'accessories', 'beverages', 'snacks'];
  
  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.isActive;
    });
  }, [searchTerm, selectedCategory]);

  const getCategoryStats = () => {
    const stats = categories.slice(1).map(category => {
      const count = mockProducts.filter(p => p.category === category && p.isActive).length;
      return { category, count };
    });
    return stats;
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary" />
            Member Store
          </h1>
          <p className="text-muted-foreground mt-2">
            Shop supplements, gear, and more for your fitness journey
          </p>
        </div>
        <ShoppingCartSheet onCheckout={() => setShowCheckout(true)} />
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {getCategoryStats().map(({ category, count }) => (
          <Card key={category} className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{count}</div>
              <div className="text-sm text-muted-foreground capitalize">{category}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Browse Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} products found
            </p>
            {getTotalItems() > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                {getTotalItems()} items in cart
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Checkout Dialog */}
      <CheckoutDialog 
        open={showCheckout} 
        onOpenChange={setShowCheckout}
      />
    </div>
  );
};