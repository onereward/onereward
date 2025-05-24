import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("customer");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    try {
      if (userType === "admin") {
        if (email === "admin@gmail.com" && password === "admin") {
          localStorage.setItem(
            "user",
            JSON.stringify({ name: "Admin", email, userType: "admin" })
          );
          toast({
            title: "Admin logged in",
            description: "Welcome to the admin panel.",
          });
          return navigate("/admin");
        } else {
          return setError("Invalid admin credentials.");
        }
      }
  
      if (userType === "restaurant") {
        const { data } = await axios.get("/api/restaurants");
  
        const found = data.find(
          (rest: any) =>
            rest.email === email && rest.password === password
        );
  
        if (found) {
          localStorage.setItem("user", JSON.stringify(found));
          toast({
            title: "Restaurant logged in",
            description: `Welcome ${found.name}`,
          });
          return navigate("/restaurant/dashboard");
        } else {
          return setError("Invalid restaurant credentials.");
        }
      }
  
      if (userType === "scanner") {
        // Check restaurant for scanner login
        const { data } = await axios.get("/api/restaurants");
  
        const foundScanner = data.find(
          (rest: any) => rest.email === email && rest.password === password
        );
  
        if (foundScanner) {
          localStorage.setItem("user", JSON.stringify(foundScanner));
          toast({
            title: "Scanner logged in",
            description: `Welcome ${foundScanner.name}`,
          });
          return navigate("/scanner");
        } else {
          return setError("Invalid scanner credentials.");
        }
      }
  
      // Unified login for customer
      const response = await axios.post("/api/auth/login", {
        email,
        password,
        userType,
      });
  
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast({
        title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} logged in`,
        description: `Welcome to the ${userType} dashboard.`,
      });
  
      if (userType === "scanner") {
        return navigate("/scanner");
      } else {
        return navigate("/customer/home");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Link to="/" className="mb-8 text-2xl font-bold text-primary">
        Loyalty App
      </Link>

      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <Tabs
          defaultValue="customer"
          className="w-full"
          onValueChange={setUserType}
        >
          <TabsList className="grid grid-cols-4 mb-4 mx-4">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
            <TabsTrigger value="scanner">Scanner</TabsTrigger>
          </TabsList>

          <CardContent>
            {error && (
              <div className="mb-4 p-2 bg-destructive/10 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="#"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Tabs>

        <CardFooter className="flex flex-col space-y-4 mt-4">
          <div className="text-sm text-center text-muted-foreground">
            {userType === "customer" ? (
              <>
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </>
            ) : userType === "admin" ? (
              <>Admin accounts are pre-configured.</>
            ) : (
              <>
                {userType.charAt(0).toUpperCase() + userType.slice(1)}{" "}
                accounts must be created by an admin.
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
