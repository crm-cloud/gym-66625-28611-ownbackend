import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  onQuickAdd?: (product: Product) => void;
}

export const ProductCard = ({ product, showAddToCart = true, onQuickAdd }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (onQuickAdd) {
      onQuickAdd(product);
    } else {
      addItem(product, 1);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      supplements: 'bg-blue-500',
      apparel: 'bg-purple-500',
      equipment: 'bg-green-500',
      accessories: 'bg-orange-500',
      beverages: 'bg-cyan-500',
      snacks: 'bg-red-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
        />
        <Badge 
          className={`absolute top-2 left-2 text-white ${getCategoryColor(product.category)}`}
        >
          {product.category}
        </Badge>
        {product.stock <= 5 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Low Stock
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
      </CardContent>
      
      {showAddToCart && (
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full"
            size="sm"
          >
            {onQuickAdd ? (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Quick Add
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};