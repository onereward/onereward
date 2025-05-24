import { Outlet, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const ScannerLayout = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // ✅ Clears all localStorage

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });

  
    navigate("/login");
  
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-sidebar/95 backdrop-blur-sm">
        <h1 className="text-xl font-semibold text-white">Scanner App</h1>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-white/80 hover:text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </Button>
      </header>
      
      {/* Page Content */}
      <main className="flex-1 overflow-auto px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ScannerLayout;
