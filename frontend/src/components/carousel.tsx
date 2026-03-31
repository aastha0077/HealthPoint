import { useState, useEffect, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    id: 0,
    title: "HealthPoint Medical Center",
    description: "Your trusted healthcare partner. Dedicated to providing world-class medical services to our community.",
    image: "https://images.unsplash.com/photo-1512678193727-b710ac83a303?w=1600&h=900&fit=crop",
    cta: "Contact Us",
    link: "/contact",
  },
  {
    id: 1,
    title: "Instant Online Appointments",
    description: "Skip the queue. Book your consultation with top specialists in just a few clicks.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&h=900&fit=crop",
    cta: "Book Online Now",
    link: "/appointment",
  },
  {
    id: 2,
    title: "World Class Medical Experts",
    description: "Access the best doctors and advanced cardiac care center in the Lumbini region.",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1600&h=900&fit=crop",
    cta: "Explore Services",
    link: "/services",
  }
];

function CarouselCard() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Auto-play
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="relative w-full bg-slate-100 group">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        className="w-full h-[500px] md:h-[600px] overflow-hidden"
      >
        <CarouselContent className="-ml-0">
          {SLIDES.map((slide) => (
            <CarouselItem key={slide.id} className="relative pl-0 h-[500px] md:h-[600px] flex items-center">
              <img
                src={slide.image}
                className="absolute inset-0 w-full h-full object-cover"
                alt={slide.title}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent" />

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <AnimatePresence mode="wait">
                  {current === slide.id && (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="max-w-xl space-y-6"
                    >
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-block px-3 py-1 bg-rose-500/20 text-rose-300 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest border border-rose-500/30"
                      >
                        HealthPoint Exclusive
                      </motion.div>
                      <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
                        {slide.title}
                      </h2>
                      <p className="text-slate-200 text-lg md:text-xl font-medium drop-shadow-md">
                        {slide.description}
                      </p>
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 0.4 }}
                        className="pt-4"
                      >
                        <Link
                          to={slide.link}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-700 text-white px-8 py-4 rounded-full hover:from-rose-600 hover:to-rose-800 font-bold text-lg shadow-[0_0_40px_-10px_rgba(225,29,72,0.8)] transition-all hover:scale-105 active:scale-95"
                        >
                          {slide.cta}
                          <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Custom Navigation buttons (visible on hover) */}
        <button
          onClick={() => api?.scrollPrev()}
          className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white flex items-center justify-center hover:bg-rose-600 hover:border-rose-600 transition-all opacity-0 group-hover:opacity-100 hidden md:flex z-20"
        >
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <button
          onClick={() => api?.scrollNext()}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white flex items-center justify-center hover:bg-rose-600 hover:border-rose-600 transition-all opacity-0 group-hover:opacity-100 hidden md:flex z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Refined Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => api?.scrollTo(idx)}
              className={`transition-all duration-300 h-2 rounded-full ${idx === current ? "w-8 bg-white" : "w-2 bg-white/40"
                }`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}

export { CarouselCard };
