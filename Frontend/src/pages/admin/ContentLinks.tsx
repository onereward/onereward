
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Check,
  X
} from "lucide-react";

interface ContentLink {
  id: string;
  title: string;
  url: string;
  description: string | null;
  restaurant_id: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface Restaurant {
  id: string;
  name: string;
}

const ContentLinks = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<ContentLink[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [currentLink, setCurrentLink] = useState<ContentLink | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    restaurant_id: "",
    is_public: false
  });
  
  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  // Fetch content links and restaurants
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch content links - using any to bypass type issue
        const { data: linkData, error: linkError } = await (supabase
          .from('content_links') as any)
          .select(`
            id,
            title,
            url,
            description,
            restaurant_id,
            is_public,
            created_at,
            updated_at
          `)
          .order('created_at', { ascending: false });
        
        if (linkError) throw linkError;
        
        // Fetch restaurants for dropdown
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name')
          .order('name');
        
        if (restaurantError) throw restaurantError;
        
        setLinks(linkData || []);
        setRestaurants(restaurantData || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load content links. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Get restaurant name by ID
  const getRestaurantName = (id: string | null) => {
    if (!id) return "—";
    const restaurant = restaurants.find(r => r.id === id);
    return restaurant ? restaurant.name : "Unknown Restaurant";
  };

  // Open dialog for creating/editing a link
  const openLinkDialog = (link?: ContentLink) => {
    if (link) {
      // Edit existing link
      setCurrentLink(link);
      setFormData({
        title: link.title,
        url: link.url,
        description: link.description || "",
        restaurant_id: link.restaurant_id || "",
        is_public: link.is_public
      });
    } else {
      // Create new link
      setCurrentLink(null);
      setFormData({
        title: "",
        url: "",
        description: "",
        restaurant_id: "",
        is_public: false
      });
    }
    setShowDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch change for is_public
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_public: checked }));
  };
  
  // Handle restaurant select change
  const handleRestaurantChange = (value: string) => {
    setFormData(prev => ({ ...prev, restaurant_id: value }));
  };

  // Submit form to create/update link
  const handleSubmit = async () => {
    try {
      if (!formData.title.trim() || !formData.url.trim()) {
        toast({
          title: "Validation Error",
          description: "Title and URL are required fields.",
          variant: "destructive",
        });
        return;
      }
      
      // Ensure URL has protocol
      let url = formData.url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      if (currentLink) {
        // Update existing link
        const { error } = await (supabase
          .from('content_links') as any)
          .update({
            title: formData.title,
            url: url,
            description: formData.description || null,
            restaurant_id: formData.restaurant_id || null,
            is_public: formData.is_public,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentLink.id);
        
        if (error) throw error;
        
        // Update local state
        setLinks(links.map(link => 
          link.id === currentLink.id 
            ? { 
                ...link, 
                title: formData.title,
                url: url,
                description: formData.description || null,
                restaurant_id: formData.restaurant_id || null,
                is_public: formData.is_public,
                updated_at: new Date().toISOString()
              } 
            : link
        ));
        
        toast({
          title: "Success",
          description: "Content link updated successfully."
        });
      } else {
        // Create new link
        const { data, error } = await (supabase
          .from('content_links') as any)
          .insert({
            title: formData.title,
            url: url,
            description: formData.description || null,
            restaurant_id: formData.restaurant_id || null,
            is_public: formData.is_public
          })
          .select();
        
        if (error) throw error;
        
        // Update local state
        if (data && data.length > 0) {
          setLinks([data[0], ...links]);
        }
        
        toast({
          title: "Success",
          description: "Content link created successfully."
        });
      }
      
      // Close dialog
      setShowDialog(false);
    } catch (error) {
      console.error("Error saving content link:", error);
      toast({
        title: "Error",
        description: "Failed to save content link. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Open delete confirmation dialog
  const confirmDelete = (id: string) => {
    setLinkToDelete(id);
    setShowDeleteDialog(true);
  };

  // Delete a link
  const handleDelete = async () => {
    if (!linkToDelete) return;
    
    try {
      const { error } = await (supabase
        .from('content_links') as any)
        .delete()
        .eq('id', linkToDelete);
      
      if (error) throw error;
      
      // Update local state
      setLinks(links.filter(link => link.id !== linkToDelete));
      
      toast({
        title: "Success",
        description: "Content link deleted successfully."
      });
      
      setShowDeleteDialog(false);
      setLinkToDelete(null);
    } catch (error) {
      console.error("Error deleting content link:", error);
      toast({
        title: "Error",
        description: "Failed to delete content link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Links</h2>
          <p className="text-muted-foreground">
            Manage content links for the customer app
          </p>
        </div>
        <Button onClick={() => openLinkDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Link
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading content links...</span>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Public</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No content links found. Add your first one!
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.title}</TableCell>
                    <TableCell>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center hover:underline text-blue-600 dark:text-blue-400"
                      >
                        {link.url.length > 30 ? link.url.substring(0, 30) + '...' : link.url}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>{getRestaurantName(link.restaurant_id)}</TableCell>
                    <TableCell>
                      {link.is_public ? (
                        <div className="flex items-center">
                          <Check className="mr-1 h-4 w-4 text-green-600" />
                          <span className="text-green-600">Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <X className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">No</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openLinkDialog(link)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => confirmDelete(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{currentLink ? "Edit Content Link" : "Create New Content Link"}</DialogTitle>
            <DialogDescription>
              {currentLink 
                ? "Update the details of this content link" 
                : "Add a new content link to promote in the customer app"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter link title"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">URL</Label>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description (optional)"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restaurant" className="text-right">Restaurant</Label>
              <Select
                value={formData.restaurant_id}
                onValueChange={handleRestaurantChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a restaurant (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (General link)</SelectItem>
                  {restaurants.map(restaurant => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isPublic" className="text-right">Public</Label>
              <div className="flex items-center gap-2 col-span-3">
                <Switch
                  id="isPublic"
                  checked={formData.is_public}
                  onCheckedChange={handleSwitchChange}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.is_public 
                    ? "This link will be visible to all users" 
                    : "This link will only be visible to admin users"
                  }
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {currentLink ? "Save Changes" : "Create Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this content link? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentLinks;
