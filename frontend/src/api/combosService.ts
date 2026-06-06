import api from "./axios";
import type { Combo } from "../types";

export const combosService = {
  // GET /combos
  getAll: async (): Promise<Combo[]> => {
    const { data } = await api.get<Combo[]>("/combos");
    return data;
  },

  // POST /combos
  create: async (formData: FormData): Promise<Combo> => {
    const { data } = await api.post<Combo>("/combos", formData, {
      headers: {
        "Content-Type": undefined, // El navegador se encarga del boundary multipart
      },
    });
    return data;
  },

  // PUT /combos/:id (Sincronizado con el @Put de tu controlador en NestJS)
  update: async (id: string, formData: FormData): Promise<Combo> => {
    const { data } = await api.put<Combo>(`/combos/${id}`, formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
    return data;
  },
};
