import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  User as UserIcon, 
  Bell, 
  LogOut, 
  MapPin, 
  CheckCircle, 
  AlertTriangle,
  Camera,
  ArrowRight,
  ShieldCheck,
  Package,
  Gavel,
  Trash2,
  Menu,
  X,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Truck,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Listing, Notification, Role } from './types';

// --- Components ---

const Navbar = ({ user, notifications, onLogout, onOpenAuth, onOpenDashboard, onMarkRead }: { user: User | null, notifications: Notification[], onLogout: () => void, onOpenAuth: () => void, onOpenDashboard: () => void, onMarkRead: (id: number) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-zinc-200 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">EcoSwap</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => window.location.href = '/'} className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Marketplace</button>
          <a href="#how-it-works" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">How it works</a>
          <a href="#" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Sustainability</a>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(n => (
                            <div 
                              key={n.id} 
                              onClick={() => { if(!n.is_read) onMarkRead(n.id); }}
                              className={`p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-emerald-50/30' : ''}`}
                            >
                              <p className="text-xs text-zinc-600 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-zinc-400 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-zinc-400 text-xs">No notifications yet</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 pl-4 border-l border-zinc-200">
                <button 
                  onClick={onOpenDashboard}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-emerald-600"
                >
                  <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                    <UserIcon size={16} />
                  </div>
                  <span className="hidden sm:inline">{user.firstName}</span>
                </button>
                <button onClick={onLogout} className="p-2 text-zinc-400 hover:text-red-500">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={onOpenAuth}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-4 py-2"
              >
                Log in
              </button>
              <button 
                onClick={onOpenAuth}
                className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Join Marketplace
              </button>
            </div>
          )}
          <button className="md:hidden p-2 text-zinc-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
  onMarkAsSold?: (e: React.MouseEvent) => void;
  key?: React.Key;
}

const ListingCard = ({ listing, onClick, isSaved, onToggleSave, onMarkAsSold }: ListingCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-zinc-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all relative"
      onClick={onClick}
    >
      <div className="aspect-[4/3] relative bg-zinc-100">
        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-20 flex items-center justify-center">
            <span className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded-md shadow-xl transform -rotate-12 border border-white/20">
              SOLD
            </span>
          </div>
        )}
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            <Package size={48} strokeWidth={1} />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
            {listing.category}
          </span>
          {listing.price_type === 'bidding' && (
            <span className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm flex items-center gap-1">
              <Gavel size={10} /> Bidding
            </span>
          )}
          {listing.is_verified && (
            <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm flex items-center gap-1">
              <ShieldCheck size={10} /> AI Verified
            </span>
          )}
        </div>
        
        {onToggleSave && (
          <button 
            onClick={onToggleSave}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all shadow-sm z-10 ${isSaved ? 'bg-emerald-600 text-white' : 'bg-white/90 text-zinc-400 hover:text-emerald-600'}`}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-zinc-900 line-clamp-1">{listing.title}</h3>
          <div className="text-right">
            <span className="text-lg font-bold text-emerald-600">₦{listing.price}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
          <MapPin size={12} />
          <span>2.4 miles away</span>
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Quality: {listing.quality}</div>
          {listing.quality_notes && (
            <p className="text-[10px] text-zinc-500 line-clamp-1 italic">"{listing.quality_notes}"</p>
          )}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-[10px] font-bold">
              {listing.seller_name[0]}
            </div>
            <span className="text-xs font-medium text-zinc-600">{listing.seller_name}</span>
            {listing.seller_verified && <ShieldCheck size={12} className="text-emerald-500" />}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); alert('Reported listing #' + listing.id); }}
            className="text-[10px] font-bold text-zinc-300 hover:text-red-400 uppercase tracking-tighter"
          >
            Report Listing
          </button>
        </div>
        {onMarkAsSold && listing.status !== 'sold' && (
          <button 
            onClick={onMarkAsSold}
            className="mt-3 w-full py-2 bg-zinc-100 text-zinc-600 hover:bg-zinc-900 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border border-zinc-200"
          >
            Mark as Sold
          </button>
        )}
      </div>
    </motion.div>
  );
};

const AuthModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (u: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('buyer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister ? { email, password, firstName, lastName, role } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
        onClose();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">First Name</label>
                  <input 
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Last Name</label>
                  <input 
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Email Address</label>
              <input 
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">I want to</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${role === 'buyer' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-zinc-200 text-zinc-600'}`}
                  >
                    Buy Waste
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${role === 'seller' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-zinc-200 text-zinc-600'}`}
                  >
                    Sell Waste
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button 
              type="submit"
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm font-medium text-zinc-500 hover:text-emerald-600"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CreateListingModal = ({ isOpen, onClose, user, onCreated }: { isOpen: boolean, onClose: () => void, user: User, onCreated: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Plastic');
  const [quality, setQuality] = useState('Sorted/Clean');
  const [qualityNotes, setQualityNotes] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'bidding'>('fixed');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          setImages(prev => [...prev, base64]);
          
          // AI Suggestion (only for the first image uploaded in this session)
          if (images.length === 0) {
            setIsAnalyzing(true);
            try {
              const res = await fetch('/api/ai/suggest-category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageData: base64 })
              });
              const data = await res.json();
              if (data.category) setCategory(data.category);
            } catch (err) {
              console.error('AI Suggestion failed', err);
            } finally {
              setIsAnalyzing(false);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      sellerId: user.id,
      title,
      description,
      category,
      quality,
      qualityNotes,
      priceType,
      price: Number(price),
      quantity,
      images: images,
      latitude: 0, // Mock for now
      longitude: 0
    };

    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      onCreated();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">List Waste Material</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Material Title</label>
                  <input 
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. 500kg Clean PET Flakes"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Category</label>
                  <div className="relative">
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-white"
                    >
                      {['Plastic', 'Metal', 'Paper', 'Organic', 'Electronic', 'Glass', 'Textile', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {isAnalyzing && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 animate-pulse">
                        <ShieldCheck size={12} /> AI SUGGESTED
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Quality Grade</label>
                  <select 
                    value={quality}
                    onChange={e => setQuality(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-white"
                  >
                    {['Sorted/Clean', 'Unsorted/Mixed', 'Industrial Grade', 'Raw/Contaminated'].map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Quality Notes</label>
                  <textarea 
                    value={qualityNotes}
                    onChange={e => setQualityNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    placeholder="e.g. Minor surface dust, no chemical residue..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Photos of Material</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="aspect-video rounded-xl overflow-hidden relative group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {images.length < 6 && (
                      <div 
                        className="aspect-video rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-zinc-50 transition-all"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                      >
                        <Plus size={20} className="text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Add Photo</span>
                      </div>
                    )}
                  </div>
                  <input id="photo-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" multiple />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Price (₦)</label>
                    <input 
                      type="number"
                      required
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Quantity/Unit</label>
                    <input 
                      required
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. 50kg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Description</label>
              <textarea 
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                placeholder="Describe contamination levels, processing required, etc."
              />
            </div>

            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => setPriceType('fixed')}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${priceType === 'fixed' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-zinc-200 text-zinc-600'}`}
              >
                Fixed Price
              </button>
              <button 
                type="button"
                onClick={() => setPriceType('bidding')}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${priceType === 'bidding' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'border-zinc-200 text-zinc-600'}`}
              >
                Allow Bidding
              </button>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg"
            >
              List Material
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const BiddingSection = ({ listing, user, onBidPlaced, scrollRef }: { listing: Listing, user: User | null, onBidPlaced: () => void, scrollRef?: React.RefObject<HTMLDivElement | null> }) => {
  const [bidAmount, setBidAmount] = useState<number>(listing.price + 10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bids, setBids] = useState<any[]>([]);

  useEffect(() => {
    fetchBids();
  }, [listing.id]);

  const fetchBids = async () => {
    const res = await fetch(`/api/listings/${listing.id}/bids`);
    const data = await res.json();
    setBids(data);
    if (data.length > 0) {
      setBidAmount(data[0].amount + 10);
    } else {
      setBidAmount(listing.price + 10);
    }
  };

  const handlePlaceBid = async () => {
    if (!user) return;
    
    if (bidAmount <= (bids[0]?.amount || listing.price)) {
      alert('Bid must be higher than the current highest bid');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          buyerId: user.id,
          amount: bidAmount
        })
      });
      if (res.ok) {
        fetchBids();
        onBidPlaced();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" ref={scrollRef}>
      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
        <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Gavel size={16} /> Bidding Open
        </h3>
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs text-amber-700 font-bold uppercase mb-1">Current Highest Bid</div>
            <div className="text-3xl font-black text-amber-900">₦{bids[0]?.amount || listing.price}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-amber-600 font-bold uppercase mb-1">Total Bids</div>
            <div className="text-xl font-bold text-amber-900">{bids.length}</div>
          </div>
        </div>

        {user ? (
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900 font-bold">₦</span>
              <input 
                type="number"
                value={bidAmount}
                onChange={e => setBidAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-amber-900"
                min={(bids[0]?.amount || listing.price) + 1}
              />
            </div>
            <button 
              onClick={handlePlaceBid}
              disabled={isSubmitting || listing.status === 'sold'}
              className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-white/50 rounded-xl border border-amber-200 text-center">
            <p className="text-sm text-amber-800 mb-3 font-medium">Log in to place a bid on this item</p>
            <button className="text-xs font-bold text-amber-600 uppercase tracking-widest hover:underline">Log In / Sign Up</button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest mb-4">Bid History</h3>
        <div className="space-y-3">
          {bids.length > 0 ? (
            bids.map((bid, idx) => (
              <div key={bid.id} className={`flex items-center justify-between p-3 rounded-xl border ${idx === 0 ? 'bg-white border-amber-200 shadow-sm' : 'bg-zinc-50 border-zinc-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold text-zinc-600">
                    {bid.buyer_name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900">{bid.buyer_name}</div>
                    <div className="text-[10px] text-zinc-400">{new Date(bid.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-sm font-black text-zinc-900">₦{bid.amount}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-zinc-400 text-xs italic">No bids yet. Be the first!</div>
          )}
        </div>
      </div>
    </div>
  );
};

const ListingDetailModal = ({ listing, isOpen, onClose, isSaved, onToggleSave, user }: { listing: Listing | null, isOpen: boolean, onClose: () => void, isSaved?: boolean, onToggleSave?: () => void, user: User | null }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [highestBid, setHighestBid] = useState<number | null>(null);
  const biddingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveImageIndex(0);
    if (listing && listing.price_type === 'bidding') {
      fetchHighestBid();
    } else {
      setHighestBid(null);
    }
  }, [listing]);

  const fetchHighestBid = async () => {
    if (!listing) return;
    const res = await fetch(`/api/listings/${listing.id}/bids`);
    const data = await res.json();
    if (data.length > 0) {
      setHighestBid(data[0].amount);
    }
  };

  if (!isOpen || !listing) return null;

  const scrollToBidding = () => {
    biddingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="relative h-96 bg-zinc-100 group">
          {listing.images?.[activeImageIndex] ? (
            <img src={listing.images[activeImageIndex]} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
              <Package size={80} strokeWidth={1} />
            </div>
          )}
          
          {listing.images && listing.images.length > 1 && (
            <>
              <button 
                onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : listing.images.length - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <button 
                onClick={() => setActiveImageIndex(prev => (prev < listing.images.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={20} />
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {listing.images.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute top-6 right-6 flex gap-2">
            {onToggleSave && (
              <button 
                onClick={onToggleSave}
                className={`p-2 rounded-full backdrop-blur-sm transition-all shadow-lg ${isSaved ? 'bg-emerald-600 text-white' : 'bg-white/80 hover:bg-white text-zinc-600'}`}
              >
                {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            )}
            <button onClick={onClose} className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {listing.images && listing.images.length > 1 && (
          <div className="flex gap-2 p-4 bg-zinc-50 border-b border-zinc-100 overflow-x-auto">
            {listing.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === activeImageIndex ? 'border-emerald-500' : 'border-transparent'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-widest rounded-full">
              {listing.category}
            </span>
            {listing.is_verified && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                <ShieldCheck size={14} /> AI Verified Listing
              </span>
            )}
            {listing.seller_verified && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                <ShieldCheck size={14} /> Verified Seller
              </span>
            )}
          </div>

          <div className="flex justify-between items-start gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-zinc-900">{listing.title}</h2>
                {listing.status === 'sold' && (
                  <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md">
                    SOLD
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <MapPin size={16} />
                <span className="text-sm">2.4 miles away • {listing.quantity} available</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-600">₦{highestBid || listing.price}</div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                {listing.price_type === 'fixed' ? 'Fixed Price' : (highestBid ? 'Current Bid' : 'Starting Bid')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="md:col-span-2 space-y-6">
              {listing.price_type === 'bidding' && (
                <BiddingSection listing={listing} user={user} onBidPlaced={fetchHighestBid} scrollRef={biddingRef} />
              )}
              
              <div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-3">Description</h3>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                  Quality Details: <span className="text-emerald-600">{listing.quality}</span>
                </h3>
                {listing.quality_notes ? (
                  <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap italic">"{listing.quality_notes}"</p>
                ) : (
                  <p className="text-zinc-400 text-sm italic">No additional quality notes provided.</p>
                )}
              </div>
              
              {listing.verification_notes && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ShieldCheck size={14} /> AI Audit Notes
                  </h3>
                  <p className="text-sm text-emerald-700 italic">"{listing.verification_notes}"</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-4">Seller Info</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center font-bold text-zinc-600">
                    {listing.seller_name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900">{listing.seller_name}</div>
                    <div className="text-xs text-zinc-500">Member since 2023</div>
                  </div>
                </div>
                <button className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition-all text-sm mb-2">
                  Contact Seller
                </button>
                <button 
                  onClick={() => alert('Reported listing #' + listing.id)}
                  className="w-full py-2 bg-zinc-100 text-zinc-400 hover:text-red-500 rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest"
                >
                  Report Listing
                </button>
              </div>
            </div>
          </div>

          <button 
            disabled={listing.status === 'sold'}
            onClick={listing.price_type === 'bidding' ? scrollToBidding : undefined}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl ${listing.status === 'sold' ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'}`}
          >
            {listing.status === 'sold' ? 'Item Sold' : (listing.price_type === 'fixed' ? 'Buy Now' : 'Place a Bid')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const KYCSection = ({ user, onUploaded }: { user: User, onUploaded: () => void }) => {
  const [file, setFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, documentUrl: file })
      });
      if (res.ok) {
        alert('KYC document uploaded successfully. Waiting for admin approval.');
        onUploaded();
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm mt-8">
      <h3 className="font-bold text-zinc-900 mb-4">Business Verification (KYC)</h3>
      <p className="text-sm text-zinc-500 mb-6">Upload your business license or ID to earn the "Verified Seller" badge and increase buyer trust.</p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div 
          className="w-full sm:w-48 h-32 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-50 overflow-hidden"
          onClick={() => document.getElementById('kyc-upload')?.click()}
        >
          {file ? (
            <img src={file} className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera size={24} className="text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Upload ID</span>
            </>
          )}
          <input 
            id="kyc-upload" 
            type="file" 
            className="hidden" 
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                const reader = new FileReader();
                reader.onloadend = () => setFile(reader.result as string);
                reader.readAsDataURL(f);
              }
            }} 
          />
        </div>
        <button 
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Submit for Review'}
        </button>
      </div>
    </div>
  );
};

const AdminKYCQueue = () => {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    const res = await fetch('/api/admin/kyc');
    const data = await res.json();
    setQueue(data);
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/kyc/${id}/${action}`, { method: 'POST' });
    if (res.ok) fetchQueue();
  };

  return (
    <div className="mt-12 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-100">
        <h3 className="font-bold text-zinc-900">KYC Verification Queue</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Document</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {queue.map(item => (
              <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-zinc-900">{item.first_name} {item.last_name}</div>
                  <div className="text-xs text-zinc-500">{item.email}</div>
                </td>
                <td className="px-6 py-4">
                  <a href={item.document_url} target="_blank" className="text-emerald-600 text-xs font-bold hover:underline">View Document</a>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">{new Date(item.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleAction(item.id, 'approve')} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Approve</button>
                  <button onClick={() => handleAction(item.id, 'reject')} className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-zinc-400 py-16 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
              <span className="text-xl font-bold tracking-tight text-white">EcoSwap</span>
            </div>
            <p className="text-sm leading-relaxed">
              Empowering the circular economy through a secure, transparent, and efficient marketplace for industrial waste and recycled materials.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Marketplace</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Browse Materials</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Sell Waste</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Verified Sellers</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Sustainability Report</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2026 EcoSwap Marketplace. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors"><Trash2 size={18} /></a>
            <a href="#" className="hover:text-white transition-colors"><ShieldCheck size={18} /></a>
            <a href="#" className="hover:text-white transition-colors"><Bell size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [quality, setQuality] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<'home' | 'browse' | 'dashboard'>('home');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [savedListingIds, setSavedListingIds] = useState<number[]>([]);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetchListings();
    if (user) {
      fetchSavedListings();
      fetchNotifications();
    }
  }, [category, sort, view, user, quality, minPrice, maxPrice, search]);

  const fetchNotifications = async () => {
    if (!user) return;
    const res = await fetch(`/api/notifications/${user.id}`);
    const data = await res.json();
    setNotifications(data);
  };

  const markNotificationRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    fetchNotifications();
  };

  const fetchSavedListings = async () => {
    if (!user) return;
    const res = await fetch(`/api/saved-listings/${user.id}`);
    const data = await res.json();
    setSavedListings(data);
    setSavedListingIds(data.map((l: Listing) => l.id));
  };

  const toggleSaveListing = async (listingId: number) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    
    const isSaved = savedListingIds.includes(listingId);
    if (isSaved) {
      await fetch(`/api/saved-listings/${user.id}/${listingId}`, { method: 'DELETE' });
      setSavedListingIds(prev => prev.filter(id => id !== listingId));
      setSavedListings(prev => prev.filter(l => l.id !== listingId));
    } else {
      await fetch('/api/saved-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, listingId })
      });
      setSavedListingIds(prev => [...prev, listingId]);
      // Refresh saved listings to get full data
      fetchSavedListings();
    }
  };

  const markAsSold = async (listingId: number) => {
    const res = await fetch(`/api/listings/${listingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'sold' })
    });
    if (res.ok) {
      fetchListings();
    }
  };

  const fetchListings = async () => {
    const params = new URLSearchParams();
    if (view === 'dashboard' && user?.role === 'seller') {
      params.append('sellerId', user.id.toString());
    } else {
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      if (search) params.append('search', search);
      if (quality) params.append('quality', quality);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
    }
    
    const res = await fetch(`/api/listings?${params.toString()}`);
    const data = await res.json();
    setListings(data);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setView('browse');
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Navbar 
        user={user} 
        notifications={notifications}
        onLogout={() => setUser(null)} 
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDashboard={() => setView('dashboard')}
        onMarkRead={markNotificationRead}
      />

      <main className="pt-16">
        {view === 'home' && (
          <>
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
              <div className="absolute inset-0 bg-emerald-600/5 -z-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.15),transparent_70%)]"></div>
              </div>
              <div className="max-w-7xl mx-auto px-4 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                    The Future of Recycling
                  </span>
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 mb-8 max-w-4xl mx-auto leading-[1.1]">
                    Turn Industrial Waste into <span className="text-emerald-600 italic">Sustainable Value</span>
                  </h1>
                  <p className="text-lg text-zinc-600 mb-10 max-w-2xl mx-auto">
                    The world's most secure marketplace for circular materials. Connect with verified sellers, track contamination levels, and optimize your supply chain.
                  </p>

                  <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                      <Search size={20} />
                    </div>
                    <input 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search for 'HDPE plastic', 'Cardboard', 'Copper'..."
                      className="w-full pl-14 pr-32 py-5 rounded-2xl bg-white border border-zinc-200 shadow-xl shadow-zinc-200/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-lg"
                    />
                    <button 
                      type="submit"
                      className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
                    >
                      Search <ArrowRight size={18} />
                    </button>
                  </form>

                  <div className="mt-12 flex items-center justify-center gap-8 text-zinc-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={20} />
                      <span className="text-sm font-medium">Verified Sellers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} />
                      <span className="text-sm font-medium">Quality Audited</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={20} />
                      <span className="text-sm font-medium">Local Logistics</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Featured Listings */}
            <section className="py-20 max-w-7xl mx-auto px-4">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-zinc-900 mb-2">Recent Listings</h2>
                  <p className="text-zinc-500">Discover high-quality materials available near you.</p>
                </div>
                <button 
                  onClick={() => setView('browse')}
                  className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:gap-3 transition-all"
                >
                  View all materials <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.slice(0, 8).map(listing => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    onClick={() => setSelectedListing(listing)}
                    isSaved={savedListingIds.includes(listing.id)}
                    onToggleSave={(e) => { e.stopPropagation(); toggleSaveListing(listing.id); }}
                  />
                ))}
              </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-zinc-900 mb-4">How EcoSwap Works</h2>
                  <p className="text-zinc-500 max-w-2xl mx-auto">Our platform streamlines the circular economy, making it easy to turn waste into resources through a secure and verified process.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                  {[
                    {
                      icon: <Plus className="text-emerald-600" size={32} />,
                      title: "1. List Material",
                      desc: "Sellers upload photos and details of their industrial waste. Our AI suggests categories instantly."
                    },
                    {
                      icon: <ShieldCheck className="text-emerald-600" size={32} />,
                      title: "2. AI Verification",
                      desc: "Every listing is audited by our AI to ensure quality standards and category accuracy."
                    },
                    {
                      icon: <Gavel className="text-emerald-600" size={32} />,
                      title: "3. Bid or Buy",
                      desc: "Buyers browse verified materials and place bids or purchase at fixed prices securely."
                    },
                    {
                      icon: <Truck className="text-emerald-600" size={32} />,
                      title: "4. Secure Exchange",
                      desc: "Coordinate logistics and complete the transaction with confidence through our verified network."
                    }
                  ].map((step, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        {step.icon}
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">{step.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                      {idx < 3 && (
                        <div className="hidden md:block absolute top-8 -right-6 text-zinc-200">
                          <ArrowRight size={24} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Categories Section with Images */}
            <section className="py-20 bg-zinc-100/50">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-zinc-900 mb-4">Industrial Categories</h2>
                  <p className="text-zinc-500 max-w-2xl mx-auto">We specialize in high-volume industrial waste streams, ensuring materials are diverted from landfills and back into production.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { title: 'Plastic Polymers', img: 'https://picsum.photos/seed/plastic/800/600 src/assets/plastic.jpg', desc: 'PET, HDPE, LDPE, and PP flakes or bales.' },
                    { title: 'Metal Alloys', img: 'https://picsum.photos/seed/metal/800/600', desc: 'Copper, Aluminum, and Steel scrap materials.' },
                    { title: 'Paper & Fiber', img: 'https://picsum.photos/seed/paper/800/600', desc: 'Corrugated cardboard and high-grade office paper.' }
                  ].map((cat, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="group relative h-80 rounded-3xl overflow-hidden shadow-lg cursor-pointer"
                    >
                      <img 
                        src={cat.img} 
                        alt={cat.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                        <h3 className="text-xl font-bold text-white mb-2">{cat.title}</h3>
                        <p className="text-zinc-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">{cat.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'browse' && (
          <div className="max-w-7xl mx-auto px-4 py-12 flex gap-8">
            {/* Sidebar Filters */}
            <aside className="hidden lg:block w-64 shrink-0 space-y-8">
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Categories</h3>
                <div className="space-y-2">
                  {['All', 'Plastic', 'Metal', 'Paper', 'Organic', 'Electronic', 'Glass'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setCategory(c === 'All' ? '' : c)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${category === (c === 'All' ? '' : c) ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Quality Grade</h3>
                <div className="space-y-2">
                  {['All', 'Sorted/Clean', 'Unsorted/Mixed', 'Industrial Grade', 'Raw/Contaminated'].map(q => (
                    <button 
                      key={q}
                      onClick={() => setQuality(q === 'All' ? '' : q)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${quality === (q === 'All' ? '' : q) ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Price Range (₦)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Sort By</h3>
                <select 
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>

              <button 
                onClick={() => {setCategory(''); setQuality(''); setMinPrice(''); setMaxPrice(''); setSearch('');}}
                className="w-full py-2 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-emerald-600 transition-colors border border-zinc-200 rounded-lg"
              >
                Reset All Filters
              </button>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-8 space-y-6">
                <form onSubmit={handleSearch} className="relative group max-w-md">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                    <Search size={18} />
                  </div>
                  <input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search materials..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                  />
                </form>

                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-zinc-900">
                    {search ? `Results for "${search}"` : (category || 'All Materials')}
                    <span className="ml-2 text-sm font-medium text-zinc-400">({listings.length} items)</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <button className="lg:hidden p-2 border border-zinc-200 rounded-lg text-zinc-600">
                      <Filter size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map(listing => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      onClick={() => setSelectedListing(listing)}
                      isSaved={savedListingIds.includes(listing.id)}
                      onToggleSave={(e) => { e.stopPropagation(); toggleSaveListing(listing.id); }}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-1">No results found</h3>
                  <p className="text-zinc-500">Try adjusting your filters or search keywords.</p>
                  <button 
                    onClick={() => {setCategory(''); setQuality(''); setMinPrice(''); setMaxPrice(''); setSearch('');}}
                    className="mt-6 text-sm font-bold text-emerald-600"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'dashboard' && user && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 mb-2">My Dashboard</h1>
                <p className="text-zinc-500">Welcome back, {user.firstName}. Manage your {user.role} activities.</p>
              </div>
              {user.role === 'seller' && (
                <button 
                  onClick={() => setIsCreateOpen(true)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Plus size={20} /> Create Listing
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Stats */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-zinc-400">
                  <Package size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Active Listings</span>
                </div>
                <div className="text-4xl font-bold text-zinc-900">
                  {listings.filter(l => l.seller_id === user.id && l.status === 'active').length}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-zinc-400">
                  <CheckCircle size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Completed Sales</span>
                </div>
                <div className="text-4xl font-bold text-zinc-900">
                  {listings.filter(l => l.seller_id === user.id && l.status === 'sold').length}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-zinc-400">
                  <ShieldCheck size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Verification Status</span>
                </div>
                <div className={`text-xl font-bold ${user.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {user.isVerified ? 'Verified Business' : 'Pending Verification'}
                </div>
              </div>
            </div>

            {user.role === 'seller' && !user.isVerified && (
              <KYCSection user={user} onUploaded={() => {}} />
            )}

            {user.role === 'admin' && (
              <AdminKYCQueue />
            )}

            {user.role === 'seller' && (
              <div className="mt-12">
                <h3 className="font-bold text-zinc-900 mb-6">My Listings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.filter(l => l.seller_id === user.id).map(listing => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      onClick={() => setSelectedListing(listing)}
                      isSaved={savedListingIds.includes(listing.id)}
                      onToggleSave={(e) => { e.stopPropagation(); toggleSaveListing(listing.id); }}
                      onMarkAsSold={(e) => { e.stopPropagation(); markAsSold(listing.id); }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12">
              <h3 className="font-bold text-zinc-900 mb-6">Saved Listings</h3>
              {savedListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedListings.map(listing => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      onClick={() => setSelectedListing(listing)}
                      isSaved={true}
                      onToggleSave={(e) => { e.stopPropagation(); toggleSaveListing(listing.id); }}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-zinc-200 text-center">
                  <Bookmark size={48} className="mx-auto text-zinc-200 mb-4" />
                  <p className="text-zinc-500">You haven't saved any listings yet.</p>
                  <button onClick={() => setView('browse')} className="mt-4 text-emerald-600 font-bold hover:underline">Browse Marketplace</button>
                </div>
              )}
            </div>

            {/* Recent Activity Table */}
            <div className="mt-12 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900">Recent Transactions</h3>
                <button className="text-sm font-bold text-emerald-600">View all</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[1, 2, 3].map(i => (
                      <tr key={i} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-900">Clean PET Flakes (Batch #{i}04)</td>
                        <td className="px-6 py-4 text-sm text-zinc-500">Oct 2{i}, 2023</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md uppercase">Completed</span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-zinc-900">₦1,240.00</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={setUser} 
      />
      <ListingDetailModal 
        isOpen={!!selectedListing} 
        listing={selectedListing} 
        onClose={() => setSelectedListing(null)} 
        isSaved={selectedListing ? savedListingIds.includes(selectedListing.id) : false}
        onToggleSave={() => selectedListing && toggleSaveListing(selectedListing.id)}
        user={user}
      />
      {user && (
        <CreateListingModal 
          isOpen={isCreateOpen} 
          onClose={() => setIsCreateOpen(false)} 
          user={user}
          onCreated={fetchListings}
        />
      )}

      {/* Floating Action Button for Mobile */}
      {user?.role === 'seller' && view !== 'dashboard' && (
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
