import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  CreditCard,
  Palette,
  Menu,
  X,
  LogOut,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import axios from "axios";

const RestaurantLayout = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const [restaurantEmail, setRestaurantEmail] = useState("restaurant@example.com");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setRestaurantName(parsed.name || "Restaurant");
        setRestaurantEmail(parsed.email || "restaurant@example.com");
        setRestaurantId(parsed._id);

        // Fetch restaurant's background image
        if (parsed._id) {
          fetchBackgroundImage(parsed._id);
        }
      } catch {
        setRestaurantName("Restaurant");
        setRestaurantEmail("restaurant@example.com");
      }
    }
  }, []);

  const fetchBackgroundImage = async (restaurantId: string) => {
    try {
      const response = await axios.get(`/api/restaurant/${restaurantId}/card-image`);
      if (response.data.cardImage) {
        setBackgroundImage(response.data.cardImage);
      }
    } catch (error) {
      console.log('No background image found for restaurant ID:', restaurantId);
      // Set a default background or keep it null
      setBackgroundImage(null);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/restaurant/dashboard", icon: BarChart3, label: "Dashboard" },
    { path: "/restaurant/customers", icon: Users, label: "Customers" },
    { path: "/restaurant/notifications", icon: Bell, label: "Notifications" },
    { path: "/restaurant/points", icon: CreditCard, label: "Points Management" },
    { path: "/restaurant/card-design", icon: Palette, label: "Card Design" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex w-full overflow-hidden relative"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div className="relative z-10 flex w-full">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-sidebar/95 backdrop-blur-md text-sidebar-foreground transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <h1 className="text-xl font-semibold text-white">Restaurant Portal</h1>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5 text-sidebar-foreground" />
              </Button>
            )}
          </div>

          {/* Nav Links */}
          <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt={restaurantName} />
                <AvatarFallback className="bg-primary">
                  {restaurantName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {restaurantName}
                </p>
                <p className="text-xs text-sidebar-foreground/70">
                  {restaurantEmail}
                </p>
              </div>
            </div>
            <Separator className="my-3 bg-sidebar-border" />
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/70"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur-md">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className={`${!isMobile ? "ml-auto" : ""}`}>
            <p className="text-sm text-muted-foreground">
              Welcome back,{" "}
              <span className="font-medium text-foreground">{restaurantName}</span>
            </p>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-background/80 backdrop-blur-sm">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      </div>
    </div>
  );
};

export default RestaurantLayout;
