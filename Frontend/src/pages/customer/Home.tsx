import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";

// Sample API URL (adjust as necessary)
const API_URL = "/api"; // Replace with your actual API base URL

const CustomerHome = () => {
  const [topSliders, setTopSliders] = useState([]);
  const [bottomSliders, setBottomSliders] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [topCurrentSlide, setTopCurrentSlide] = useState(0);
  const [bottomCurrentSlide, setBottomCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  const topSliderRef = useRef<HTMLDivElement>(null);
  const bottomSliderRef = useRef<HTMLDivElement>(null);

  // Fetch data for sliders and featured restaurants
  const fetchData = async () => {
    try {
      const [topSlidersResponse, bottomSlidersResponse, featuredRestaurantsResponse] = await Promise.all([
        axios.get(`${API_URL}/top-sliders`),
        axios.get(`${API_URL}/bottom-sliders`),
        axios.get(`${API_URL}/featured-restaurants`),
      ]);
      
      setTopSliders(topSlidersResponse.data);
      setBottomSliders(bottomSlidersResponse.data);
      setFeaturedRestaurants(featuredRestaurantsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();

    const topInterval = setInterval(() => {
      setTopCurrentSlide((prevSlide) => (prevSlide + 1) % topSliders.length);
    }, 5000);

    const bottomInterval = setInterval(() => {
      setBottomCurrentSlide((prevSlide) => (prevSlide + 1) % bottomSliders.length);
    }, 5000);

    return () => {
      clearInterval(topInterval);
      clearInterval(bottomInterval);
    };
  }, [topSliders.length, bottomSliders.length]);

  useEffect(() => {
    if (topSliderRef.current) {
      topSliderRef.current.scrollTo({
        left: topCurrentSlide * topSliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  }, [topCurrentSlide]);

  useEffect(() => {
    if (bottomSliderRef.current) {
      bottomSliderRef.current.scrollTo({
        left: bottomCurrentSlide * bottomSliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  }, [bottomCurrentSlide]);

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [imageUrl]: true,
    }));
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Top Sliders */}
      <div className="relative">
        <div
          ref={topSliderRef}
          className="flex overflow-x-hidden snap-x snap-mandatory touch-pan-x"
        >
          {topSliders.map((slider, index) => (
            <div
              key={slider.id}
              className="w-full flex-shrink-0 snap-center"
            >
             <div className="relative aspect-[21/9] overflow-hidden rounded-lg">
                <div className={`absolute inset-0 bg-muted ${loadedImages[slider.image] ? "opacity-0" : "opacity-100"}`}></div>
                <img
                  src={slider.image}
                  alt={slider.title}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(slider.image)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-white font-medium text-lg">{slider.title}</h3>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Slider indicators */}
        <div className="absolute bottom-3 right-4 flex space-x-1">
          {topSliders.map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === topCurrentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50"
              }`}
              onClick={() => setTopCurrentSlide(index)}
            ></button>
          ))}
        </div>
      </div>

      {/* Featured Restaurants */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Featured Restaurants</h2>
          <Link
            to="/customer/cards"
            className="flex items-center text-primary text-sm font-medium"
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {featuredRestaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/customer/cards/${restaurant.id}`}
              className="block group hover-scale"
            >
              <div className="rounded-lg overflow-hidden glass-card border bg-card">
                <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                  <div
                    className={`absolute inset-0 bg-muted  ${
                      loadedImages[restaurant.image] ? "opacity-0" : "opacity-100"
                    } transition-opacity duration-300`}
                  ></div>
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                      loadedImages[restaurant.image] ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => handleImageLoad(restaurant.image)}
                  />
                </div>
                <div className="p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    {restaurant.category}
                  </div>
                  <div className="font-medium leading-tight text-sm mb-2 line-clamp-1">
                    {restaurant.name}
                  </div>
                  <div className="flex items-center text-xs">
                    <Store className="h-3 w-3 mr-1 text-primary" />
                    <span className="text-muted-foreground">
                      {restaurant.points} points
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Sliders */}
      <div className="relative mt-6">
        <div
          ref={bottomSliderRef}
          className="flex overflow-x-hidden snap-x snap-mandatory touch-pan-x"
        >
          {bottomSliders.map((slider, index) => (
            <div
              key={slider.id}
              className="w-full flex-shrink-0 snap-center"
            >
             <div className="relative aspect-[21/9] overflow-hidden rounded-lg">
              <div className={`absolute inset-0 bg-muted ${loadedImages[slider.image] ? "opacity-0" : "opacity-100"}`}></div>
              <img
                src={slider.image}
                alt={slider.title}
                className="w-full h-full object-cover"
                onLoad={() => handleImageLoad(slider.image)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-white font-medium text-lg">{slider.title}</h3>
              </div>
            </div>

            </div>
          ))}
        </div>

        {/* Slider indicators */}
        <div className="absolute bottom-3 right-4 flex space-x-1">
          {bottomSliders.map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === bottomCurrentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50"
              }`}
              onClick={() => setBottomCurrentSlide(index)}
            ></button>
          ))}
        </div>
      </div>

      {/* Start earning button */}
      <div className="text-center mt-8">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 pb-6">
            <h3 className="text-lg font-medium mb-2">
              Start earning rewards today!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Visit any of our partner restaurants and scan your QR code
            </p>
            <Button asChild>
              <Link to="/customer/cards">View My Cards</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerHome;
