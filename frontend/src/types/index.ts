export interface Ingredient {
  id: string;
  name: string;
  price: number; // Prisma Decimal se recibe como número o string convertible
  isExtra: boolean;
  isActive: boolean;
  imageUrl?: string;
}

export type CreateIngredientInput = Omit<Ingredient, 'id'>;
export type UpdateIngredientInput = Partial<CreateIngredientInput>;