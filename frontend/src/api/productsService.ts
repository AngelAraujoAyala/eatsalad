import api from "./axios";
import type { Product } from "../types";

export const productsService = {
  // GET /products
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>("/products");
    return data;
  },

  // POST /products
  create: async (formData: FormData): Promise<Product> => {
    // Axios detecta automáticamente el FormData y delega el Content-Type al navegador
    const { data } = await api.post<Product>("/products", formData);
    return data;
  },

  // PATCH /products/:id
  update: async (id: string, formData: FormData): Promise<Product> => {
    // Eliminamos los headers explícitos para limpiar el código
    const { data } = await api.patch<Product>(`/products/${id}`, formData);
    return data;
  },

  // PATCH /products/:id/ingredients
  updateIngredients: async (
    id: string,
    dto: { ingredientIds: string[] },
  ): Promise<Product> => {
    const { data } = await api.patch<Product>(
      `/products/${id}/ingredients`,
      dto,
    );
    return data;
  },
};
