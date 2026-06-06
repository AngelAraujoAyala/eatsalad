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
    // 🚀 CORRECCIÓN: Forzamos el Content-Type correcto para evitar que se envíe como JSON
    const { data } = await api.post<Product>("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  // PATCH /products/:id
  update: async (id: string, formData: FormData): Promise<Product> => {
    // 🚀 CORRECCIÓN: Forzamos el Content-Type correcto aquí también
    const { data } = await api.patch<Product>(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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
