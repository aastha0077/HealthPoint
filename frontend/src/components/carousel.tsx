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

const SLIDES = [
  {
    id: 0,
    title: "Public Lumbini United Hospital",
    description: "Your trusted healthcare partner in Gulmi. Dedicated to providing world-class medical services to our community.",
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
  },
  {
    id: 3,
    title: "Digital Lab Reports",
    description: "Review your test results online as soon as they are ready. Fast and secure.",
    image: "https://images.unsplash.com/photo-1579154234431-da0560a75dc0?w=1600&h=900&fit=crop",
    cta: "View Lab Results",
    link: "/lab-report",
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
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl space-y-6">
                  <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-slate-200 text-lg md:text-xl font-medium">
                    {slide.description}
                  </p>
                  <div className="pt-4">
                    <Link
                      to={slide.link}
                      className="inline-flex items-center gap-2 bg-rose-600 text-white px-8 py-4 rounded-xl hover:bg-rose-700 font-bold text-lg shadow-lg transition-all"
                    >
                      {slide.cta}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
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
