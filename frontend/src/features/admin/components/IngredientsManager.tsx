import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  RefreshCw,
  X,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import { ingredientsService } from "../../../api/ingredientsService";
import type { Ingredient } from "../../../types";

// Diccionario para mostrar nombres limpios en la interfaz
const CATEGORY_LABELS: Record<string, string> = {
  PROTEINA: "Proteína",
  BARRA: "Barra",
  COMPLEMENTO: "Complemento",
  ADEREZO: "Aderezo",
};

export default function IngredientsManager() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 🔥 NUEVO: Para previsualizar imágenes localmente o desde URL

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    isExtra: false,
    isActive: true,
    category: "BARRA",
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
    fetchIngredients();
  }, []);

  const handleOpenAdd = () => {
    setEditingIngredient(null);
    setFormData({
      name: "",
      price: 0,
      isExtra: false,
      isActive: true,
      category: "BARRA",
    });
    setImageFile(null);
    setPreviewUrl(null); // Limpiar preview
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIngredient(null);
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleToggleActive = async (ing: Ingredient) => {
    try {
      const data = new FormData();
      data.append("name", ing.name);
      data.append("price", ing.price.toString());
      data.append("isActive", (!ing.isActive).toString());
      if (ing.category) data.append("category", ing.category);

      await ingredientsService.update(ing.id, data);

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
      category: ing.category || "BARRA",
    });
    setImageFile(null);
    setPreviewUrl(ing.imageUrl || null); // 🔥 Setea la imagen actual de Supabase como preview inicial
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // 🔥 Genera URL temporal para la nueva imagen elegida
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      // Forzamos el precio a 0 si el switch/checkbox de "isExtra" no está marcado
      const finalPrice = formData.isExtra ? formData.price : 0;
      data.append("price", finalPrice.toString());
      data.append("isActive", formData.isActive.toString());
      data.append("category", formData.category);

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

      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Error en la operación al intentar guardar los cambios.");
    }
  };

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
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

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Controla las proteínas, toppings y aderezos disponibles conectados a
            tu base de datos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-xs md:max-w-sm">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar ingrediente por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-900 font-medium bg-white transition-all shadow-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={handleOpenAdd}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={3} /> Agregar Ingrediente
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <RefreshCw size={32} className="animate-spin text-emerald-600" />
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
                  <th className="py-4 px-6">Categoría</th>
                  <th className="py-4 px-6">Tipo de Costo</th>
                  <th className="py-4 px-6">Costo Extra</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {ingredients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-slate-400"
                    >
                      No hay ingredientes en la base de datos.
                    </td>
                  </tr>
                ) : filteredIngredients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-slate-400 italic"
                    >
                      No se encontraron ingredientes que coincidan con "
                      {searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredIngredients.map((ing) => (
                    <tr
                      key={ing.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-4 px-6">
                        {ing.imageUrl ? (
                          <img
                            src={ing.imageUrl}
                            alt={ing.name}
                            className="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-xs"
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
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {CATEGORY_LABELS[ing.category] || ing.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold ${ing.price > 0 ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
                        >
                          {ing.price > 0
                            ? "Extra con Costo"
                            : "Regular de Barra"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">
                        {Number(ing.price) > 0
                          ? `+$${Number(ing.price).toFixed(2)}`
                          : "$0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(ing)}
                            className={`${ing.isActive ? "bg-emerald-500" : "bg-gray-300"} relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                          >
                            <span
                              className={`${ing.isActive ? "translate-x-5" : "translate-x-0"} pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                          </button>
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

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingIngredient ? "Editar Ingrediente" : "Nuevo Ingrediente"}
              </h3>
              <button
                onClick={handleCloseModal}
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

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Categoría de Ensalada
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-medium appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    backgroundSize: "16px",
                  }}
                >
                  <option value="BARRA">
                    Barra
                  </option>
                  <option value="PROTEINA">Proteína</option>
                  <option value="COMPLEMENTO">
                    Complemento (Frituras / Crutones)
                  </option>
                  <option value="ADEREZO">Aderezo</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">
                    ¿Es un Extra con costo?
                  </label>
                  <span className="text-xs text-slate-400">
                    Sumará al precio final de la orden.
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
                  className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
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
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 group-hover:text-slate-900 shadow-xs shrink-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-5 h-5 object-cover rounded-md"
                      />
                    ) : (
                      <ImageIcon size={18} />
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-500 truncate max-w-60">
                    {imageFile
                      ? imageFile.name
                      : editingIngredient && editingIngredient.imageUrl
                        ? "Mantener imagen actual..."
                        : "Seleccionar archivo de imagen..."}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
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
