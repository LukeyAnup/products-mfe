export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category?: string;
  images: string[];
  rating?: number;
  stock?: number;
  discountPercentage?: number;
  minimumOrderQuantity?: number;
  returnPolicy?: string;
  warrentyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
}
