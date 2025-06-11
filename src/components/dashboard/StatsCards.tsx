
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSamples } from "../../hooks/useSupabaseData";
import { useAuth } from "../../hooks/useAuth";
import { Loader2 } from "lucide-react";

interface StatsCardsProps {
  role: 'admin' | 'accession' | 'technician' | 'pathologist' | 'customer';
}

const StatsCards = ({ role }: StatsCardsProps) => {
  const { samples, loading, error } = useSamples();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading statistics: {error}</p>
      </div>
    );
  }

  const getStatsForRole = () => {
    switch (role) {
      case 'admin':
        return [
          {
            title: "Total Samples",
            value: samples.length.toString(),
            description: "All samples in system"
          },
          {
            title: "Processing",
            value: samples.filter(s => s.status === 'processing').length.toString(),
            description: "Currently being processed"
          },
          {
            title: "Completed",
            value: samples.filter(s => s.status === 'completed').length.toString(),
            description: "Ready for delivery"
          },
          {
            title: "Pending Review",
            value: samples.filter(s => s.status === 'review').length.toString(),
            description: "Awaiting pathologist review"
          }
        ];
      
      case 'accession':
        const todaySamples = samples.filter(sample => {
          const today = new Date().toDateString();
          const sampleDate = new Date(sample.accession_date || '').toDateString();
          return today === sampleDate;
        });
        
        return [
          {
            title: "Today's Samples",
            value: todaySamples.length.toString(),
            description: "Accessioned today"
          },
          {
            title: "Pending",
            value: samples.filter(s => s.status === 'pending').length.toString(),
            description: "Awaiting processing"
          },
          {
            title: "Total Samples",
            value: samples.length.toString(),
            description: "All samples in system"
          },
          {
            title: "Rejected",
            value: samples.filter(s => s.status === 'rejected').length.toString(),
            description: "Quality issues"
          }
        ];
      
      case 'technician':
        const technicianSamples = samples.filter(sample => 
          sample.assigned_technician === user?.id
        );
        
        return [
          {
            title: "Assigned to Me",
            value: technicianSamples.length.toString(),
            description: "My assigned samples"
          },
          {
            title: "In Progress",
            value: technicianSamples.filter(s => s.status === 'processing').length.toString(),
            description: "Currently processing"
          },
          {
            title: "Completed",
            value: technicianSamples.filter(s => s.status === 'completed').length.toString(),
            description: "Ready for review"
          },
          {
            title: "Available",
            value: samples.filter(s => s.status === 'pending' && !s.assigned_technician).length.toString(),
            description: "Available for assignment"
          }
        ];
      
      case 'pathologist':
        const pathologistSamples = samples.filter(sample => 
          sample.assigned_pathologist === user?.id || 
          (sample.status === 'review' && !sample.assigned_pathologist)
        );
        
        return [
          {
            title: "Pending Review",
            value: pathologistSamples.filter(s => s.status === 'review').length.toString(),
            description: "Awaiting my review"
          },
          {
            title: "Completed",
            value: pathologistSamples.filter(s => s.status === 'completed').length.toString(),
            description: "Reports finalized"
          },
          {
            title: "High Priority",
            value: "0",
            description: "Urgent samples"
          },
          {
            title: "Total Assigned",
            value: pathologistSamples.length.toString(),
            description: "All assigned samples"
          }
        ];
      
      case 'customer':
        return [
          {
            title: "Total Samples",
            value: samples.length.toString(),
            description: "Submitted samples"
          },
          {
            title: "In Progress",
            value: samples.filter(s => ['pending', 'processing', 'review'].includes(s.status)).length.toString(),
            description: "Being processed"
          },
          {
            title: "Completed",
            value: samples.filter(s => s.status === 'completed').length.toString(),
            description: "Reports ready"
          },
          {
            title: "This Month",
            value: samples.filter(sample => {
              const thisMonth = new Date().getMonth();
              const sampleMonth = new Date(sample.accession_date || '').getMonth();
              return thisMonth === sampleMonth;
            }).length.toString(),
            description: "Samples this month"
          }
        ];
      
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
