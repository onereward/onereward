import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Plus,
  Edit,
  Trash,
  Gift,
  Calendar,
} from "lucide-react";

interface Offer {
  _id: number;
  title: string;
  description: string;
  pointsRequired: number;
  active: boolean;
  expiryDate?: string;
  restaurantName: string;
}

const RestaurantPoints = () => {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    pointsRequired: 100,
    active: true,
    expiryDate: "",
    restaurantName: "",
  });

  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);

  useEffect(() => {
    axios
      .get("/api/offers")
      .then((response) => setOffers(response.data))
      .catch((error) => console.error("Error fetching offers:", error));
  }, []);

  const handleOfferFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOfferForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOfferSwitchChange = (checked: boolean) => {
    setOfferForm((prev) => ({
      ...prev,
      active: checked,
    }));
  };

  const handleOfferSubmit = () => {
    if (
      offerForm.title.trim() === "" ||
      offerForm.description.trim() === "" ||
      offerForm.restaurantName.trim() === ""
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const offerData = {
      title: offerForm.title,
      description: offerForm.description,
      pointsRequired: offerForm.pointsRequired,
      active: offerForm.active,
      expiryDate: offerForm.expiryDate || undefined,
      restaurantName: offerForm.restaurantName,
    };

    if (currentOffer) {
      axios
        .put(`/api/offers/${currentOffer._id}`, offerData)
        .then((response) => {
          const updatedOffers = offers.map((offer) =>
            offer._id === currentOffer._id ? response.data : offer
          );
          setOffers(updatedOffers);
          toast({
            title: "Offer updated",
            description: "The offer has been updated successfully",
          });
        })
        .catch((error) => {
          console.error("Error updating offer:", error);
          toast({
            title: "Error",
            description: "Failed to update the offer.",
            variant: "destructive",
          });
        });
    } else {
      axios
        .post("/api/offers", offerData)
        .then((response) => {
          setOffers([...offers, response.data]);
          toast({
            title: "Offer created",
            description: "New offer has been created successfully",
          });
        })
        .catch((error) => {
          console.error("Error creating offer:", error);
          toast({
            title: "Error",
            description: "Failed to create the offer.",
            variant: "destructive",
          });
        });
    }

    setOfferDialogOpen(false);
  };

  const openAddOfferDialog = () => {
    const user = localStorage.getItem("user");
    const restaurantName = user ? JSON.parse(user).name || "" : "";

    setCurrentOffer(null);
    setOfferForm({
      title: "",
      description: "",
      pointsRequired: 100,
      active: true,
      expiryDate: "",
      restaurantName,
    });
    setOfferDialogOpen(true);
  };

  const openEditOfferDialog = (offer: Offer) => {
    setCurrentOffer(offer);
    setOfferForm({
      title: offer.title,
      description: offer.description,
      pointsRequired: offer.pointsRequired,
      active: offer.active,
      expiryDate: offer.expiryDate || "",
      restaurantName: offer.restaurantName,
    });
    setOfferDialogOpen(true);
  };

  const confirmDelete = (_id: number) => {
    axios
      .delete(`/api/offers/${_id}`)
      .then(() => {
        setOffers(offers.filter((offer) => offer._id !== _id));
        toast({
          title: "Offer deleted",
          description: "The offer has been deleted successfully",
        });
      })
      .catch((error) => {
        console.error("Error deleting offer:", error);
        toast({
          title: "Error",
          description: "Failed to delete the offer.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Points Management</h2>
          <p className="text-muted-foreground">
            Configure offers and points rules for your loyalty program
          </p>
        </div>
      </div>

      <Tabs defaultValue="offers">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="offers">Offers & Rewards</TabsTrigger>
          <TabsTrigger value="rules">Points Rules</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Offers & Rewards</CardTitle>
                <CardDescription>
                  Create and manage rewards that customers can redeem with points
                </CardDescription>
              </div>
              <Button onClick={openAddOfferDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Offer
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No offers created yet</p>
                    <Button variant="outline" className="mt-4" onClick={openAddOfferDialog}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create your first offer
                    </Button>
                  </div>
                ) : (
                  offers.map((offer) => (
                    <Card
                      key={offer._id}
                      className={offer.active ? "border-primary/20" : "border-muted opacity-70"}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{offer.title}</h3>
                              {!offer.active && (
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {offer.description}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <CreditCard className="h-3.5 w-3.5 mr-1 text-primary/70" />
                                <span>{offer.pointsRequired} points</span>
                              </div>
                              {offer.expiryDate && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5 mr-1 text-primary/70" />
                                  <span>
                                    Expires:{" "}
                                    {new Date(offer.expiryDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 self-end sm:self-auto">
                            <Button variant="outline" size="sm" onClick={() => openEditOfferDialog(offer)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => confirmDelete(offer._id)}>
                              <Trash className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for Offer Create/Edit */}
      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentOffer ? "Edit Offer" : "Create New Offer"}</DialogTitle>
            <DialogDescription>
              {currentOffer
                ? "Modify the details of this reward offer"
                : "Create a new reward that customers can redeem with points"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="offer-title">Offer Title</Label>
              <Input
                id="offer-title"
                name="title"
                placeholder="e.g., Free Dessert"
                value={offerForm.title}
                onChange={handleOfferFormChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="offer-description">Description</Label>
              <Textarea
                id="offer-description"
                name="description"
                placeholder="Describe what customers will receive with this offer"
                value={offerForm.description}
                onChange={handleOfferFormChange}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="points-required">Points Required</Label>
              <Input
                id="points-required"
                name="pointsRequired"
                type="number"
                min={1}
                value={offerForm.pointsRequired}
                onChange={handleOfferFormChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expiry-date">Expiry Date (Optional)</Label>
              <Input
                id="expiry-date"
                name="expiryDate"
                type="date"
                value={offerForm.expiryDate}
                onChange={handleOfferFormChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="restaurant-name">Restaurant Name</Label>
              <Input
                id="restaurant-name"
                name="restaurantName"
                value={offerForm.restaurantName}
                onChange={handleOfferFormChange}
                readOnly
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="offer-active"
                checked={offerForm.active}
                onCheckedChange={handleOfferSwitchChange}
              />
              <Label htmlFor="offer-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOfferSubmit}>
              {currentOffer ? "Save Changes" : "Create Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantPoints;
