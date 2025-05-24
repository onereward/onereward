import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Home, CreditCard, Wifi, LogOut, QrCode } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [initials, setInitials] = useState("U");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [openQrDialog, setOpenQrDialog] = useState(false); // modal state

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const name = parsed.name || parsed.email || "User";
        setUsername(name);

        const nameParts = name.split(" ");
        const initials =
          nameParts.length === 1
            ? nameParts[0].charAt(0)
            : nameParts[0].charAt(0) + nameParts[1]?.charAt(0);
        setInitials(initials.toUpperCase());

        // Fetch QR Code
        axios
          .get(`/api/user-qr/${parsed.email}`)
          .then((res) => {
            if (res.data.success) {
              setQrCode(res.data.qrCode);
            }
          })
          .catch((err) => console.error("QR Fetch error:", err));
      } catch {
        setUsername("User");
      }
    } else {
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-primary">Loyalty App</h1>
          <div className="ml-2 flex items-center text-xs text-primary/70">
            <Wifi className="h-3 w-3 mr-1 animate-pulse" />
            <span>Live</span>
          </div>
        </div>

        {/* User info with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={username} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-primary max-w-[150px] truncate">
                {username}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                toast({
                  title: "Account",
                  description: "Account settings will be available in a future update.",
                })
              }
            >
              Account Settings
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setOpenQrDialog(true)}>
              <QrCode className="h-4 w-4 mr-2" />
              Customer QR
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-auto px-4 py-4 md:px-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="h-16 grid grid-cols-2 border-t border-border bg-background">
        <Link
          to="/customer/home"
          className={`flex flex-col items-center justify-center transition-colors ${
            isActive("/customer/home") || isActive("/customer")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          to="/customer/cards"
          className={`flex flex-col items-center justify-center transition-colors ${
            isActive("/customer/cards") || location.pathname.startsWith("/customer/cards/")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="h-5 w-5" />
          <span className="text-xs mt-1">My Cards</span>
        </Link>
      </nav>

      {/* QR Code Dialog */}
      {qrCode && (
        <Dialog open={openQrDialog} onOpenChange={setOpenQrDialog}>
          <DialogContent className="w-[300px] rounded-xl">
            <DialogHeader>
              <DialogTitle>Your QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="Customer QR Code"
                className="w-48 h-48 border rounded"
              />
              <a
                href={`data:image/png;base64,${qrCode}`}
                download="customer-qr.png"
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary/90 transition"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Download QR
              </a>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomerLayout;
