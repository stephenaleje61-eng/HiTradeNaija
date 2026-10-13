import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Upload, ShieldCheck, MapPin, Check, 
  Trash2, AlertCircle, ArrowLeft, Eye 
} from 'lucide-react';
import { 
  NIGERIAN_STATES_AND_CITIES, INITIAL_CATEGORIES, 
  formatNaira, formatNigerianPhone 
} from '../data/nigeria-data';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

interface PostProductPageProps {
  navigate: (route: string) => void;
  editProductId?: string;
}

export const PostProductPage: React.FC<PostProductPageProps> = ({
  navigate,
  editProductId
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  // Redirect if not signed in
  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please sign in to post goods on TradeNaija.', 'info');
      navigate('/auth?redirect=/sell');
    }
  }, [isAuthenticated, navigate, showToast]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(INITIAL_CATEGORIES[0].name);
  const [subcategory, setSubcategory] = useState(INITIAL_CATEGORIES[0].subcategories[0] || '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState<'new' | 'used'>('new');
  const [brand, setBrand] = useState('');

  // Location
  const [state, setState] = useState(user?.state || 'Lagos');
  const [city, setCity] = useState(user?.city || 'Ikeja');

  // Contact details
  const [countryCode, setCountryCode] = useState('+234');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || user?.phone || '');
  const [isPhonePublic, setIsPhonePublic] = useState(user?.isPhonePublic ?? true);
  const [isWhatsappPublic, setIsWhatsappPublic] = useState(user?.isWhatsappPublic ?? true);

  // Delivery & policies
  const [deliveryMethod, setDeliveryMethod] = useState('Nationwide Waybill / GIG Logistics');
  const [deliveryFee, setDeliveryFee] = useState('3000');
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [warranty, setWarranty] = useState('6 Months Warranty');
  const [returnPolicy, setReturnPolicy] = useState('7 Days return if defective');

  // Image upload
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Terms agreement
  const [sellerResponsibilityAgreed, setSellerResponsibilityAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Sync subcategories on category change
  useEffect(() => {
    const selectedCat = INITIAL_CATEGORIES.find(c => c.name === category);
    if (selectedCat && selectedCat.subcategories.length > 0) {
      setSubcategory(selectedCat.subcategories[0]);
    } else {
      setSubcategory('');
    }
  }, [category]);

  // Sync cities on state change
  const currentCities = NIGERIAN_STATES_AND_CITIES.find(s => s.state === state)?.cities || [];
  useEffect(() => {
    if (currentCities.length > 0 && !currentCities.includes(city)) {
      setCity(currentCities[0]);
    }
  }, [state]);

  const handleAddImage = () => {
    if (customImageUrl.trim()) {
      setImages(prev => [...prev, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImages(prev => [...prev, reader.result as string]);
        showToast('Photo uploaded!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    if (images.length === 1) {
      showToast('At least one product image is required.', 'warning');
      return;
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !price) {
      showToast('Please fill in product title, description, and price.', 'error');
      return;
    }

    if (Number(price) <= 0) {
      showToast('Please enter a valid price in Nigerian Naira (₦).', 'error');
      return;
    }

    if (!sellerResponsibilityAgreed) {
      showToast('You must confirm seller responsibility before publishing.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const created = await api.createProduct({
        title,
        category,
        subcategory,
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        quantity: Number(quantity) || 1,
        condition,
        brand,
        images,
        state,
        city,
        phone: phone ? `${countryCode} ${phone.replace(/^0/, '')}` : '',
        whatsappNumber: whatsappNumber ? `${countryCode} ${whatsappNumber.replace(/^0/, '')}` : '',
        isPhonePublic,
        isWhatsappPublic,
        deliveryMethod,
        deliveryFee: Number(deliveryFee) || 0,
        pickupAvailable,
        warranty,
        returnPolicy
      });

      showToast('Listing published successfully to TradeNaija!', 'success');
      navigate(`/product/${created.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to post product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-1">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>SELL TO EVERYONE ACROSS NIGERIA</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">Post Your Goods</h1>
              <p className="text-xs text-slate-500 mt-1">
                Reach genuine buyers in Lagos, Abuja, Port Harcourt, Kano, and nationwide in minutes.
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                <span>⏱️ 7-Day Duration: Listings stay live for 7 days to keep inventory fresh. You can relist anytime from your dashboard.</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* 1. Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">1</span>
                <span>Product Identification</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone 15 Pro Max 256GB Natural Titanium (Dual SIM)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 outline-none"
                  >
                    {INITIAL_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subcategory</label>
                  <input
                    type="text"
                    placeholder="e.g. Smartphones, Laptops, Senator Wears"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Condition *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCondition('new')}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                        condition === 'new'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Brand New
                    </button>
                    <button
                      type="button"
                      onClick={() => setCondition('used')}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                        condition === 'used'
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Used / Tested
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Dell, Luminous, Toyota"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Specs *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe key features, accessories included, storage capacity, condition, or warranty..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none text-slate-800"
                />
              </div>
            </div>

            {/* 2. Pricing & Inventory */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">2</span>
                <span>Price & Stock (Nigerian Naira)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₦) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-bold"
                  />
                  {price && (
                    <span className="text-[11px] text-orange-600 font-bold block mt-1">
                      {formatNaira(Number(price))}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount Price (₦ Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 135000"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                  {discountPrice && (
                    <span className="text-[11px] text-emerald-600 font-bold block mt-1">
                      {formatNaira(Number(discountPrice))}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Available *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Photos Upload */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">3</span>
                <span>Product Photos</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Upload or Add image button */}
                <label className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl aspect-square flex flex-col items-center justify-center p-3 text-center cursor-pointer transition bg-slate-50 hover:bg-orange-50/30">
                  <Upload className="w-6 h-6 text-orange-600 mb-1" />
                  <span className="text-xs font-bold text-slate-700">Upload Photo</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Or paste photo URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Or paste direct image URL (Unsplash, Cloudinary, etc.)..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 rounded-xl transition"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* 4. Location & Contact Controls */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">4</span>
                <span>Nigerian Location & Contact Privacy</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nigerian State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none"
                  >
                    {NIGERIAN_STATES_AND_CITIES.map((s) => (
                      <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City or LGA *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ikeja, Alaba, Maitama, Kano Municipal, Bodija"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp with +234 selector as required */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <div className="flex gap-1.5">
                    <span className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                      +234
                    </span>
                    <input
                      type="tel"
                      placeholder="801 234 5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 text-xs p-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPhonePublic}
                      onChange={(e) => setIsPhonePublic(e.target.checked)}
                      className="w-3.5 h-3.5 accent-orange-600 rounded"
                    />
                    <span>Make phone number publicly visible to buyers</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                  <div className="flex gap-1.5">
                    <span className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                      +234
                    </span>
                    <input
                      type="tel"
                      placeholder="801 234 5678"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="flex-1 text-xs p-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWhatsappPublic}
                      onChange={(e) => setIsWhatsappPublic(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-600 rounded"
                    />
                    <span>Enable "Chat on WhatsApp" button for this item</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 5. Delivery & Seller Responsibility Confirmation */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">5</span>
                <span>Delivery Options & Responsibility Confirmation</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Method</label>
                  <input
                    type="text"
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Waybill Fee (₦)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Responsibility Agreement Checkbox */}
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={sellerResponsibilityAgreed}
                    onChange={(e) => setSellerResponsibilityAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-orange-600 rounded cursor-pointer"
                  />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong>Seller Responsibility Agreement:</strong> I confirm that this item is authentic, legally owned, accurately represented, and available for delivery across Nigeria. I agree to trade fairly and uphold TradeNaija community trust standards.
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{submitting ? 'Publishing Listing...' : 'Publish Listing Now'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
