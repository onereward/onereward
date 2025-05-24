import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, ArrowLeft, Star, Gift, Clock, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const CustomerCardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [card, setCard] = useState<any | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null); // Store QR code URL
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rewards" | "history">("rewards");
  const [userRedemptions, setUserRedemptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // Step 1: Fetch restaurant details first
        const restaurantRes = await axios.get(`/api/restaurants/${id}`);
        const restaurant = restaurantRes.data;

        // Step 2: Fetch offers and redemptions in parallel
        const [offerRes, userRedeemRes, qrCodeRes] = await Promise.all([
          axios.get(`/by-restaurant/${id}`),
          axios.get(`/api/users/redeem-details`, {
            params: {
              email: user.email,
              restaurant: restaurant.name,
            },
          }),
          axios.get(`/api/user-qr/${user.email}`), // Fetch QR code for user
        ]);

        const offers = offerRes.data.offers;
        const redemptions = userRedeemRes.data.redemptions || [];
        const qrCodeUrl = qrCodeRes.data.qrCode || ""; // Assuming API returns the QR code URL

        setQrCode(qrCodeUrl); // Set the fetched QR code

        setUserRedemptions(redemptions);

        const redeemedDescriptions = redemptions.map((entry: any) => entry.description);

        const totalOfferPoints = offers.reduce(
          (acc: number, offer: any) => acc + offer.pointsRequired,
          0
        );

        const redeemedPoints = redemptions.reduce((acc: number, entry: any) => acc + entry.points, 0);
        const totalProgressPoints = (restaurant.points || 0) + redeemedPoints;

        const cardData = {
          id: id,
          name: restaurant.name,
          logo: restaurant.logo || "https://via.placeholder.com/80",
          category: restaurant.category || "General",
          points: restaurant.points || 0,
          redemptionThreshold: 1000,
          totalOfferPoints,
          rewards: offers.map((offer: any) => ({
            description: offer.title,
            points: offer.pointsRequired,
          })),
          redeemedDescriptions,
          redeemedPoints,
          totalProgressPoints,
        };

        setCard(cardData);
      } catch (error) {
        console.error("Error fetching card:", error);
        setCard(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardDetails();
  }, [id]);

  const handleRedeemReward = async (points: number, description: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (card && card.points && user?.email) {
      try {
        await axios.post("/api/users/redeem", {
          userEmail: user.email,
          restaurantName: card.name,
          points,
          description,
        });

        toast({
          title: "Reward Selected",
          description: `You've redeemed ${points} points for ${description}.`,
        });

        window.location.reload();
      } catch (err) {
        console.error("Redemption failed:", err);
        toast({
          title: "Error",
          description: "Failed to record redemption.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Not Enough Points",
        description: `You need ${points - (card?.points || 0)} more points to redeem this reward.`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-12">
        <div className="space-y-4 animate-pulse text-center">
          <div className="h-8 w-36 bg-muted mx-auto rounded"></div>
          <div className="h-20 w-full max-w-sm mx-auto bg-muted rounded"></div>
          <div className="h-40 w-full max-w-sm mx-auto bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-12 px-4 text-center">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Card Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The loyalty card you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/customer/cards">Back to My Cards</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link to="/customer/cards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-xl font-semibold">{card.name}</h2>
      </div>

      <Card className="overflow-hidden bg-primary text-primary-foreground shadow-lg">
        <CardHeader className="pb-2 pt-6">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{card.name}</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                {card.category}
              </CardDescription>
            </div>
            <div className="h-12 w-12 rounded-full bg-white p-1 overflow-hidden">
              <img
                src={card.logo}
                alt={card.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
        <div className="flex flex-col items-center justify-center py-4">

            {/* Conditionally render the QR code or the default icon */}
            {qrCode ? (
              <div className="bg-white p-2 rounded-lg shadow-inner mb-4">
                <img 
                  src={`data:image/png;base64,${qrCode}`}  // Display the QR code using base64 encoding
                  alt="User QR Code" 
                  className="h-40 w-40" 
                />
              </div>
            ) : (
              <div className="bg-white p-2 rounded-lg shadow-inner mb-4">
                <QrCode className="h-40 w-40 text-black" />
              </div>
            )}

            {/* Message below the QR code */}
            <p className="text-sm opacity-80 text-center">
              Scan this QR code at {card.name} to earn or redeem your loyalty points.
            </p>
          </div>


        </CardContent>
      </Card>

      <div className="border-b border-border flex">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "rewards"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("rewards")}
        >
          <Gift className="mr-1.5 h-4 w-4" /> Available Rewards
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("history")}
        >
          <Clock className="mr-1.5 h-4 w-4" /> Points History
        </button>
      </div>

      {activeTab === "rewards" && (
        <div className="space-y-4">
          {card.rewards.map((reward: any, i: number) => (
            <Card key={i} className={`overflow-hidden ${card.points >= reward.points ? "bg-card" : "bg-muted/50"}`}>
              <CardContent className="p-4 flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    card.points >= reward.points
                      ? "bg-primary/10 text-primary"
                      : "bg-muted-foreground/10 text-muted-foreground"
                  }`}>
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{reward.description}</h4>
                    <p className="text-sm text-muted-foreground">{reward.points} points required</p>
                  </div>
                </div>
                {card.redeemedDescriptions?.includes(reward.description) ? (
                  <Button disabled className="text-green-600 font-semibold cursor-not-allowed">
                    Redeemed
                  </Button>
                ) : (
                  <Button
                    variant={card.points >= reward.points ? "default" : "outline"}
                    disabled={card.points < reward.points}
                    onClick={() => handleRedeemReward(reward.points, reward.description)}
                  >
                    Redeem
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {userRedemptions.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No redemption history yet.</p>
          ) : (
            userRedemptions.map((item: any, i: number) => (
              <div key={i} className="flex items-start space-x-4 py-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                  <Minus className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">Points Redeemed</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">-{item.points}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.redeemedAt ? new Date(item.redeemedAt).toLocaleDateString() : "Date N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const Minus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M5 12h14" />
  </svg>
);

export default CustomerCardDetail;
