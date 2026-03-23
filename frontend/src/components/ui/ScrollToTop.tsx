import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    // Detect if we are near the bottom or have scrolled a significant amount
    const scrolled = window.scrollY;
    const viewportHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;
    
    // Show when scrolled more than 400px OR when reaching near bottom
    if (scrolled > 400 || (fullHeight - (scrolled + viewportHeight) < 100)) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top scroll behavior
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      <button
        type="button"
        onClick={scrollToTop}
        className={`
          flex items-center justify-center
          w-12 h-12 rounded-full 
          bg-rose-600 text-white 
          shadow-2xl shadow-rose-500/40
          hover:bg-rose-700 hover:-translate-y-1
          active:scale-95
          transition-all duration-300 ease-out
          border border-rose-500/20
          ${isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-10 pointer-events-none"}
        `}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6 stroke-[3px]" />
      </button>
    </div>
  );
}
