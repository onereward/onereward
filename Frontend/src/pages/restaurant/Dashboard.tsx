
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts";

const RestaurantDashboard = () => {
  // Sample data - in a real app this would come from an API
  const customerData = [
    {
      name: "Jan",
      "New Customers": 12,
      "Return Visits": 35,
    },
    {
      name: "Feb",
      "New Customers": 15,
      "Return Visits": 42,
    },
    {
      name: "Mar",
      "New Customers": 18,
      "Return Visits": 48,
    },
    {
      name: "Apr",
      "New Customers": 22,
      "Return Visits": 55,
    },
    {
      name: "May",
      "New Customers": 28,
      "Return Visits": 63,
    },
    {
      name: "Jun",
      "New Customers": 30,
      "Return Visits": 68,
    },
  ];

  const pointsData = [
    {
      name: "Jan",
      "Points Earned": 1250,
      "Points Redeemed": 450,
    },
    {
      name: "Feb",
      "Points Earned": 1450,
      "Points Redeemed": 550,
    },
    {
      name: "Mar",
      "Points Earned": 1650,
      "Points Redeemed": 620,
    },
    {
      name: "Apr",
      "Points Earned": 1850,
      "Points Redeemed": 780,
    },
    {
      name: "May",
      "Points Earned": 2150,
      "Points Redeemed": 950,
    },
    {
      name: "Jun",
      "Points Earned": 2350,
      "Points Redeemed": 1050,
    },
  ];

  const recentActivity = [
    {
      customer: "John Doe",
      activity: "Earned 100 points",
      time: "10 minutes ago",
    },
    {
      customer: "Jane Smith",
      activity: "Redeemed 250 points",
      time: "25 minutes ago",
    },
    {
      customer: "Michael Brown",
      activity: "Earned 150 points",
      time: "1 hour ago",
    },
    {
      customer: "Emily Wilson",
      activity: "Registered as new customer",
      time: "2 hours ago",
    },
    {
      customer: "David Miller",
      activity: "Redeemed 500 points",
      time: "3 hours ago",
    },
  ];

  const statsCards = [
    {
      title: "Total Customers",
      value: "245",
      description: "↑ 12% from last month",
    },
    {
      title: "Points Issued",
      value: "12,450",
      description: "Last 30 days",
    },
    {
      title: "Points Redeemed",
      value: "3,850",
      description: "30.9% redemption rate",
    },
    {
      title: "Avg. Points Per Customer",
      value: "50.8",
      description: "Last 30 days",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Restaurant Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your loyalty program performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index} className="hover-lift">
            <CardHeader className="pb-2">
              <CardDescription>{card.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Customer Activity</CardTitle>
            <CardDescription>New customers vs. return visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerData}>
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
                  <Bar dataKey="New Customers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Return Visits" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Points Analysis</CardTitle>
            <CardDescription>Earned vs. redeemed points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pointsData}>
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
                  <Line
                    type="monotone"
                    dataKey="Points Earned"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Points Redeemed"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest customer transactions and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {activity.customer.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{activity.customer}</h4>
                    <p className="text-sm text-muted-foreground">
                      {activity.activity}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantDashboard;
