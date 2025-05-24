import { useState, useRef, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, UserCircle, Scan, Plus, Minus, RotateCcw, ArrowRight, Check, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const ScannerApp = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("scan");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pointsValue, setPointsValue] = useState("50");
  const [transactionType, setTransactionType] = useState<"add" | "redeem">("add");
  const [customer, setCustomer] = useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const API_BASE_URL = "";
  const user = JSON.parse(localStorage.getItem("user"));  // Retrieve the user from localStorage

  const findCustomerByPhone = async (phone: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customer/by-phone/${phone}`);
      setCustomer(response.data.data);
    } catch (error: any) {
      console.error("Error fetching customer:", error);
      toast({
        title: "Customer not found",
        description: "No customer found with that phone number.",
        variant: "destructive",
      });
    }
  };

  const handleLookup = () => {
    if (phoneNumber.trim() === "") {
      toast({
        title: "Phone number required",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    findCustomerByPhone(phoneNumber);
  };

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/png");
    const base64Image = imageDataUrl.split(",")[1];

    try {
      const response = await axios.post(`${API_BASE_URL}/api/customer/scan-qr`, { base64Image });
      setCustomer(response.data.data);
      toast({
        title: "QR Scan Successful",
        description: `Customer: ${response.data.data.name}`,
      });
    } catch (err) {
      toast({
        title: "QR Scan Failed",
        description: err?.response?.data?.message || "Could not detect QR code.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmTransaction = () => {
    setConfirmDialogOpen(true);
  };

  console.log("******* " , user.name);

  const processTransaction = async () => {
    if (!customer) return;
  
    setConfirmDialogOpen(false);
  
    try {
      const updatedPoints = {
        points: parseInt(pointsValue),  
        restaurantName: user.name,     
      };
  

      const requestBody = {
        availablePoints: [updatedPoints],  // Add updated points to the availablePoints array
        type: transactionType,             // Include the transaction type ("add" or "redeem")
      };
  
      // Update the user with the new points and restaurant name
      const response = await fetch(`${API_BASE_URL}/api/user/points/${customer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),  // Send the updated request body
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update points");
      }
  
      const updatedCustomer = await response.json();
      setCustomer(updatedCustomer.customer);
  
      setSuccessDialogOpen(true);
  
      setTimeout(() => {
        setSuccessDialogOpen(false);
        setCustomer(null);
        setPhoneNumber("");
        setPointsValue("50");
      }, 3000);
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  

  const resetTransaction = () => {
    setCustomer(null);
    setPhoneNumber("");
    setPointsValue("50");
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target?.result?.toString().split(",")[1];
      try {
        const response = await axios.post(`${API_BASE_URL}/api/customer/scan-qr`, { base64Image });
        setCustomer(response.data.data);
        toast({
          title: "QR Scan Successful",
          description: `Customer: ${response.data.data.name}`,
        });
      } catch (err) {
        toast({
          title: "QR Scan Failed",
          description: err?.response?.data?.message || "Could not read QR code.",
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupCamera = async () => {
      if (isCameraActive && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          toast({
            title: "Camera Error",
            description: "Unable to access camera. Please check permissions.",
            variant: "destructive",
          });
        }
      }
    };

    if (activeTab === "scan") {
      setIsCameraActive(true);
      setupCamera();
    } else {
      setIsCameraActive(false);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeTab, isCameraActive, toast]);

  return (
    <div className="container mx-auto max-w-md animate-fade-in">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">Point Scanner</CardTitle>
          <CardDescription className="text-center">
            Scan QR codes or enter phone numbers to add or redeem points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="scan">
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR
              </TabsTrigger>
              <TabsTrigger value="phone">
                <UserCircle className="mr-2 h-4 w-4" />
                Phone Lookup
              </TabsTrigger>
            </TabsList>

            {/* Scan QR Content */}
            <TabsContent value="scan" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
              <div className="flex flex-col items-center space-y-4">
                {/* QR Scanner Camera View */}
                <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                  {isCameraActive ? (
                    <>
                      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted />
                      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: "none" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 border-2 border-primary rounded-lg border-opacity-50"></div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Scan className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                <Button className="w-full" onClick={handleScan}>
                  <Scan className="mr-2 h-4 w-4" />
                  Scan QR Code
                </Button>

                <p className="text-sm text-muted-foreground text-center">Position the QR code within the scanning area</p>

                {/* Drag and Drop Area */}
                <div
                  className={`w-full p-4 text-center border-2 border-dashed rounded-lg transition ${dragOver ? "border-primary bg-muted" : "border-muted"}`}
                >
                  <p className="text-sm text-muted-foreground">Or drag and drop a QR code image here</p>
                </div>
              </div>
            </TabsContent>

            {/* Phone Lookup */}
            <TabsContent value="phone">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter customer's phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={handleLookup}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Look Up Customer
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Customer Details and Transaction Form */}
      {customer && (
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Customer Found</CardTitle>
            <CardDescription>Manage points for this customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                  <UserCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.phone}</div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Current Points</div>
                <div className="text-2xl font-bold">{customer.totalPoints}</div>
              </div>

              {customer.qrCode && (
                <div className="flex flex-col items-center">
                  <img src={`data:image/png;base64,${customer.qrCode}`} alt="Customer QR Code" className="w-32 h-32 border rounded mb-2" />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `data:image/png;base64,${customer.qrCode}`;
                      link.download = `${customer.name}_qr.png`;
                      link.click();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              )}

              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="points">Points to {transactionType === "add" ? "Add" : "Redeem"}</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setTransactionType("add")}
                      disabled={transactionType === "add"}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setTransactionType("redeem")}
                      disabled={transactionType === "redeem"}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Input
                  id="points"
                  type="number"
                  value={pointsValue}
                  onChange={(e) => setPointsValue(e.target.value)}
                  min="1"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetTransaction}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleConfirmTransaction}>
              {transactionType === "add" ? "Add Points" : "Redeem Points"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>
              Please review the details before confirming
            </DialogDescription>
          </DialogHeader>

          {customer && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-muted-foreground">Customer</div>
                <div className="font-medium">{customer.name}</div>

                <div className="text-sm text-muted-foreground">Transaction Type</div>
                <div className="font-medium capitalize">{transactionType} Points</div>

                <div className="text-sm text-muted-foreground">Points Amount</div>
                <div className="font-medium">{pointsValue}</div>

                {/* <div className="text-sm text-muted-foreground">Current Points</div>
                <div className="font-medium">{customer.totalPoints}</div>

                <div className="text-sm text-muted-foreground">New Balance</div>
                <div className="font-bold">
                  {transactionType === "add"
                    ? customer.totalPoints + parseInt(pointsValue)
                    : customer.totalPoints - parseInt(pointsValue)}
                </div> */}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processTransaction}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="py-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-4">
              <Check className="h-6 w-6" />
            </div>
            <DialogTitle className="mb-2">Transaction Complete</DialogTitle>
            <DialogDescription>
              {transactionType === "add"
                ? `${pointsValue} points have been added`
                : `${pointsValue} points have been redeemed`}
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScannerApp;
