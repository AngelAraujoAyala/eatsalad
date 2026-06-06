import api from "./axios";
import type { Ingredient } from "../types";

export const ingredientsService = {
  // GET /ingredients
  getAll: async (): Promise<Ingredient[]> => {
    const { data } = await api.get<Ingredient[]>("/ingredients");
    return data;
  },

  // POST /ingredients
  create: async (formData: FormData): Promise<Ingredient> => {
    const { data } = await api.post<Ingredient>("/ingredients", formData, {
      headers: {
        // Dejamos que el navegador configure el boundary para el multipart/form-data
        "Content-Type": undefined,
      },
    });
    return data;
  },

  // PUT /ingredients/:id
  update: async (id: string, formData: FormData): Promise<Ingredient> => {
    const { data } = await api.put<Ingredient>(`/ingredients/${id}`, formData, {
      headers: {
        // Al igual que en el create, usamos undefined para manejar el FormData con la imagen
        "Content-Type": undefined,
      },
    });
    return data;
  },
};
