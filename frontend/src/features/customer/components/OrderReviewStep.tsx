import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ShoppingBasket, Trash2 } from "lucide-react";
import { useOrderStore } from "../../../store/useOrderStore";
import { ordersService } from "../../../api/ordersService";

// 💡 CORRECCIÓN: Ajustamos la interfaz local para que coincida con tu nuevo DTO
interface OrderPayload {
  customerName: string;
  serviceType: "COMEDOR" | "RECOGER";
  pickupTime?: string;
  items: {
    productId: string;
    quantity: number;
    configuration: Record<string, string[]>; // Ensaladas o vacíos {}
  }[];
}

export default function OrderReviewStep() {
  const {
    cart,
    customerName,
    serviceType,
    pickupTime,
    prevStep,
    nextStep,
    removeFromCart,
  } = useOrderStore();

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.customPrice * item.quantity,
    0,
  );

  const { mutate: sendOrder, isPending } = useMutation({
    // 💡 CORRECCIÓN: Usamos 'as unknown as Parameters<...>' para transformar el tipo de forma segura sin activar la regla 'no-explicit-any'
    mutationFn: (orderPayload: OrderPayload) =>
      ordersService.create(
        orderPayload as unknown as Parameters<typeof ordersService.create>[0],
      ),
    onSuccess: () => {
      nextStep();
    },
    onError: (error) => {
      console.error("Error al procesar la comanda:", error);
      alert("Hubo un error al enviar tu pedido. Por favor, intenta de nuevo.");
    },
  });

  const handleConfirmOrder = () => {
    const orderPayload: OrderPayload = {
      customerName,
      serviceType,
      ...(serviceType === "RECOGER" ? { pickupTime } : {}),

      // 💡 SOLUCIÓN: Añadimos ": OrderPayload["items"][number]" para obligar a TS a validar cada return por separado
      items: cart.map((item): OrderPayload["items"][number] => {
        // CASO 1: Producto regular (Bebidas, combos, etc.)
        if (!item.product.isCustomizable) {
          return {
            productId: item.product.id,
            quantity: item.quantity,
            configuration: {}, // Validado correctamente como un Record vacío
          };
        }

        // CASO 2: Producto personalizable (Ensaladas)
        return {
          productId: item.product.id,
          quantity: item.quantity,
          configuration: {
            proteins: (item.saladConfiguration?.proteins || []).map(
              (p) => p.id,
            ),
            barItems: (item.saladConfiguration?.barItems || []).map(
              (b) => b.id,
            ),
            dressings: (item.saladConfiguration?.dressings || []).map(
              (d) => d.id,
            ),
            toppings: (item.saladConfiguration?.toppings || []).map(
              (t) => t.id,
            ),
          },
        };
      }),
    };

    sendOrder(orderPayload);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* HEADER DE CHECKOUT */}
      <div className="flex items-center justify-between gap-2 bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Paso 3 de 3
          </span>
          <h2 className="text-base font-black text-slate-900">
            Resumen de tu Pedido
          </h2>
        </div>
        <button
          onClick={prevStep}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 border border-slate-200 px-3 py-2 rounded-xl bg-white disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Modificar
        </button>
      </div>

      {/* DETALLES DE ENTREGA */}
      <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Datos de entrega
        </p>
        <p className="text-sm font-black">
          A nombre de: <span className="text-emerald-400">{customerName}</span>
        </p>
        <p className="text-xs font-medium text-slate-300">
          Modalidad:{" "}
          {serviceType === "COMEDOR"
            ? "🍽️ Para comer en Comedor"
            : `🚗 Recoger más tarde (${pickupTime} hrs)`}
        </p>
      </div>

      {/* DESGLOSE DEL CARRITO */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 px-1 text-slate-400">
          <ShoppingBasket size={15} strokeWidth={2.5} />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Productos en tu bolsa
          </h3>
        </div>

        {cart.map((item) => (
          <div
            key={item.cartItemId}
            className="bg-white border border-slate-100 rounded-xl p-3.5 flex flex-col gap-2 relative shadow-xs"
          >
            <div className="flex justify-between items-start pr-6">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {item.product.name}{" "}
                  <span className="text-slate-400 text-xs font-normal font-mono">
                    x{item.quantity}
                  </span>
                </h4>
                <p className="text-xs font-black text-slate-900 font-mono mt-0.5">
                  ${(item.customPrice * item.quantity).toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => removeFromCart(item.cartItemId)}
                disabled={isPending}
                className="absolute top-3.5 right-3.5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="bg-slate-50/70 rounded-lg p-2.5 text-[11px] text-slate-600 border border-slate-100">
              {item.type === "ENSALADA" && item.saladConfiguration ? (
                <div className="space-y-1">
                  <p>
                    <strong className="text-slate-800">Proteínas:</strong>{" "}
                    {item.saladConfiguration.proteins
                      .map((i) => i.name)
                      .join(", ") || "Ninguna"}
                  </p>
                  <p>
                    <strong className="text-slate-800">Barra:</strong>{" "}
                    {item.saladConfiguration.barItems
                      .map((i) => i.name)
                      .join(", ") || "Ninguno"}
                  </p>
                  <p>
                    <strong className="text-slate-800">Aderezos:</strong>{" "}
                    {item.saladConfiguration.dressings
                      .map((i) => i.name)
                      .join(", ") || "Ninguno"}
                  </p>
                  <p>
                    <strong className="text-slate-800">Tops:</strong>{" "}
                    {item.saladConfiguration.toppings
                      .map((i) => i.name)
                      .join(", ") || "Ninguno"}
                  </p>
                </div>
              ) : (
                <p>
                  <strong className="text-slate-800">Extras incluidos:</strong>{" "}
                  {item.selectedExtras && item.selectedExtras.length > 0
                    ? item.selectedExtras
                        .map((e) => `${e.name} (+$${e.price})`)
                        .join(", ")
                    : "Ninguno"}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN TOTALES FIJA INFERIOR */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Gran Total a pagar
          </span>
          <span className="text-2xl font-black text-slate-950 font-mono">
            ${grandTotal.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          disabled={isPending || cart.length === 0}
          onClick={handleConfirmOrder}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-xs shadow-md shadow-emerald-600/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando a cocina...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} strokeWidth={2.5} /> Confirmar y Enviar
              Pedido
            </>
          )}
        </button>
      </div>
    </div>
  );
}
