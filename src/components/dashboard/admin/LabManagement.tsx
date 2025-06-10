
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Building, Loader2, Trash2, Edit2, MapPin, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Lab {
  id: string;
  name: string;
  location: string;
  contact: string;
  email: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

const LabManagement = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newLab, setNewLab] = useState({
    name: "",
    location: "",
    contact: "",
    email: "",
    status: "active" as Lab['status']
  });

  // For now, using mock data since we don't have a labs table
  // In a real implementation, you would create a labs table in Supabase
  const mockLabs: Lab[] = [
    {
      id: "1",
      name: "Mumbai Central Lab",
      location: "Mumbai, Maharashtra",
      contact: "+91-98765-43210",
      email: "mumbai@vyuhaa.com",
      status: "active",
      created_at: new Date().toISOString()
    },
    {
      id: "2", 
      name: "Delhi North Lab",
      location: "New Delhi, Delhi",
      contact: "+91-98765-43211",
      email: "delhi@vyuhaa.com",
      status: "active",
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      name: "Bangalore Central Lab",
      location: "Bangalore, Karnataka", 
      contact: "+91-98765-43212",
      email: "bangalore@vyuhaa.com",
      status: "active",
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLabs(mockLabs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateLab = async () => {
    if (!newLab.name || !newLab.location || !newLab.contact || !newLab.email) {
      toast.error("Please fill in all fields");
      return;
    }

    setCreating(true);
    try {
      // Simulate creation - in real app, this would be a Supabase insert
      const newLabEntry: Lab = {
        id: Date.now().toString(),
        ...newLab,
        created_at: new Date().toISOString()
      };
      
      setLabs(prev => [newLabEntry, ...prev]);
      toast.success("Lab created successfully");
      setNewLab({ name: "", location: "", contact: "", email: "", status: "active" });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(`Failed to create lab: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateLab = async () => {
    if (!editingLab) return;

    setUpdating(true);
    try {
      // Simulate update - in real app, this would be a Supabase update
      setLabs(prev => prev.map(lab => 
        lab.id === editingLab.id ? { ...editingLab, updated_at: new Date().toISOString() } : lab
      ));
      
      toast.success("Lab updated successfully");
      setEditingLab(null);
    } catch (error: any) {
      toast.error(`Failed to update lab: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteLab = async (labId: string) => {
    if (!confirm("Are you sure you want to delete this lab?")) return;

    try {
      // Simulate deletion - in real app, this would be a Supabase delete
      setLabs(prev => prev.filter(lab => lab.id !== labId));
      toast.success("Lab deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete lab: ${error.message}`);
    }
  };

  const filteredLabs = labs.filter(lab =>
    lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Lab Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Lab
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Lab</DialogTitle>
              <DialogDescription>
                Register a new laboratory location.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="labName">Lab Name</Label>
                <Input
                  id="labName"
                  value={newLab.name}
                  onChange={(e) => setNewLab({...newLab, name: e.target.value})}
                  placeholder="Enter lab name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newLab.location}
                  onChange={(e) => setNewLab({...newLab, location: e.target.value})}
                  placeholder="City, State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={newLab.contact}
                  onChange={(e) => setNewLab({...newLab, contact: e.target.value})}
                  placeholder="+91-XXXXX-XXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newLab.email}
                  onChange={(e) => setNewLab({...newLab, email: e.target.value})}
                  placeholder="lab@vyuhaa.com"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreateLab}
                disabled={creating}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Lab
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLabs.map((lab) => (
          <Card key={lab.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span className="truncate">{lab.name}</span>
                </div>
                <Badge variant={lab.status === 'active' ? 'default' : 'secondary'}>
                  {lab.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{lab.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{lab.contact}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{lab.email}</span>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setEditingLab(lab)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteLab(lab.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingLab && (
        <Dialog open={!!editingLab} onOpenChange={() => setEditingLab(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Lab</DialogTitle>
              <DialogDescription>
                Update laboratory information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editLabName">Lab Name</Label>
                <Input
                  id="editLabName"
                  value={editingLab.name}
                  onChange={(e) => setEditingLab({...editingLab, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLocation">Location</Label>
                <Input
                  id="editLocation"
                  value={editingLab.location}
                  onChange={(e) => setEditingLab({...editingLab, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContact">Contact Number</Label>
                <Input
                  id="editContact"
                  value={editingLab.contact}
                  onChange={(e) => setEditingLab({...editingLab, contact: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingLab.email}
                  onChange={(e) => setEditingLab({...editingLab, email: e.target.value})}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  className="flex-1" 
                  onClick={handleUpdateLab}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update Lab
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingLab(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Labs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder="Search by name, location, or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LabManagement;
