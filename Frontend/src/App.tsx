
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Landing page
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

// Admin dashboard pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminRestaurants from "./pages/admin/Restaurants";
import AdminCustomers from "./pages/admin/Customers";
import AdminSliders from "./pages/admin/Sliders";
import ContentLinks from "./pages/admin/ContentLinks";

// Restaurant dashboard pages
import RestaurantDashboard from "./pages/restaurant/Dashboard";
import RestaurantNotifications from "./pages/restaurant/Notifications";
import RestaurantCustomers from "./pages/restaurant/Customers";
import RestaurantPoints from "./pages/restaurant/Points";
import RestaurantCardDesign from "./pages/restaurant/CardDesign";

// Scanner app pages
import ScannerApp from "./pages/scanner/ScannerApp";

// Customer app pages
import CustomerHome from "./pages/customer/Home";
import CustomerCards from "./pages/customer/Cards";
import CustomerCardDetail from "./pages/customer/CardDetail";
import AccountSettings from "./pages/customer/AccountSettings";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Layouts
import AdminLayout from "./components/layouts/AdminLayout";
import RestaurantLayout from "./components/layouts/RestaurantLayout";
import ScannerLayout from "./components/layouts/ScannerLayout";
import CustomerLayout from "./components/layouts/CustomerLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="sliders" element={<AdminSliders />} />
            <Route path="content" element={<ContentLinks />} />
          </Route>
          
          {/* Restaurant Dashboard */}
          <Route path="/restaurant" element={<RestaurantLayout />}>
            <Route index element={<Navigate to="/restaurant/dashboard" replace />} />
            <Route path="dashboard" element={<RestaurantDashboard />} />
            <Route path="customers" element={<RestaurantCustomers />} />
            <Route path="notifications" element={<RestaurantNotifications />} />
            <Route path="points" element={<RestaurantPoints />} />
            <Route path="card-design" element={<RestaurantCardDesign />} />
          </Route>
          
          {/* Scanner App */}
          <Route path="/scanner" element={<ScannerLayout />}>
            <Route index element={<ScannerApp />} />
          </Route>
          
          {/* Customer App */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="/customer/home" replace />} />
            <Route path="home" element={<CustomerHome />} />
            <Route path="cards" element={<CustomerCards />} />
            <Route path="cards/:id" element={<CustomerCardDetail />} />
            <Route path="account-settings" element={<AccountSettings />} />
          </Route>
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
