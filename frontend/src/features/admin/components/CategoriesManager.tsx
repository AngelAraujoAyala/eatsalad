import React, { useEffect, useState } from "react";
import { type Category } from "../../../types";
import { categoriesService } from "../../../api/categoriesService";
// 🌟 Cambiamos los iconos necesarios para unificar con IngredientsManager
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  RefreshCw,
  X,
} from "lucide-react";

const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estados del Modal
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados de los Campos
  const [name, setName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const cargarCategorias = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setName("");
    setImageFile(null);
    setImagePreview(null);
    setIsOpen(true);
  };

  const openEditModal = (category: Category) => {
    setIsEditing(true);
    setEditingId(category.id);
    setName(category.name);
    setImageFile(null);
    setImagePreview(category.imageUrl || null);
    setIsOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (isEditing && editingId) {
        await categoriesService.update(editingId, name, imageFile);
      } else {
        await categoriesService.create(name, imageFile);
      }
      setIsOpen(false);
      cargarCategorias();
    } catch (error) {
      console.error("Error al procesar la categoría:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta categoría?")) {
      try {
        await categoriesService.delete(id);
        cargarCategorias();
      } catch (error) {
        console.error("Error al eliminar la categoría:", error);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Topbar interno del Módulo */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Gestión de Categorías
        </h2>
        <button
          onClick={cargarCategorias}
          disabled={isLoading}
          className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </header>

      {/* Contenido Scrolleable */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">
            Controla las familias de platillos disponibles en tu menú conectadas
            a tu base de datos Supabase.
          </p>
          <button
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={3} /> Agregar Categoría
          </button>
        </div>

        {/* 🌟 AQUÍ ESTÁ: Spinner idéntico al de tu IngredientsManager */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <RefreshCw size={32} className="animate-spin text-brand-green" />
            <p className="text-sm font-medium">Consultando NestJS API...</p>
          </div>
        )}

        {!isLoading && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {categories.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm font-medium">
                No hay categorías registradas.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Imagen</th>
                    <th className="py-4 px-6">Nombre</th>
                    <th className="py-4 px-6">Productos</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-4 px-6">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-10 h-10 object-cover rounded-xl border border-slate-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/100x100?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-900 font-semibold">
                        {category.name}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">
                          {category.products?.length || 0} Productos
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal Reutilizable (Crear / Editar) */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {isEditing ? "Editar Categoría" : "Nueva Categoría"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Fotografía de categoría
                </label>
                <div className="relative group border border-slate-200 bg-slate-50 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-100/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200"
                    />
                  ) : (
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 group-hover:text-slate-900 shadow-xs">
                      <ImageIcon size={18} />
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-500 truncate max-w-60">
                    {imageFile
                      ? imageFile.name
                      : "Seleccionar foto de categoría..."}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Ensaladas, Bebidas, Paninis"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {isEditing ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;
