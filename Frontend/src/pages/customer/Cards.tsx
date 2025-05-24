import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Store, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Predefined image pool
const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1599458252573-56ae36120de1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGZvb2R8ZW58MHx8MHx8fDA%3D",
  "https://plus.unsplash.com/premium_photo-1663036447682-8f0d918adbed?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmVzdGF1cmFudCUyMGZvb2R8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1556040220-4096d522378d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHJlc3RhdXJhbnQlMjBmb29kfGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1568376794508-ae52c6ab3929?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHJlc3RhdXJhbnQlMjBmb29kfGVufDB8fDB8fHww",
];

interface Restaurant {
  _id: string;
  name: string;
  email: string;
  status: string;
  join_date: string;
  image?: string;
  category?: string;
  points?: number;
  redemptionThreshold?: number;
}

const CustomerCards = () => {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});

  // Retrieve user data from localStorage and parse it
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.name;

  // Fetch restaurant data
  const fetchRestaurants = async () => {
    try {
      const { data } = await axios.get("/api/restaurants");
      const withImages = data.map((r: Restaurant) => ({
        ...r,
        image: IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)], // Random image from pool
        category: "Loyalty Partner", 
        points: userPoints[r.name] || 0, 
        redemptionThreshold: 1000, 
      }));
      setRestaurants(withImages);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    }
  };

  // Fetch user points from the API
  const fetchUserPoints = async () => {
    try {
      const { data } = await axios.get(`/api/user/${userId}/points`);
      setUserPoints(data);
    } catch (error) {
      console.error("Failed to fetch user points:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserPoints(); // Fetch user points on component mount
    }
  }, [userId]);

  useEffect(() => {
    if (userPoints) {
      fetchRestaurants(); // Fetch restaurant data after user points are fetched
    }
  }, [userPoints]);

  // Handle image loading for smooth transition
  const handleImageLoad = (url: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [url]: true,
    }));
  };

  // Filter restaurants based on search query
  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold mb-1 text-blue-600">My Loyalty Cards</h2>
        <p className="text-sm text-gray-600 mb-4">
          View and manage your points across all restaurants
        </p>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search restaurants..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium mb-1 text-gray-700">No cards found</h3>
          <p className="text-sm text-gray-500">
            Try adjusting your search or visit a restaurant to earn points.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((card) => (
            <Link key={card._id} to={`/customer/cards/${card._id}`}>
              <Card className="overflow-hidden bg-white shadow-lg rounded-xl transform transition duration-200 hover:scale-105 hover:shadow-2xl">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Image */}
                    <div className="relative w-24 h-24 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={card.image}
                        alt={card.name}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${
                          loadedImages[card.image || ""] ? "opacity-100" : "opacity-0"
                        }`}
                        onLoad={() => handleImageLoad(card.image || "")}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-indigo-600">{card.name}</h3>
                          <p className="text-xs text-gray-500">{card.category}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            Points: <span className="font-semibold text-green-600">{card.points}</span>
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 mt-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerCards;
