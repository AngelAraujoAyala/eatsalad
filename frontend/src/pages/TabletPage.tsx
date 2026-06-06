import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Utensils,
  ShoppingBag,
  DollarSign,
} from "lucide-react";

// Interfaces (mantenidas igual)
interface OrderItemConfig {
  protein?: string[];
  toppings?: string[];
  aderezos?: string[];
  extras?: string[];
}

interface MockOrderItem {
  id: string;
  product: { name: string; isCustomizable: boolean };
  quantity: number;
  priceAtPurchase: number;
  configuration: OrderItemConfig;
}

interface MockOrder {
  id: string;
  total: number;
  status: "PENDIENTE" | "FINALIZADO" | "CANCELADO";
  createdAt: string;
  type: "COMEDOR" | "RECOGER";
  pickupTime: string;
  customerName: string;
  items: MockOrderItem[];
}

const MOCK_ORDERS: MockOrder[] = [
  {
    id: "ORD-1024",
    total: 145.0,
    status: "PENDIENTE",
    createdAt: "10:14 AM",
    type: "RECOGER",
    pickupTime: "10:30 AM",
    customerName: "Carlos Mendoza",
    items: [
      {
        id: "item-1",
        product: { name: "Ensalada Mediana", isCustomizable: true },
        quantity: 1,
        priceAtPurchase: 145.0,
        configuration: {
          protein: ["Pollo a la plancha", "Boneless (+ $25)"],
          toppings: ["Aguacate", "Crutones", "Tomate Cherry", "Espinaca"],
          aderezos: ["Ranch", "Mostaza Miel"],
          extras: ["Parmisano gratis", "Chile quebrado"],
        },
      },
    ],
  },
  {
    id: "ORD-1025",
    total: 210.5,
    status: "PENDIENTE",
    createdAt: "10:10 AM",
    type: "COMEDOR",
    pickupTime: "Inmediato",
    customerName: "Ana Sofía",
    items: [
      {
        id: "item-2",
        product: { name: "Ensalada Grande", isCustomizable: true },
        quantity: 1,
        priceAtPurchase: 180.0,
        configuration: {
          protein: ["Doble Pollo", "Arrachera"],
          toppings: [
            "Queso de Cabra",
            "Nuez Garrapiñada",
            "Manzana",
            "Arándanos",
            "Pimiento",
          ],
          aderezos: ["César", "Vinagreta Balsámica", "Ranch"],
          extras: ["Parmisano gratis"],
        },
      },
      {
        id: "item-3",
        product: { name: "Agua del Día (Litro)", isCustomizable: false },
        quantity: 1,
        priceAtPurchase: 30.5,
        configuration: {},
      },
    ],
  },
];

export default function TabletPage() {
  const [orders, setOrders] = useState<MockOrder[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(
    MOCK_ORDERS[0],
  );
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateStatus = (
    orderId: string,
    newStatus: "FINALIZADO" | "CANCELADO",
  ) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o,
    );
    setOrders(updated);
    const remainingPendings = updated.filter((o) => o.status === "PENDIENTE");
    setSelectedOrder(
      remainingPendings.length > 0 ? remainingPendings[0] : null,
    );
  };

  const pendingOrders = orders.filter((o) => o.status === "PENDIENTE");

  return (
    <div className="grid grid-rows-[auto_1fr] h-screen w-screen bg-slate-900 text-white overflow-hidden select-none">
      {/* HEADER */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-black">
          eat<span className="text-green-500 font-light">salad</span>
        </h1>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-400">ÓRDENES PENDIENTES</p>
            <p className="text-xl font-bold text-green-500">
              {pendingOrders.length}
            </p>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-xl font-mono text-lg font-bold flex items-center gap-2">
            <Clock size={18} className="text-orange-500" /> {time}
          </div>
        </div>
      </header>

      {/* CUERPO: Panel Izquierdo (Lista) + Panel Derecho (Detalle) */}
      <div className="grid grid-cols-[2fr_3fr] overflow-hidden">
        <aside className="overflow-y-auto p-4 space-y-3 border-r border-slate-800">
          {pendingOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between transition-all ${
                selectedOrder?.id === order.id
                  ? "bg-slate-800 border-green-500"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <div>
                <p className="font-mono font-bold text-lg">{order.id}</p>
                <p className="font-bold">{order.customerName}</p>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg">
                {order.type === "RECOGER" ? (
                  <ShoppingBag size={20} />
                ) : (
                  <Utensils size={20} />
                )}
              </div>
            </button>
          ))}
        </aside>

        <main className="flex flex-col h-full overflow-hidden bg-slate-900">
          {selectedOrder ? (
            <>
              {/* Contenido con scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <h2 className="text-3xl font-black">
                    {selectedOrder.customerName}
                  </h2>
                  <p className="text-green-500 font-bold mt-1">
                    Recoge: {selectedOrder.pickupTime}
                  </p>
                </div>

                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2"
                  >
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <span className="bg-green-500/20 text-green-500 px-2 py-0.5 rounded text-sm">
                        {item.quantity}x
                      </span>
                      {item.product.name}
                    </h4>
                    {/* Configuraciones con colores */}
                    {item.configuration.protein && (
                      <p className="text-xs text-red-400">
                        🥩 {item.configuration.protein.join(", ")}
                      </p>
                    )}
                    {item.configuration.toppings && (
                      <p className="text-xs text-green-400">
                        🥗 {item.configuration.toppings.join(", ")}
                      </p>
                    )}
                    {item.configuration.aderezos && (
                      <p className="text-xs text-orange-400">
                        🍯 {item.configuration.aderezos.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* FOOTER CON ICONOS */}
              <footer className="p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <DollarSign size={24} className="text-slate-400" />
                  <p className="text-3xl font-black">
                    ${selectedOrder.total.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, "CANCELADO")
                    }
                    className="flex items-center gap-2 px-5 py-4 border border-slate-800 rounded-2xl hover:bg-slate-900"
                  >
                    <XCircle size={20} /> Cancelar
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, "FINALIZADO")
                    }
                    className="flex items-center gap-2 px-8 py-4 bg-green-600 rounded-2xl font-black text-lg"
                  >
                    <CheckCircle size={20} /> Completar y Entregar
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
              <ShoppingBag size={48} className="mb-4 opacity-50" />
              Selecciona un pedido para ver los detalles
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
