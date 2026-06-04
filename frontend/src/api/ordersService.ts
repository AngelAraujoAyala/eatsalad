import api from "./axios";
import type { Order, CreateOrderDto, UpdateOrderStatusDto } from "../types";

export const ordersService = {
  // POST /orders
  // Crea una nueva orden (comedor o para recoger) con su respectiva configuración JSON
  create: async (orderData: CreateOrderDto): Promise<Order> => {
    const { data } = await api.post<Order>("/orders", orderData);
    return data;
  },

  // GET /orders
  // Obtiene todas las órdenes mapeadas en orden descendente para la pantalla de administración/cocina
  getAll: async (): Promise<Order[]> => {
    const { data } = await api.get<Order[]>("/orders");
    return data;
  },

  // GET /orders/:id
  // Obtiene el detalle completo de una sola orden por su UUID
  getById: async (id: string): Promise<Order> => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  // PATCH /orders/:id/status
  // Cambia el estado de la comanda (PENDIENTE, FINALIZADO, CANCELADO) desde el panel de control
  updateStatus: async (
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> => {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, dto);
    return data;
  },
};
