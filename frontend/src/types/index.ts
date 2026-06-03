export interface Ingredient {
  id: string;
  name: string;
  price: number;
  isExtra: boolean;
  isActive: boolean;
  imageUrl?: string;
  category: "PROTEINA" | "BARRA" | "COMPLEMENTO" | "ADEREZO";
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
  maxAderezos: number;
  maxBarra: number;
  maxComplements: number;

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

export type CreateIngredientInput = Omit<Ingredient, "id">;
export type UpdateIngredientInput = Partial<CreateIngredientInput>;
