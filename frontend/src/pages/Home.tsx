import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Leaf, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

const inputCls = 'bg-slate-700/60 border-slate-600 text-white placeholder:text-gray-500 focus:border-emerald-500';

export default function Home() {
  const navigate = useNavigate();

  // URL tab
  const [url, setUrl] = useState('');

  // Manual tab
  const [brand, setBrand] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [price, setPrice] = useState('');

  // Shared
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [tab, setTab] = useState<'url' | 'manual'>('url');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.removeItem('manualProduct');

    if (tab === 'url') {
      sessionStorage.setItem('receiptUrl', url.trim());
    } else {
      sessionStorage.removeItem('receiptUrl');
      sessionStorage.setItem('manualProduct', JSON.stringify({ brand, title, description, materials, price }));
    }

    sessionStorage.setItem('deliveryLocation', deliveryLocation.trim());
    navigate('/results');
  };

  const canSubmit = tab === 'url' ? url.trim().length > 0 : title.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-center w-1/2 px-16 py-12 bg-slate-900/60 border-r border-slate-700/40">
        <div className="bg-emerald-500/20 p-4 rounded-full w-fit mb-6">
          <Leaf className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-5xl font-semibold text-white leading-tight mb-4">True Cost Calculator</h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          Discover the real environmental impact behind the products you buy — from supply chain emissions to material sourcing.
        </p>
        <ul className="space-y-3 text-gray-500 text-sm">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Analyze Amazon products via URL</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Enter product details manually</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Get supply chain & carbon footprint insights</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />See an environmental grade for any product</li>
        </ul>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-16 py-12">
        {/* Mobile header */}
        <div className="flex items-center gap-3 mb-8 md:hidden">
          <div className="bg-emerald-500/20 p-3 rounded-full">
            <Leaf className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white">True Cost Calculator</h1>
        </div>

        <h2 className="text-xl font-medium text-white mb-6 hidden md:block">Analyze a product</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'url' | 'manual')}>
            <TabsList className="w-full bg-slate-700/60 border border-slate-600/40 mb-4">
              <TabsTrigger
                value="url"
                className="flex-1 text-gray-400 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
              >
                Amazon URL
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="flex-1 text-gray-400 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
              >
                Enter Manually
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-2">
              <Label htmlFor="url" className="text-gray-300">Amazon Product URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.amazon.com/dp/..."
                className={inputCls}
              />
              <p className="text-sm text-gray-500">Paste an Amazon product URL to analyze its environmental impact</p>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-gray-300">Brand / Company</Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g., Nike, Patagonia"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-300">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g., 49.99"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Product Title *</Label>
                <Input
                  id="title"
                  required={tab === 'manual'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Men's Slim Fit Cotton T-Shirt"
                  className={inputCls}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Product Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product, its use case, manufacturing details..."
                  className={`${inputCls} min-h-[80px] resize-none`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="materials" className="text-gray-300">Material Breakdown</Label>
                <Input
                  id="materials"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g., 60% cotton, 40% polyester"
                  className={inputCls}
                />
                <p className="text-sm text-gray-500">List materials and percentages if known</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4" />
              Delivery Location (Optional)
            </Label>
            <Input
              id="location"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="e.g., New York, Los Angeles, London"
              className={inputCls}
            />
            <p className="text-sm text-gray-500">Enter your city for accurate supply chain mapping</p>
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-6 text-base bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40"
          >
            Calculate Environmental Impact
          </Button>
        </form>
      </div>
    </div>
  );
}
