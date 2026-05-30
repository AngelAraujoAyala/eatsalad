import { useState, useEffect } from "react";
import { Plus, Edit2, RefreshCw, X, Image as ImageIcon } from "lucide-react";
import { ingredientsService } from "../../../api/ingredientsService";
import type { Ingredient } from "../../../types";

export default function IngredientsManager() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guarda el archivo binario de la imagen
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Estados del Formulario / Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    isExtra: false,
    isActive: true,
  });

  const fetchIngredients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ingredientsService.getAll();
      setIngredients(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron sincronizar los ingredientes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchIngredients();
    };
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingIngredient(null);
    setFormData({ name: "", price: 0, isExtra: false, isActive: true });
    setImageFile(null); // Limpiamos el archivo al abrir para uno nuevo
    setIsModalOpen(true);
  };

  const handleToggleActive = async (ing: Ingredient) => {
    try {
      const data = new FormData();
      // Mandamos los datos actuales pero invertimos el estado
      data.append("name", ing.name);
      data.append("price", ing.price.toString());
      data.append("isActive", (!ing.isActive).toString());

      // Al no enviar el campo "file", el backend conservará automáticamente la imageUrl actual
      await ingredientsService.update(ing.id, data);

      // Actualizamos el estado local de React de inmediato
      setIngredients((prevIngredients) =>
        prevIngredients.map((item) =>
          item.id === ing.id ? { ...item, isActive: !item.isActive } : item,
        ),
      );
    } catch (error) {
      console.error("Error al cambiar el estado del ingrediente:", error);
      alert("No se pudo cambiar el estado del ingrediente.");
    }
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setFormData({
      name: ing.name,
      price: Number(ing.price),
      isExtra: ing.isExtra,
      isActive: ing.isActive,
    });
    setImageFile(null); // Limpiamos por si había quedado rastro de otra selección
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price.toString());
      data.append("isExtra", formData.isExtra.toString());
      data.append("isActive", formData.isActive.toString());

      if (imageFile) {
        data.append("file", imageFile);
      }

      if (editingIngredient) {
        const updated = await ingredientsService.update(
          editingIngredient.id,
          data,
        );
        setIngredients(
          ingredients.map((i) => (i.id === editingIngredient.id ? updated : i)),
        );
      } else {
        const created = await ingredientsService.create(data);
        setIngredients([...ingredients, created]);
      }

      setIsModalOpen(false);
      setImageFile(null);
    } catch (err) {
      console.error(err);
      alert("Error en la operación al intentar guardar los cambios.");
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Topbar interno del Módulo */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Gestión de Ingredientes
        </h2>
        <button
          onClick={fetchIngredients}
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
            Controla las proteínas, toppings y aderezos disponibles conectados a
            tu base de datos Supabase.
          </p>
          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={3} /> Agregar Ingrediente
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <RefreshCw size={32} className="animate-spin text-brand-green" />
            <p className="text-sm font-medium">Consultando NestJS API...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Imagen</th>
                  <th className="py-4 px-6">Nombre</th>
                  <th className="py-4 px-6">Tipo</th>
                  <th className="py-4 px-6">Costo Extra</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {ingredients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-slate-400"
                    >
                      No hay ingredientes en la base de datos.
                    </td>
                  </tr>
                ) : (
                  ingredients.map((ing) => (
                    <tr
                      key={ing.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-4 px-6">
                        {ing.imageUrl ? (
                          <img
                            src={ing.imageUrl}
                            alt={ing.name}
                            className="w-10 h-10 object-cover rounded-xl border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-900 font-semibold">
                        {ing.name}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold ${ing.isExtra ? "bg-brand-orange/10 text-brand-orange" : "bg-brand-green/10 text-brand-green"}`}
                        >
                          {ing.isExtra ? "Extra con Costo" : "Regular de Barra"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">
                        {Number(ing.price) > 0
                          ? `+$${Number(ing.price).toFixed(2)}`
                          : "$0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          {/* Contenedor del Switch corregido de 'ingredient' a 'ing' */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(ing)}
                            className={`${
                              ing.isActive ? "bg-emerald-500" : "bg-gray-300"
                            } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                          >
                            <span className="sr-only">Cambiar estado</span>
                            {/* La bolita del Switch */}
                            <span
                              className={`${
                                ing.isActive ? "translate-x-5" : "translate-x-0"
                              } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                          </button>

                          {/* Texto de apoyo dinámico basado en 'ing' */}
                          <span
                            className={`text-xs font-medium ${ing.isActive ? "text-emerald-600" : "text-gray-400"}`}
                          >
                            {ing.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenEdit(ing)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL LOCAL AL MÓDULO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingIngredient ? "Editar Ingrediente" : "Nuevo Ingrediente"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setImageFile(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej. Arrachera"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">
                    ¿Es un Extra con costo?
                  </label>
                  <span className="text-xs text-slate-400">
                    Suma al precio base de la ensalada.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isExtra}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isExtra: e.target.checked,
                      price: e.target.checked ? formData.price : 0,
                    })
                  }
                  className="w-5 h-5 accent-brand-green rounded"
                />
              </div>

              {formData.isExtra && (
                <div className="animate-in slide-in-from-top-2 duration-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Precio Extra ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-mono font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Fotografía del Ingrediente
                </label>
                <div className="relative group border border-slate-200 bg-slate-50 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-100/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 group-hover:text-slate-900 shadow-xs">
                    <ImageIcon size={18} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 truncate max-w-60">
                    {imageFile
                      ? imageFile.name
                      : "Seleccionar archivo de imagen..."}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setImageFile(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
