
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Edit } from "lucide-react";

const PricingTiers = () => {
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [pricing, setPricing] = useState({
    Platinum: { lbc: 600, hpv: 900, cotest: 1350 },
    Gold: { lbc: 800, hpv: 1200, cotest: 1800 },
    Silver: { lbc: 1000, hpv: 1500, cotest: 2250 }
  });

  const handlePricingUpdate = (tier: string, testType: string, value: number) => {
    setPricing(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier as keyof typeof prev],
        [testType]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pricing Tiers</h2>
        <Button variant="outline">
          Export Pricing Sheet
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(pricing).map(([tier, prices]) => (
          <Card key={tier} className={`${tier === 'Platinum' ? 'border-purple-200 bg-purple-50' : 
                                      tier === 'Gold' ? 'border-yellow-200 bg-yellow-50' : 
                                      'border-gray-200 bg-gray-50'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>{tier} Tier</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditingTier(editingTier === tier ? null : tier)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                {tier === 'Platinum' && 'Premium customers with highest volume'}
                {tier === 'Gold' && 'Regular customers with moderate volume'}
                {tier === 'Silver' && 'Standard pricing for new customers'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`${tier}-lbc`}>LBC Test</Label>
                  {editingTier === tier ? (
                    <Input
                      id={`${tier}-lbc`}
                      type="number"
                      value={prices.lbc}
                      onChange={(e) => handlePricingUpdate(tier, 'lbc', Number(e.target.value))}
                      className="w-24 text-right"
                    />
                  ) : (
                    <span className="font-medium">₹{prices.lbc}</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <Label htmlFor={`${tier}-hpv`}>HPV Test</Label>
                  {editingTier === tier ? (
                    <Input
                      id={`${tier}-hpv`}
                      type="number"
                      value={prices.hpv}
                      onChange={(e) => handlePricingUpdate(tier, 'hpv', Number(e.target.value))}
                      className="w-24 text-right"
                    />
                  ) : (
                    <span className="font-medium">₹{prices.hpv}</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <Label htmlFor={`${tier}-cotest`}>Co-test</Label>
                  {editingTier === tier ? (
                    <Input
                      id={`${tier}-cotest`}
                      type="number"
                      value={prices.cotest}
                      onChange={(e) => handlePricingUpdate(tier, 'cotest', Number(e.target.value))}
                      className="w-24 text-right"
                    />
                  ) : (
                    <span className="font-medium">₹{prices.cotest}</span>
                  )}
                </div>
              </div>
              
              {editingTier === tier && (
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="flex-1">Save Changes</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingTier(null)}>Cancel</Button>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Savings vs Silver</span>
                  {tier === 'Platinum' && <Badge variant="default">40% off</Badge>}
                  {tier === 'Gold' && <Badge variant="secondary">20% off</Badge>}
                  {tier === 'Silver' && <Badge variant="outline">Standard</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing History & Analytics</CardTitle>
          <CardDescription>Track pricing changes and customer tier distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">23</p>
              <p className="text-sm text-gray-600">Platinum Customers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">67</p>
              <p className="text-sm text-gray-600">Gold Customers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">145</p>
              <p className="text-sm text-gray-600">Silver Customers</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <h4 className="font-medium">Recent Pricing Updates</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Gold tier LBC pricing updated to ₹800 (2 days ago)</p>
              <p>• Platinum tier co-test discount increased to 40% (1 week ago)</p>
              <p>• Silver tier HPV pricing adjusted to ₹1500 (2 weeks ago)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingTiers;
