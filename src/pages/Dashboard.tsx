import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeftRight,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Clock,
  FileCheck,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const quickActions = [
  {
    title: "Convert MT to MX",
    description:
      "Transform MT messages to MX format with file, folder, or content input",
    icon: ArrowLeftRight,
    href: "/dashboard/mt-to-mx",
    color: "bg-blue-500",
    badge: "Popular",
  },
  {
    title: "Convert MX to MT",
    description:
      "Transform MX messages to MT format with multiple input options",
    icon: RefreshCw,
    href: "/dashboard/mx-to-mt",
    color: "bg-green-500",
    badge: "New",
  },
  {
    title: "Audit Report",
    description: "View detailed conversion history and audit trails",
    icon: BarChart3,
    href: "/dashboard/audit",
    color: "bg-purple-500",
    badge: null,
  },
];

const stats = [
  {
    title: "Total Conversions",
    value: "12,459",
    change: "+12%",
    trend: "up",
    icon: FileCheck,
  },
  {
    title: "Success Rate",
    value: "99.8%",
    change: "+0.2%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Avg Processing Time",
    value: "1.2s",
    change: "-15%",
    trend: "down",
    icon: Clock,
  },
  {
    title: "Active Sessions",
    value: "8",
    change: "+2",
    trend: "up",
    icon: AlertCircle,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Good {getTimeOfDay()}, {user?.username}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome to your MT/MX conversion dashboard. Choose an action to get
          started.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="glass-effect hover:shadow-lg transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`text-xs font-medium ${
                        stat.trend === "up" ? "text-success" : "text-warning"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-full ${
                    stat.trend === "up" ? "bg-success/10" : "bg-warning/10"
                  }`}
                >
                  <stat.icon
                    className={`h-5 w-5 ${
                      stat.trend === "up" ? "text-success" : "text-warning"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="glass-effect hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
              onClick={() => navigate(action.href)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${action.color} shadow-lg`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {action.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  className="w-full justify-between group-hover:bg-primary/5 transition-colors"
                >
                  Get Started
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Recent Activity
        </h2>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Recent Activity
              </h3>
              <p className="text-muted-foreground mb-4">
                Your conversion history will appear here once you start
                processing messages.
              </p>
              <Button
                onClick={() => navigate("/dashboard/mt-to-mx")}
                className="bg-primary hover:bg-primary/90"
              >
                Start Your First Conversion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
