import { motion } from 'motion/react';
import { ShoppingBag, Store, Search, MapPin, Star, Sparkles } from 'lucide-react';

const shops = [
  {
    id: 1,
    name: "Catarman Crafts",
    category: "Gifts",
    rating: 4.8,
    image: "https://picsum.photos/seed/local-souvenirs-crafts/800/600",
    description: "Best local crafts and delicacies from the heart of Catarman."
  },
  {
    id: 2,
    name: "Municipal Public Market",
    category: "Market",
    rating: 4.5,
    image: "https://picsum.photos/seed/tropical-market-fruits/800/600",
    description: "Fresh produce and local street food node."
  },
  {
    id: 3,
    name: "Island Node Boutique",
    category: "Apparel",
    rating: 4.7,
    image: "https://picsum.photos/seed/surf-shop-beach/800/600",
    description: "Verified island wear and gear."
  }
];

export default function ShopsView() {
  return (
    <div className="bg-[#FDFDFB] min-h-screen pb-40 selection:bg-island-emerald/20">
      {/* Header */}
      <section className="relative h-[45vh] flex items-center overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src="https://img.atlasobscura.com/CmlPBCqrdngS4DE4q_DDyDdVYBjhcSTHrsI9PUEbvkQ/rs:fill:780:520:1/g:ce/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl//X2ltYWdlcy85OTA0/ZjhlMDJiMGM0ODM5/NWJfU3Vua2VuX0Nl/bWV0ZXJ5LF9DYXRh/cm1hbixfQ2FtaWd1/aW4uanBn.jpg" 
          alt="Catarman Marketplace" 
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-island-volcanic/60 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,44,34,0.4)_100%)]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-3xl px-6 py-2 rounded-full border border-white/20 w-fit mb-8">
              <ShoppingBag size={16} className="text-island-emerald" />
              <span className="text-white font-black uppercase tracking-[0.4em] text-[10px]">Municipal Retail Nodes</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-bold text-white mb-8 tracking-tighter leading-none drop-shadow-2xl">
              Island <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-emerald-200">Shops.</span>
            </h1>
            <p className="text-2xl text-emerald-50/70 font-semibold max-w-2xl leading-relaxed">
              Discover authentic Catarman crafts, local delicacies, and verified island gear.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-40">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-1 bg-island-emerald rounded-full"></div>
              <span className="text-island-emerald font-black uppercase tracking-[0.5em] text-[10px]">Catarman Catalog</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-bold text-island-volcanic tracking-tighter leading-none">Verified <span className="italic font-serif font-light text-island-green">Nodes.</span></h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {shops.map((shop, idx) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="group bg-white rounded-[4rem] overflow-hidden border-2 border-emerald-50 shadow-[0_20px_50px_-12px_rgba(6,78,59,0.08)] hover:shadow-[0_40px_100px_-20px_rgba(6,78,59,0.15)] transition-all duration-700 p-6"
            >
              <div className="aspect-[4/3] rounded-[3rem] overflow-hidden relative mb-10">
                <img 
                  src={shop.image} 
                  alt={shop.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-8 right-8 px-5 py-2.5 bg-white/95 backdrop-blur-xl rounded-2xl text-[10px] font-black text-island-volcanic uppercase tracking-[0.2em] shadow-2xl border border-white">
                  {shop.category}
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-bold text-island-volcanic tracking-tighter group-hover:text-island-emerald transition-colors">{shop.name}</h3>
                  <div className="flex items-center gap-2 text-island-emerald font-black text-base">
                    <Star size={20} fill="currentColor" />
                    {shop.rating}
                  </div>
                </div>
                <p className="text-slate-500 font-medium text-lg mb-12 leading-relaxed">{shop.description}</p>
                <button className="btn-volcanic w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 shadow-xl shadow-emerald-900/10">
                  <MapPin size={22} strokeWidth={3} />
                  Execute Navigation
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
