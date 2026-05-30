import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  RefreshCw,
  X,
  Image as ImageIcon,
  Layers,
  Trash2,
} from "lucide-react";
import { combosService } from "../../../api/combosService";
import { productsService } from "../../../api/productsService";
import type { Combo, Product } from "../../../types";

export default function CombosManager() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtro por estado
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Control de imágenes
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Control de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    isActive: true,
    items: [] as { productId: string; quantity: number }[],
  });

  // 1. Sincronizar catálogos en paralelo
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [combosData, productsData] = await Promise.all([
        combosService.getAll(),
        productsService.getAll(),
      ]);
      setCombos(combosData);
      setProducts(productsData.filter((p) => p.isActive));
    } catch (err) {
      console.error(err);
      setError("Error al sincronizar el catálogo de combos con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Filtrado en memoria
  const filteredCombos = combos.filter((combo) => {
    if (statusFilter === "all") return true;
    return statusFilter === "active" ? combo.isActive : !combo.isActive;
  });

  // 3. Inicializar Crear
  const handleOpenAdd = () => {
    setEditingCombo(null);
    setFormData({
      name: "",
      price: 0,
      description: "",
      isActive: true,
      items: [],
    });
    setImageFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  // 4. Inicializar Editar
  const handleOpenEdit = (combo: Combo) => {
    setEditingCombo(combo);
    setFormData({
      name: combo.name,
      price: Number(combo.price),
      description: combo.description || "",
      isActive: combo.isActive,
      items: combo.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    });
    setImageFile(null);
    setPreviewUrl(combo.imageUrl || null);
    setIsModalOpen(true);
  };

  // 5. Gestión del Arreglo de Productos del Combo
  const handleAddProductToCombo = (productId: string) => {
    if (!productId) return;
    setFormData((prev) => {
      const exists = prev.items.find((item) => item.productId === productId);
      if (exists) return prev; // Evita duplicar fila, se maneja por cantidad
      return {
        ...prev,
        items: [...prev.items, { productId, quantity: 1 }],
      };
    });
  };

  const handleUpdateItemQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.productId !== productId),
    }));
  };

  // 6. Interruptor de estado veloz en tabla
  const handleToggleStatus = async (combo: Combo) => {
    setIsLoading(true);
    const nextStatus = !combo.isActive;

    try {
      const data = new FormData();
      data.append("name", combo.name);
      data.append("price", combo.price.toString());
      data.append("description", combo.description || "");
      data.append("isActive", nextStatus.toString());
      // Reenviamos sus ítems serializados exactamente en el formato JSON esperado
      data.append(
        "items",
        JSON.stringify(
          combo.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        ),
      );

      await combosService.update(combo.id, data);

      setCombos((prev) =>
        prev.map((c) =>
          c.id === combo.id ? { ...c, isActive: nextStatus } : c,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado del combo.");
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Envío unificado al Backend
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert("Debes agregar al menos un producto para conformar el combo.");
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price.toString());
      data.append("description", formData.description);
      data.append("isActive", formData.isActive.toString());

      // Crucial: Conversión a string JSON para empalmar con tu Backend
      data.append("items", JSON.stringify(formData.items));

      if (imageFile) {
        data.append("file", imageFile);
      }

      if (editingCombo) {
        await combosService.update(editingCombo.id, data);
      } else {
        await combosService.create(data);
      }

      setIsModalOpen(false);
      setImageFile(null);
      if (previewUrl && !editingCombo) URL.revokeObjectURL(previewUrl);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al procesar el combo. Revisa los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-slate-50">
      {/* Cabecera */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Gestión de Combos y Paquetes
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

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Diseña paquetes promocionales, agrupa productos frecuentes y asigna
            precios especiales de venta.
          </p>
          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98] self-end md:self-auto"
          >
            <Plus size={16} strokeWidth={3} /> Crear Nuevo Combo
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Filtrar por:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-1.5 text-sm font-semibold bg-slate-50 text-slate-700 focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
            >
              <option value="all">Todos los combos</option>
              <option value="active">Solo Activos</option>
              <option value="inactive">Pausados</option>
            </select>
          </div>
          <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            Total:{" "}
            <span className="text-slate-700 font-mono">
              {filteredCombos.length}
            </span>{" "}
            combos
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Detalle del Combo</th>
                <th className="py-4 px-6">Productos Incluidos</th>
                <th className="py-4 px-6">Precio Combo</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {filteredCombos.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No se encontraron combos registrados bajo este criterio.
                  </td>
                </tr>
              ) : (
                filteredCombos.map((combo) => (
                  <tr
                    key={combo.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 flex items-center gap-4">
                      {combo.imageUrl ? (
                        <img
                          src={combo.imageUrl}
                          alt={combo.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center border border-dashed border-slate-200 shrink-0">
                          <Layers size={18} />
                        </div>
                      )}
                      <div>
                        <p className="text-slate-900 font-bold">{combo.name}</p>
                        <p className="text-xs text-slate-400 font-normal line-clamp-1 max-w-xs">
                          {combo.description || "Sin descripción corta."}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {combo.items?.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-slate-100 border border-slate-200/60 rounded-md px-2 py-0.5 text-xs text-slate-600 font-medium"
                          >
                            {item.quantity}x {item.product?.name || "Platillo"}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      ${Number(combo.price).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleToggleStatus(combo)}
                          className={`${
                            combo.isActive ? "bg-emerald-600" : "bg-slate-200"
                          } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 shadow-inner`}
                        >
                          <span
                            className={`${
                              combo.isActive ? "translate-x-5" : "translate-x-0"
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                        <span
                          className={`text-xs font-bold ${combo.isActive ? "text-emerald-600" : "text-slate-400"}`}
                        >
                          {combo.isActive ? "Activo" : "Pausado"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenEdit(combo)}
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

      {/* MODAL GESTOR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-900">
                {editingCombo
                  ? `Editar Combo: ${editingCombo.name}`
                  : "Configurar Nuevo Combo"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              {/* Bloque 1 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nombre del Combo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej. Combo Familiar Parejas"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Precio Paquete ($)
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

              {/* Bloque 2 */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Descripción Comercial / Leyendas Especiales
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ej. Incluye 2 ensaladas grandes a elegir de barra y 2 bebidas..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              {/* Bloque 3: Fotografía */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Imagen Promocional
                </label>
                <div className="relative group border border-slate-200 bg-slate-50 rounded-xl p-3 flex items-center gap-4 hover:bg-slate-100/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
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
                    {imageFile ? imageFile.name : "Subir foto del paquete..."}
                  </span>
                </div>
              </div>

              {/* Bloque 4: ENSAMBLE DINÁMICO DE PRODUCTOS */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Platillos que componen el combo
                  </h4>
                  <p className="text-xs text-slate-400">
                    Asigna los productos y las unidades incluidas en la venta.
                  </p>
                </div>

                {/* Buscador/Selector */}
                <div className="flex gap-2">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      handleAddProductToCombo(e.target.value);
                      e.target.value = ""; // Resetea el combo box inmediatamente
                    }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:border-slate-900 font-medium cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Haz clic aquí para buscar e incorporar un platillo --
                    </option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} (${Number(prod.price).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lista de seleccionados */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.items.length === 0 ? (
                    <p className="text-xs text-center text-slate-400 py-4 bg-white rounded-xl border border-dashed border-slate-200">
                      El paquete se encuentra vacío en este momento.
                    </p>
                  ) : (
                    formData.items.map((item) => {
                      const completeProduct = products.find(
                        (p) => p.id === item.productId,
                      );
                      return (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-1 duration-100"
                        >
                          <span className="text-xs font-bold text-slate-800 truncate max-w-xs">
                            {completeProduct?.name || "Producto base"}
                          </span>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400">
                                Cant:
                              </span>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItemQuantity(
                                    item.productId,
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                className="w-14 border border-slate-200 rounded-lg px-2 py-1 text-center font-semibold font-mono text-xs focus:outline-none focus:border-slate-900"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.productId)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Botonera Cierre */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                    : editingCombo
                      ? "Guardar Paquete"
                      : "Dar de Alta Combo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
