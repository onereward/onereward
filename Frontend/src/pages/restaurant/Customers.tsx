import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User, MoreVertical, Eye, Gift, Plus } from "lucide-react"; // Ensure correct import of Plus icon
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

const RestaurantCustomers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]); // Ensure initial value is an array
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Form state for adding new customer
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Fetch customer data from the backend when the component mounts
  useEffect(() => {
    axios
      .get("/api/customers")
      .then((response) => {
        // Ensure the response is an array
        if (Array.isArray(response.data)) {
          setCustomers(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          toast({
            title: "Error",
            description: "Invalid customer data format.",
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: "An error occurred while fetching customers.",
        });
      });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();

    // Add customer data to the backend
    axios
      .post("/api/customers", formData)
      .then((response) => {
        setCustomers([...customers, response.data.customer]);
        setDialogOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
        });

        toast({
          title: "Customer added",
          description: `${formData.name} has been successfully added.`,
        });
      })
      .catch((error) => {
        console.error("Error adding customer:", error);
        toast({
          title: "Error",
          description: "There was an error adding the customer.",
        });
      });
  };

  const viewCustomerDetails = (customer: any) => {
    if (!customer._id) {
      console.error("Customer ID is missing.");
      toast({
        title: "Error",
        description: "Customer data is incomplete, unable to view details.",
      });
      return;
    }

    setSelectedCustomer(customer);
    setCustomerDialogOpen(true);
  };

  const handleSendReward = (customer: any) => {
    if (!customer._id) {
      console.error("Customer ID is missing.");
      toast({
        title: "Error",
        description: "Customer ID is missing, unable to send reward.",
      });
      return;
    }

    axios
      .post(`/api/customers/reward/${customer._id}`)
      .then((response) => {
        toast({
          title: "Reward sent",
          description: `A special reward has been sent to ${customer.name}.`,
        });
      })
      .catch((error) => {
        console.error("Error sending reward:", error);
        toast({
          title: "Error",
          description: "There was an error sending the reward.",
        });
      });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            Manage your loyalty program members
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                View and manage your loyal customers
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer._id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div>{customer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.joinDate}</TableCell>
                    <TableCell className="font-medium">{customer.totalPoints}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="max-w-xs">
                          <DropdownMenuItem
                            onClick={() => viewCustomerDetails(customer)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSendReward(customer)}
                          >
                            <Gift className="mr-2 h-4 w-4" />
                            Send Reward
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your loyalty program
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCustomer}>
            <div className="grid gap-4 py-4">
              <div className="grid items-center gap-4">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid items-center gap-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid items-center gap-4">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Customer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedCustomer.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Gift className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                  <p className="text-muted-foreground">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium mt-1">{selectedCustomer.phone}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Join Date</div>
                  <div className="font-medium mt-1">{selectedCustomer.joinDate}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Total Points</div>
                  <div className="font-medium mt-1">{selectedCustomer.totalPoints}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium mt-1 capitalize">{selectedCustomer.status}</div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleSendReward(selectedCustomer)}>
                <Gift className="mr-2 h-4 w-4" />
                Send Reward
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Label component for the form
const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
  );
};

export default RestaurantCustomers;
