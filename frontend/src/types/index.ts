export interface Ingredient {
  id: string;
  name: string;
  price: number; // Prisma Decimal se recibe como número o string convertible
  isExtra: boolean;
  isActive: boolean;
  imageUrl?: string;
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
  maxProteins?: number | null;
  maxIngredients?: number | null;

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
  product?: Product; // Traído opcionalmente por las relaciones de la base de datos
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

export type CreateIngredientInput = Omit<Ingredient, 'id'>;
export type UpdateIngredientInput = Partial<CreateIngredientInput>;