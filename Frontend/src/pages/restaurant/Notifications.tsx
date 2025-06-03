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
import { Textarea } from "@/components/ui/textarea";

const Notifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]); // Ensure initial value is an array
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // Form state for adding new customer
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    createdBy: ""
  });

  // Fetch customer data from the backend when the component mounts
  useEffect(() => {
    // Get restaurant name from localStorage
    const user = localStorage.getItem("user");
    const restaurantName = user ? JSON.parse(user).name || "" : "";
    const email = user ? JSON.parse(user).email : null;
    
    if(email) {
        setFormData({
            title: formData.title,
            body: formData.body,
            createdBy: email
        });

        fetch(`/api/notifications?createdby=${encodeURIComponent(email)}`)
      .then((response) => response.json())
        .then((data) => {
            // If data is empty, use mock data
            if (data.length === 0) {
                setNotifications([]);
            } else {
                setNotifications(data);
            }
        })
    } else {
        setNotifications([]);
    }
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredCustomers = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddNotification = (e: React.FormEvent) => {
    e.preventDefault();

    // Add customer data to the backend
    axios
      .post("/api/notifications", formData)
      .then((response) => {
        setNotifications([...notifications, response.data.notification]);
        setDialogOpen(false);
        setFormData({
          title: "",
          body: "",
          createdBy: formData.createdBy
        });

        toast({
          title: "Notification sent",
          description: `${formData.title} has been successfully sent.`,
        });
      })
      .catch((error) => {
        console.error("Error sending notification:", error);
        toast({
          title: "Error",
          description: "There was an error sending the notification.",
        });
      });
  };

  const viewNotificationDetails = (notification: any) => {
    if (!notification._id) {
      console.error("Notification ID is missing.");
      toast({
        title: "Error",
        description: "Notification data is incomplete, unable to view details.",
      });
      return;
    }

    setSelectedNotification(notification);
    setNotificationDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Manage your notifications to engage with your customers effectively.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Notification
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <CardTitle>Notifications Management</CardTitle>
              <CardDescription>
                View and manage your notifications
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search notifications..."
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
                <TableHead>Title</TableHead>
                <TableHead>Body</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No notifications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((notification) => (
                  <TableRow key={notification._id} className="group">
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>{notification.body}</TableCell>
                    <TableCell>
                      {new Date(notification.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
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
                            onClick={() => viewNotificationDetails(notification)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
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
            <DialogTitle>New Notification</DialogTitle>
            <DialogDescription>
              Send a new notification to your customers.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNotification}>
            <div className="grid gap-4 py-4">
              <div className="grid items-center gap-4">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter notification title here..."
                  required
                />
              </div>
              <div className="grid items-center gap-4">
                <Label htmlFor="body">Body</Label>
                <Textarea 
                  id="body"
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  placeholder="Enter notification message here..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Send Notification</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      {selectedNotification && (
        <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedNotification.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Gift className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedNotification.name}</h3>
                  <p className="text-muted-foreground">{selectedNotification.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium mt-1">{selectedNotification.phone}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Join Date</div>
                  <div className="font-medium mt-1">{selectedNotification.joinDate}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Total Points</div>
                  <div className="font-medium mt-1">{selectedNotification.totalPoints}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium mt-1 capitalize">{selectedNotification.status}</div>
                </div>
              </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setNotificationDialogOpen(false)}>
                    Close
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

export default Notifications;
