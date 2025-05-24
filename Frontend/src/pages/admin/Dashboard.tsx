
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalCustomers: 0,
    totalPoints: 0,
    redeemedPoints: 0,
    totalContentLinks: 0
  });
  
  // Monthly user growth data - in a real app would come from database
  const monthlyData = [
    { name: "Jan", users: 30 },
    { name: "Feb", users: 55 },
    { name: "Mar", users: 85 },
    { name: "Apr", users: 132 },
    { name: "May", users: 180 },
    { name: "Jun", users: 220 },
    { name: "Jul", users: 265 },
    { name: "Aug", users: 320 },
    { name: "Sep", users: 350 },
    { name: "Oct", users: 410 },
    { name: "Nov", users: 490 },
    { name: "Dec", users: 520 }
  ];

  // Fetch restaurant data and stats from Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurants for the chart
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('*')
          .order('customers_count', { ascending: false })
          .limit(5);
        
        if (restaurantsError) throw restaurantsError;
        
        // Fetch total restaurants count
        const { count: totalRestaurants, error: countError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;
        
        // Fetch active restaurants count
        const { count: activeRestaurants, error: activeError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        
        if (activeError) throw activeError;
        
        // Count all customers from profiles with role = 'customer'
        const { count: totalCustomers, error: customerError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');
        
        if (customerError) throw customerError;
        
        // Get total points data
        const { data: pointsData, error: pointsError } = await supabase
          .from('point_transactions')
          .select('transaction_type, points, restaurant_id');
        
        if (pointsError) throw pointsError;
        
        // Get count of content links - using any to bypass type issue
        const { count: totalContentLinks, error: contentLinksError } = await (supabase
          .from('content_links') as any)
          .select('*', { count: 'exact', head: true });
          
        if (contentLinksError) throw contentLinksError;
        
        // Calculate total and redeemed points
        let totalPoints = 0;
        let redeemedPoints = 0;
        
        pointsData?.forEach(transaction => {
          if (transaction.transaction_type === 'add') {
            totalPoints += transaction.points;
          } else if (transaction.transaction_type === 'redeem') {
            redeemedPoints += transaction.points;
          }
        });
        
        // Prepare the restaurant data for display
        const formattedRestaurants = restaurants?.map(restaurant => {
          // Get all point transactions for this restaurant
          const restaurantPoints = pointsData?.filter(tx => 
            tx.restaurant_id === restaurant.id && 
            tx.transaction_type === 'add'
          ) || [];
          
          // Sum up the points
          const totalRestaurantPoints = restaurantPoints.reduce((sum, tx) => sum + tx.points, 0);
          
          return {
            name: restaurant.name,
            active: restaurant.status === 'active',
            customers: restaurant.customers_count || 0,
            points: totalRestaurantPoints
          };
        }) || [];
        
        setRestaurantData(formattedRestaurants);
        setStatsData({
          totalRestaurants: totalRestaurants || 0,
          activeRestaurants: activeRestaurants || 0,
          totalCustomers: totalCustomers || 0,
          totalPoints,
          redeemedPoints,
          totalContentLinks: totalContentLinks || 0
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast]);

  // Generate stats cards based on the data
  const statsCards = [
    {
      title: "Total Restaurants",
      value: statsData.totalRestaurants.toString(),
      description: `${statsData.activeRestaurants} active`
    },
    {
      title: "Active Customers",
      value: statsData.totalCustomers.toLocaleString(),
      description: "Across all restaurants"
    },
    {
      title: "Points Issued",
      value: statsData.totalPoints.toLocaleString(),
      description: "Across all restaurants"
    },
    {
      title: "Content Links",
      value: statsData.totalContentLinks.toLocaleString(),
      description: "Promotional and informational links"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of all loyalty program metrics</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => (
              <Card key={index} className="hover-lift">
                <CardHeader className="pb-2">
                  <CardDescription>{card.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.value}</div>
                  <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>Monthly new customer registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          border: "none",
                        }}
                      />
                      <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Restaurants</CardTitle>
                <CardDescription>By customer count and points issued</CardDescription>
              </CardHeader>
              <CardContent>
                {restaurantData.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No restaurant data available yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {restaurantData.map((restaurant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/40 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {restaurant.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {restaurant.name}{" "}
                              {restaurant.active ? (
                                <span className="inline-block ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-block ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {restaurant.customers} customers
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{restaurant.points.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Total points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
