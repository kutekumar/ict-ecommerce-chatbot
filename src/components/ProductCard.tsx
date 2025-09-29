import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  detailLink: string;
  description?: string;
}

const ProductCard = ({ image, name, price, detailLink, description }: ProductCardProps) => {
  return (
    <div className="product-card rounded-2xl p-4 mb-3 card-shadow hover:floating-shadow transition-all duration-300 max-w-sm">
      <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-muted">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&crop=center";
          }}
        />
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground leading-tight">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">{price}</div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(detailLink, '_blank')}
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;