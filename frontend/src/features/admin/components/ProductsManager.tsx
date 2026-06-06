import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  RefreshCw,
  X,
  Image as ImageIcon,
  Sliders,
  Filter,
} from "lucide-react";
import { productsService } from "../../../api/productsService";
import { categoriesService } from "../../../api/categoriesService";
import { ingredientsService } from "../../../api/ingredientsService";
import type {
  Product,
  Category,
  Ingredient,
  IngredientCategory,
} from "../../../types";

// Catálogos estáticos para mapeo de etiquetas legibles en la UI
const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  PROTEINA: "Proteínas",
  BARRA: "Ingredientes de Barra",
  COMPLEMENTO: "Complementos",
  ADEREZO: "Aderezos",
  TORTILLA: "Tortillas (Wraps)",
  PAN: "Panes (Baguettes / Hamburguesas)",
};

const ALL_INGREDIENT_CATEGORIES: IngredientCategory[] = [
  "PROTEINA",
  "BARRA",
  "COMPLEMENTO",
  "ADEREZO",
  "TORTILLA",
  "PAN",
];

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para el filtrado en tiempo real
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");

  // Control de archivos e imágenes
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Control de Modales y Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estado del formulario unificado con esquema dinámico de reglas de negocio
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    categoryId: "",
    isActive: true,
    isCustomizable: false,
    rules: ALL_INGREDIENT_CATEGORIES.map((cat) => ({
      category: cat,
      minQuantity: 0,
      maxQuantity: 0,
    })),
    ingredientsIds: [] as string[],
  });

  // 1. Sincronizar catálogos en paralelo
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productsData, categoriesData, ingredientsData] = await Promise.all(
        [
          productsService.getAll(),
          categoriesService.getAll(),
          ingredientsService.getAll(),
        ],
      );
      setProducts(productsData);
      setCategories(categoriesData);
      setIngredients(ingredientsData.filter((i) => i.isActive));
    } catch (err) {
      console.error(err);
      setError("Error al sincronizar el catálogo con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Lógica de filtrado reactivo (Client-side)
  const filteredProducts = products.filter((product) => {
    if (selectedCategoryFilter === "all") return true;
    return product.categoryId === selectedCategoryFilter;
  });

  // 3. Cierre centralizado y seguro de modales (Evita fugas de memoria con imágenes)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);

    // 💡 IMPORTANTE: Solo revocar si es un blob local generado por el navegador
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setImageFile(null);
    setPreviewUrl(null);
  };

  // 4. Abrir modal para Crear
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: 0,
      description: "",
      categoryId: categories[0]?.id || "",
      isActive: true,
      isCustomizable: false,
      rules: ALL_INGREDIENT_CATEGORIES.map((cat) => ({
        category: cat,
        minQuantity: 0,
        maxQuantity: 0,
      })),
      ingredientsIds: [],
    });
    setImageFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  // 5. Abrir modal para Editar
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    const currentIngredientIds =
      product.availableIngredients?.map((ai) => ai.ingredientId) || [];

    const builtRules = ALL_INGREDIENT_CATEGORIES.map((cat) => {
      const existingRule = product.rules?.find((r) => r.category === cat);
      return {
        category: cat,
        minQuantity: existingRule ? existingRule.minQuantity : 0,
        maxQuantity: existingRule ? existingRule.maxQuantity : 0,
      };
    });

    setFormData({
      name: product.name,
      price: Number(product.price),
      description: product.description || "",
      categoryId: product.categoryId,
      isActive: product.isActive,
      isCustomizable: product.isCustomizable,
      rules: builtRules,
      ingredientsIds: currentIngredientIds,
    });
    setImageFile(null);
    setPreviewUrl(product.imageUrl || null);
    setIsModalOpen(true);
  };

  // 6. Checkbox manager de ingredientes
  const handleToggleIngredient = (id: string) => {
    setFormData((prev) => {
      const exists = prev.ingredientsIds.includes(id);
      const newIds = exists
        ? prev.ingredientsIds.filter((item) => item !== id)
        : [...prev.ingredientsIds, id];
      return { ...prev, ingredientsIds: newIds };
    });
  };

  const handleToggleAllIngredients = () => {
    const allActiveIds = ingredients.map((ing) => ing.id);
    const isAllSelected =
      formData.ingredientsIds.length === allActiveIds.length;

    setFormData((prev) => ({
      ...prev,
      ingredientsIds: isAllSelected ? [] : allActiveIds,
    }));
  };

  const handleRuleChange = (
    category: IngredientCategory,
    field: "minQuantity" | "maxQuantity",
    value: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) =>
        rule.category === category ? { ...rule, [field]: value } : rule,
      ),
    }));
  };

  // 7. Interruptor rápido para cambiar estado directo en la tabla
  const handleToggleStatus = async (product: Product) => {
    setIsLoading(true);
    const nextStatus = !product.isActive;

    try {
      const data = new FormData();
      data.append("name", product.name);
      data.append("price", product.price.toString());
      data.append("description", product.description || "");
      data.append("categoryId", product.categoryId);
      data.append("isActive", nextStatus.toString());
      data.append("isCustomizable", product.isCustomizable.toString());

      if (product.isCustomizable && product.rules) {
        data.append("rules", JSON.stringify(product.rules));
      }

      await productsService.update(product.id, data);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: nextStatus } : p,
        ),
      );
    } catch (err) {
      console.error("Error cambiando el estado del producto:", err);
      alert("No se pudo cambiar el estado del producto. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Envío de formulario
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("price", formData.price.toString());
      data.append("description", formData.description.trim());
      data.append("categoryId", formData.categoryId);
      data.append("isActive", formData.isActive.toString());
      data.append("isCustomizable", formData.isCustomizable.toString());

      if (formData.isCustomizable) {
        data.append("rules", JSON.stringify(formData.rules));

        formData.ingredientsIds.forEach((id) => {
          data.append("ingredientsIds", id);
        });
      }

      // Validación de archivo binario real
      if (imageFile && imageFile instanceof File) {
        data.append("file", imageFile);
      }

      if (editingProduct) {
        await productsService.update(editingProduct.id, data);

        if (formData.isCustomizable) {
          await productsService.updateIngredients(editingProduct.id, {
            ingredientIds: formData.ingredientsIds,
          });
        }
      } else {
        await productsService.create(data);
      }

      // Cerrar y limpiar de forma segura
      handleCloseModal();
      await fetchData();
    } catch (err) {
      console.error("Error al procesar el guardado del producto:", err);
      alert(
        "Ocurrió un problema al guardar el producto. Verifica la consola y los tipos de datos.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-slate-50">
      {/* Cabecera Interna */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Catálogo de Productos
        </h2>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            size={18}
            className={isLoading ? "animate-spin text-emerald-600" : ""}
          />
        </button>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Da de alta platillos, gestiona precios y configura la
              personalización de ingredientes en barra.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98] self-end md:self-auto"
          >
            <Plus size={16} strokeWidth={3} /> Agregar Producto
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl">
            {error}
          </div>
        )}

        {/* BARRA DE FILTROS */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-slate-400 shrink-0">
              <Filter size={18} />
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-semibold bg-slate-50 text-slate-700 focus:outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer appearance-none"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            Mostrando:{" "}
            <span className="text-slate-700 font-mono">
              {filteredProducts.length}
            </span>{" "}
            de{" "}
            <span className="text-slate-700 font-mono">{products.length}</span>{" "}
            productos
          </div>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Detalle del Producto</th>
                <th className="py-4 px-6">Categoría</th>
                <th className="py-4 px-6">Precio Base</th>
                <th className="py-4 px-6">Modo Ensamble</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {filteredProducts.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    {selectedCategoryFilter === "all"
                      ? "No se encontraron productos registrados en el menú."
                      : "No hay productos registrados en esta categoría."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 flex items-center gap-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center border border-dashed border-slate-200 shrink-0">
                          <ImageIcon size={18} />
                        </div>
                      )}
                      <div>
                        <p className="text-slate-900 font-bold">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-400 font-normal line-clamp-1 max-w-xs">
                          {product.description || "Sin descripción corta."}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200/40">
                        {product.category?.name || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      {product.isCustomizable ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md w-fit">
                            <Sliders size={12} /> Reglas Dinámicas
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal tracking-tight line-clamp-1 max-w-50">
                            {product.rules
                              ?.filter((r) => r.maxQuantity > 0)
                              .map(
                                (r) =>
                                  `${r.category.slice(0, 4)}: ${r.minQuantity}-${r.maxQuantity}`,
                              )
                              .join(" | ") || "Sin límites declarados"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          Fijo / Receta Cerrada
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleToggleStatus(product)}
                          className={`${
                            product.isActive ? "bg-emerald-600" : "bg-slate-200"
                          } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 shadow-inner`}
                        >
                          <span
                            className={`${
                              product.isActive
                                ? "translate-x-5"
                                : "translate-x-0"
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                        <span
                          className={`text-xs font-bold transition-colors duration-200 ${
                            product.isActive
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {product.isActive ? "Activo" : "Pausado"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenEdit(product)}
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
      </div>

      {/* MODAL DE OPERACIONES CORREGIDO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-900">
                {editingProduct
                  ? `Editar Producto: ${editingProduct.name}`
                  : "Nuevo Producto en Menú"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              {/* Bloque 1: Identificación */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nombre del Platillo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.categoryId}
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-white font-medium"
                  >
                    <option value="" disabled>
                      Selecciona una categoría
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bloque 2: Precios y Descripción */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Descripción / Ingredientes Base
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Precio Base ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Bloque 3: Carga de Imagen Optimizado */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Imagen de Presentación (Max 2MB - PNG/JPG)
                </label>
                <div className="relative group border border-slate-200 bg-slate-50 rounded-xl p-3 flex items-center gap-4 hover:bg-slate-100/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];

                        // 💡 Limpieza previa: revocar el blob viejo si ya existía uno en este render
                        if (previewUrl && previewUrl.startsWith("blob:")) {
                          URL.revokeObjectURL(previewUrl);
                        }

                        setImageFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 text-slate-500 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={18} />
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-500 truncate max-w-sm">
                    {imageFile ? imageFile.name : "Subir nueva fotografía..."}
                  </span>
                </div>
              </div>

              {/* Bloque 4: Esquema de Reglas de Ensamble */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      ¿Es un producto armable / personalizable?
                    </h4>
                    <p className="text-xs text-slate-400 font-normal">
                      Permite configurar límites de ingredientes para ensaladas,
                      wraps, baguettes, etc.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isCustomizable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isCustomizable: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {formData.isCustomizable && (
                  <div className="pt-2 border-t border-slate-200/60 space-y-3 animate-in slide-in-from-top-2 duration-150">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      <div className="col-span-6">Categoría de Barra</div>
                      <div className="col-span-3 text-center">
                        Mínimo (Obligatorio)
                      </div>
                      <div className="col-span-3 text-center">
                        Máximo Permitido
                      </div>
                    </div>

                    {formData.rules.map((rule) => (
                      <div
                        key={rule.category}
                        className="grid grid-cols-12 gap-2 items-center bg-white border border-slate-200/70 p-2 rounded-xl shadow-sm"
                      >
                        <div className="col-span-6 text-xs font-bold text-slate-700 pl-1">
                          {CATEGORY_LABELS[rule.category]}
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="0"
                            value={rule.minQuantity}
                            onChange={(e) =>
                              handleRuleChange(
                                rule.category,
                                "minQuantity",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center font-semibold focus:outline-none focus:border-slate-900 bg-slate-50/50"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="0"
                            value={rule.maxQuantity}
                            onChange={(e) =>
                              handleRuleChange(
                                rule.category,
                                "maxQuantity",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center font-semibold focus:outline-none focus:border-slate-900 bg-slate-50/50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bloque 5: Selección de Ingredientes Habilitados */}
              {formData.isCustomizable && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Ingredientes permitidos para ensamble (
                      {formData.ingredientsIds.length})
                    </label>
                    {ingredients.length > 0 && (
                      <button
                        type="button"
                        onClick={handleToggleAllIngredients}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200/50"
                      >
                        {formData.ingredientsIds.length === ingredients.length
                          ? "Desmarcar todos"
                          : "Seleccionar todos"}
                      </button>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-xl bg-white max-h-44 overflow-y-auto p-2.5 grid grid-cols-2 gap-2">
                    {ingredients.length === 0 ? (
                      <p className="text-xs text-slate-400 p-2 col-span-2 text-center">
                        No hay ingredientes activos registrados en la barra.
                      </p>
                    ) : (
                      ingredients.map((ing) => {
                        const isChecked = formData.ingredientsIds.includes(
                          ing.id,
                        );
                        return (
                          <div
                            key={ing.id}
                            onClick={() => handleToggleIngredient(ing.id)}
                            className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? "border-emerald-600 bg-emerald-50/40 text-slate-900 shadow-sm"
                                : "border-slate-100 bg-slate-50/40 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-emerald-600 rounded h-4 w-4 shrink-0"
                            />
                            <div className="truncate">
                              <p className="text-xs font-bold truncate">
                                {ing.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-normal">
                                {ing.isExtra
                                  ? `Extra (+$${Number(ing.price).toFixed(2)})`
                                  : `Barra / ${CATEGORY_LABELS[ing.category]?.split(" ")[0] || ing.category}`}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Bloque 6: Disponibilidad */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">
                    Disponible para Venta
                  </label>
                  <span className="text-xs text-slate-400">
                    Determina si aparece en el menú visible para comandas.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Botonera de Cierre */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                >
                  {isLoading
                    ? "Guardando..."
                    : editingProduct
                      ? "Guardar Cambios"
                      : "Agregar Platillo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
