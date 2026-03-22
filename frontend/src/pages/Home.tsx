import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Leaf, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Home() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem('receiptUrl', url.trim());
    sessionStorage.setItem('deliveryLocation', deliveryLocation.trim());
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-100 p-3 rounded-full">
            <Leaf className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-medium text-gray-900">True Cost Calculator</h1>
            <p className="text-gray-600">Discover the environmental impact of your products</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Amazon Product URL *</Label>
            <Input
              id="url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.amazon.com/dp/..."
            />
            <p className="text-sm text-gray-500">Paste an Amazon product URL to analyze its environmental impact</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Delivery Location (Optional)
            </Label>
            <Input
              id="location"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="e.g., New York, Los Angeles, London"
            />
            <p className="text-sm text-gray-500">Enter your city for accurate supply chain mapping</p>
          </div>

          <Button type="submit" className="w-full py-6 text-base">
            Calculate Environmental Impact
          </Button>
        </form>
      </div>
    </div>
  );
}
