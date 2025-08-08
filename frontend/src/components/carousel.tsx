import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import React from "react";
import image from "../assets/image.png";
import image2 from "../assets/24-7.jpg";

function CarouselCard() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Auto-slide functionality
  React.useEffect(() => {
    if (!api) {
      return;
    }

    const autoSlide = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        // Go back to first slide when reaching the end
        api.scrollTo(0);
      }
    }, 4000); // Auto-slide every 4 seconds

    return () => clearInterval(autoSlide);
  }, [api]);

  return (
    <div className="flex justify-center items-center">
      <Carousel setApi={setApi} className="w-full max-w-2xl">
        <CarouselContent>
          <CarouselItem className="flex justify-center">
            <img
              src={image2}
              className="object-contain w-full h-auto"
              alt="Hospital Service 1"
            />
          </CarouselItem>
          <CarouselItem className="flex justify-center">
            <img
              src={image}
              className="object-contain w-full h-auto"
              alt="Hospital Service 2"
            />
          </CarouselItem>
          <CarouselItem className="flex justify-center">
            <img
              src={image}
              className="object-contain w-full h-auto"
              alt="Hospital Service 3"
            />
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />

        {/* Slide indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === current - 1 ? "bg-red-600" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}

export { CarouselCard };
