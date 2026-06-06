import api from "./axios";
import type { Category } from "../types";

export const categoriesService = {
  // Obtener todas las categorías
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/categories");
    return response.data;
  },

  // Crear categoría
  create: async (name: string, imageFile: File | null): Promise<Category> => {
    const formData = new FormData();
    formData.append("name", name);

    if (imageFile) {
      formData.append("file", imageFile); // Usamos 'file' para hacer match con el backend
    }

    const response = await api.post<Category>("/categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // ACTUALIZACIÓN: Editar categoría existente
  update: async (
    id: string,
    name: string,
    imageFile: File | null,
  ): Promise<Category> => {
    const formData = new FormData();
    formData.append("name", name);

    if (imageFile) {
      formData.append("file", imageFile); // Si el usuario cambió la foto, la mandamos
    }

    // Usamos PATCH mandando el ID en la URL de tu API
    const response = await api.patch<Category>(`/categories/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Eliminar categoría
  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
