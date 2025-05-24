import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GripVertical, Plus, Trash2, Upload, Image, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Sample API URL (adjust as necessary)
const API_URL = "/api"; // Replace with your actual API base URL

const AdminSliders = () => {
  const [topSliders, setTopSliders] = useState([]);
  const [bottomSliders, setBottomSliders] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const { toast } = useToast();

  // Dialog states
  const [openSliderDialog, setOpenSliderDialog] = useState(false);
  const [openRestaurantDialog, setOpenRestaurantDialog] = useState(false);
  const [currentSlider, setCurrentSlider] = useState(null);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [sliderType, setSliderType] = useState<'top' | 'bottom' | 'featured'>('top');
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [sliderFormData, setSliderFormData] = useState({ title: "", image: "", type: "top" });  // Add 'type' field to form state
  const [restaurantFormData, setRestaurantFormData] = useState({ name: "", image: "" });

  // Fetch data for the selected slider type
  const fetchSliders = async (type: 'top' | 'bottom') => {
    try {
      const response = await axios.get(`${API_URL}/${type}-sliders`);
      if (type === 'top') {
        setTopSliders(response.data);
      } else {
        setBottomSliders(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data from the server",
        variant: "destructive",
      });
    }
  };

  // Fetch featured restaurants
  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${API_URL}/featured-restaurants`);
      setFeaturedRestaurants(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch restaurants",
        variant: "destructive",
      });
    }
  };

  // Trigger fetch based on the selected tab
  useEffect(() => {
    if (sliderType === 'top') {
      fetchSliders('top');
    } else if (sliderType === 'bottom') {
      fetchSliders('bottom');
    }
    if (sliderType === 'featured') {
      fetchRestaurants();
    }
  }, [sliderType]);

  // Add and edit slider functions
  const openAddSliderDialog = (type: 'top' | 'bottom') => {
    setSliderType(type);
    setCurrentSlider(null);
    setSliderFormData({ title: "", image: "", type });  // Pass the 'type' when opening dialog
    setOpenSliderDialog(true);
  };

  const openEditSliderDialog = (slider, type: 'top' | 'bottom') => {
    setSliderType(type);
    setCurrentSlider(slider);
    setSliderFormData({ title: slider.title, image: slider.image, type: slider.type });
    setOpenSliderDialog(true);
  };

  const handleSliderInputChange = (e) => {
    const { name, value } = e.target;
    setSliderFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderSubmit = async () => {
    if (sliderType === 'top') {
      if (currentSlider) {
        try {
          const updatedSlider = await axios.put(`${API_URL}/slider/${currentSlider._id}`, sliderFormData);
          setTopSliders((prev) => prev.map((slider) => (slider._id === currentSlider._id ? updatedSlider.data : slider)));
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to update slider",
            variant: "destructive",
          });
        }
      } else {
        try {
          const newSlider = await axios.post(`${API_URL}/slider`, sliderFormData);
          setTopSliders((prev) => [...prev, newSlider.data]);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to add new slider",
            variant: "destructive",
          });
        }
      }
    } else {
      if (currentSlider) {
        try {
          const updatedSlider = await axios.put(`${API_URL}/slider/${currentSlider._id}`, sliderFormData);
          setBottomSliders((prev) => prev.map((slider) => (slider._id === currentSlider._id ? updatedSlider.data : slider)));
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to update bottom slider",
            variant: "destructive",
          });
        }
      } else {
        try {
          const newSlider = await axios.post(`${API_URL}/slider`, sliderFormData);
          setBottomSliders((prev) => [...prev, newSlider.data]);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to add new bottom slider",
            variant: "destructive",
          });
        }
      }
    }
    setOpenSliderDialog(false);
    setHasChanges(true);
    toast({
      title: "Success",
      description: currentSlider ? "Slider updated successfully" : "New slider added successfully",
    });
  };

  // Add and edit restaurant functions
  const openAddRestaurantDialog = () => {
    setCurrentRestaurant(null);
    setRestaurantFormData({ name: "", image: "" });
    setOpenRestaurantDialog(true);
  };

  const openEditRestaurantDialog = (restaurant) => {
    setCurrentRestaurant(restaurant);
    setRestaurantFormData({ name: restaurant.name, image: restaurant.image });
    setOpenRestaurantDialog(true);
  };

  const handleRestaurantInputChange = (e) => {
    const { name, value } = e.target;
    setRestaurantFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRestaurantSubmit = async () => {
    if (currentRestaurant) {
      try {
        const updatedRestaurant = await axios.put(`${API_URL}/admin/restaurant/${currentRestaurant._id}`, restaurantFormData);
        setFeaturedRestaurants((prev) => prev.map((restaurant) => (restaurant._id === currentRestaurant._id ? updatedRestaurant.data : restaurant)));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update restaurant",
          variant: "destructive",
        });
      }
    } else {
      try {
        const newRestaurant = await axios.post(`${API_URL}/admin/restaurant`, restaurantFormData);
        setFeaturedRestaurants((prev) => [...prev, newRestaurant.data]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add new restaurant",
          variant: "destructive",
        });
      }
    }
    setOpenRestaurantDialog(false);
    setHasChanges(true);
    toast({
      title: "Success",
      description: currentRestaurant ? "Restaurant updated successfully" : "New restaurant added successfully",
    });
  };

  // Delete slider and restaurant
  const handleDelete = async (id, type) => {
    try {
      if (type === 'top') {
        await axios.delete(`${API_URL}/slider/${id}`);
        setTopSliders((prev) => prev.filter((slider) => slider._id !== id));
      } else if (type === 'bottom') {
        await axios.delete(`${API_URL}/slider/${id}`);
        setBottomSliders((prev) => prev.filter((slider) => slider._id !== id));
      } else if (type === 'restaurant') {
        await axios.delete(`${API_URL}/admin/restaurant/${id}`);
        setFeaturedRestaurants((prev) => prev.filter((restaurant) => restaurant._id !== id));
      }
      setHasChanges(true);
      toast({
        title: "Deleted",
        description: "Item has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="top-sliders">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="top-sliders" onClick={() => setSliderType('top')}>Top Sliders</TabsTrigger>
          <TabsTrigger value="featured" onClick={() => setSliderType('featured')}>Featured Restaurants</TabsTrigger>
          <TabsTrigger value="bottom-sliders" onClick={() => setSliderType('bottom')}>Bottom Sliders</TabsTrigger>
        </TabsList>

        {/* Top Sliders Tab */}
        <TabsContent value="top-sliders">
          <Card>
            <CardHeader>
              <CardTitle>Top Sliders</CardTitle>
              <CardDescription>Manage the top sliders that appear on the customer app home screen.</CardDescription>
            </CardHeader>
            <CardContent>
              {topSliders.map((slider) => (
                <div key={slider._id}>
                  <div className="flex items-center gap-4 p-3 border rounded-md">
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="w-20 h-12 bg-muted rounded-md overflow-hidden">
                        {slider.image ? (
                          <img src={slider.image} alt={slider.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input value={slider.title} onChange={(e) => { slider.title = e.target.value; setHasChanges(true); }} placeholder="Slider title" className="w-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditSliderDialog(slider, 'top')}>
                          <Upload className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(slider._id, 'top')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => openAddSliderDialog('top')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Slider
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Restaurants Tab */}
        <TabsContent value="featured">
          <Card>
            <CardHeader>
              <CardTitle>Featured Restaurants</CardTitle>
              <CardDescription>Select up to 6 restaurants to highlight on the customer app home screen.</CardDescription>
            </CardHeader>
            <CardContent>
              {featuredRestaurants.map((restaurant) => (
                <div key={restaurant._id}>
                  <div className="flex items-center gap-4 p-3 border rounded-md">
                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden">
                      {restaurant.image ? (
                        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{restaurant.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditRestaurantDialog(restaurant)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(restaurant._id, 'restaurant')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={openAddRestaurantDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bottom Sliders Tab */}
        <TabsContent value="bottom-sliders">
          <Card>
            <CardHeader>
              <CardTitle>Bottom Sliders</CardTitle>
              <CardDescription>Manage the bottom sliders that appear on the customer app home screen.</CardDescription>
            </CardHeader>
            <CardContent>
              {bottomSliders.map((slider) => (
                <div key={slider._id}>
                  <div className="flex items-center gap-4 p-3 border rounded-md">
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="w-20 h-12 bg-muted rounded-md overflow-hidden">
                        {slider.image ? (
                          <img src={slider.image} alt={slider.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input value={slider.title} onChange={(e) => { slider.title = e.target.value; setHasChanges(true); }} placeholder="Slider title" className="w-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditSliderDialog(slider, 'bottom')}>
                          <Upload className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(slider._id, 'bottom')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => openAddSliderDialog('bottom')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Slider
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Slider Dialog */}
      <Dialog open={openSliderDialog} onOpenChange={setOpenSliderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentSlider ? "Edit Slider" : "Add New Slider"}</DialogTitle>
            <DialogDescription>
              {currentSlider ? "Update the slider details below" : "Add a new slider to the customer app"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slider-title" className="text-right">
                Title
              </Label>
              <Input
                id="slider-title"
                name="title"
                placeholder="Slider title"
                className="col-span-3"
                value={sliderFormData.title}
                onChange={handleSliderInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slider-image" className="text-right">
                Image URL
              </Label>
              <Input
                id="slider-image"
                name="image"
                placeholder="https://example.com/image.jpg"
                className="col-span-3"
                value={sliderFormData.image}
                onChange={handleSliderInputChange}
              />
            </div>
            {sliderFormData.image && (
              <div className="p-2 border rounded mt-2">
                <p className="text-sm text-muted-foreground mb-2">Image Preview:</p>
                <div className="w-full h-32 bg-muted rounded overflow-hidden">
                  <img 
                    src={sliderFormData.image} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x300/gray/white?text=Invalid+Image+URL";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenSliderDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSliderSubmit}>
              {currentSlider ? "Save Changes" : "Add Slider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restaurant Dialog */}
      <Dialog open={openRestaurantDialog} onOpenChange={setOpenRestaurantDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentRestaurant ? "Edit Restaurant" : "Add Featured Restaurant"}</DialogTitle>
            <DialogDescription>
              {currentRestaurant ? "Update the restaurant details below" : "Add a new restaurant to the featured section"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restaurant-name" className="text-right">
                Name
              </Label>
              <Input
                id="restaurant-name"
                name="name"
                placeholder="Restaurant name"
                className="col-span-3"
                value={restaurantFormData.name}
                onChange={handleRestaurantInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restaurant-image" className="text-right">
                Image URL
              </Label>
              <Input
                id="restaurant-image"
                name="image"
                placeholder="https://example.com/image.jpg"
                className="col-span-3"
                value={restaurantFormData.image}
                onChange={handleRestaurantInputChange}
              />
            </div>
            {restaurantFormData.image && (
              <div className="p-2 border rounded mt-2">
                <p className="text-sm text-muted-foreground mb-2">Image Preview:</p>
                <div className="w-full h-32 bg-muted rounded overflow-hidden">
                  <img 
                    src={restaurantFormData.image} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/300x200/gray/white?text=Invalid+Image+URL";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenRestaurantDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleRestaurantSubmit}>
              {currentRestaurant ? "Save Changes" : "Add Restaurant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSliders;
