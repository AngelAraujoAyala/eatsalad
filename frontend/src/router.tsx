import { createBrowserRouter } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import TabletPage from "./pages/TabletPage";
import OrderFlowPage from "./features/order/OrderFlowPage";
import AdminDashboardPage from "./features/admin/AdminDashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomePage />,
  },
  {
    path: "/ordenar",
    element: <OrderFlowPage />,
  },
  {
    path: "/tablet",
    element: <TabletPage />,
  },
  {
    path: "*",
    element: (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">404 - Página no encontrada</h1>
      </div>
    ),
  },
  {
    path: "/admin",
    element: <AdminDashboardPage />,
  },
]);
