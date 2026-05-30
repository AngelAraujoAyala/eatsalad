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
    const { data } = await api.post<Product>("/products", formData, {
      headers: {
        // Dejamos que el navegador configure el boundary para el multipart/form-data con la imagen
        "Content-Type": undefined,
      },
    });
    return data;
  },

  // PATCH /products/:id
  // Dejado listo en formato PATCH para cuando agregues la ruta general en tu controlador de NestJS
  update: async (id: string, formData: FormData): Promise<Product> => {
    const { data } = await api.patch<Product>(`/products/${id}`, formData, {
      headers: {
        // Al igual que en el create, usamos undefined para manejar de forma segura el archivo adjunto
        "Content-Type": undefined,
      },
    });
    return data;
  },

  // PATCH /products/:id/ingredients
  // Consume directamente tu endpoint relacional enviando un JSON convencional (sin FormData)
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
