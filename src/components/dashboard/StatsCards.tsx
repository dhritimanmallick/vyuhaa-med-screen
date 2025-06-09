
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Beaker, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  role: string;
}

const StatsCards = ({ role }: StatsCardsProps) => {
  const getStatsForRole = () => {
    switch (role) {
      case 'admin':
        return [
          { title: "Total Labs", value: "12", description: "Active locations", icon: Users, color: "text-blue-600" },
          { title: "Active Users", value: "156", description: "Across all roles", icon: Users, color: "text-green-600" },
          { title: "Monthly Samples", value: "3,247", description: "+18% from last month", icon: FileText, color: "text-purple-600" },
          { title: "Revenue", value: "₹12.4L", description: "This month", icon: CheckCircle, color: "text-teal-600" },
        ];
      case 'accession':
        return [
          { title: "Pending Accession", value: "23", description: "Samples waiting", icon: FileText, color: "text-orange-600" },
          { title: "Today's Samples", value: "89", description: "Accessioned today", icon: CheckCircle, color: "text-green-600" },
          { title: "Rejected", value: "3", description: "Quality issues", icon: Users, color: "text-red-600" },
          { title: "Processing", value: "156", description: "In workflow", icon: Beaker, color: "text-blue-600" },
        ];
      case 'technician':
        return [
          { title: "Assigned to Me", value: "18", description: "Pending processing", icon: FileText, color: "text-blue-600" },
          { title: "Completed Today", value: "12", description: "Samples processed", icon: CheckCircle, color: "text-green-600" },
          { title: "LBC Samples", value: "8", description: "For slide prep", icon: Beaker, color: "text-purple-600" },
          { title: "HPV Samples", value: "10", description: "For DNA extraction", icon: Beaker, color: "text-teal-600" },
        ];
      case 'pathologist':
        return [
          { title: "Review Queue", value: "34", description: "AI screened slides", icon: FileText, color: "text-blue-600" },
          { title: "Completed Today", value: "28", description: "Reports finalized", icon: CheckCircle, color: "text-green-600" },
          { title: "High Priority", value: "5", description: "Urgent reviews", icon: Users, color: "text-red-600" },
          { title: "Co-tests", value: "12", description: "For correlation", icon: Beaker, color: "text-purple-600" },
        ];
      case 'customer':
        return [
          { title: "Active Samples", value: "7", description: "In processing", icon: FileText, color: "text-blue-600" },
          { title: "Completed", value: "142", description: "Reports available", icon: CheckCircle, color: "text-green-600" },
          { title: "This Month", value: "23", description: "Samples submitted", icon: Beaker, color: "text-purple-600" },
          { title: "Outstanding", value: "₹45,200", description: "Pending payment", icon: Users, color: "text-orange-600" },
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
