
export type IngredientCategory =
  | "PROTEINA"
  | "BARRA"
  | "COMPLEMENTO"
  | "ADEREZO"
  | "TORTILLA"
  | "PAN";

export type ServiceType = "COMEDOR" | "RECOGER";
export type OrderStatus = "PENDIENTE" | "FINALIZADO" | "CANCELADO";

export interface Ingredient {
  id: string;
  name: string;
  price: number;
  isExtra: boolean;
  isActive: boolean;
  imageUrl?: string;
  category: IngredientCategory;
}

export interface ProductRule {
  id: string;
  productId: string;
  category: IngredientCategory;
  minQuantity: number;
  maxQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  categoryId: string;
  category?: Category;

  isCustomizable: boolean;

  rules?: ProductRule[];

  availableIngredients?: ProductIngredient[];
}

export interface ProductIngredient {
  productId: string;
  ingredientId: string;
  ingredient?: Ingredient;
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string | null;
  products?: Product[];
}

export interface ComboItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Combo {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  items: ComboItem[];
}

export type CreateIngredientInput = Omit<Ingredient, "id">;
export type UpdateIngredientInput = Partial<CreateIngredientInput>;

export interface OrderItemDto {
  productId: string;
  quantity: number;
  configuration: Record<string, string[]>;
}

export interface CreateOrderDto {
  customerName: string;
  serviceType: ServiceType;
  pickupTime?: string;
  items: OrderItemDto[];
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface Order {
  id: string;
  customerName: string;
  serviceType: ServiceType;
  pickupTime: string | null;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items?: string[];
}
