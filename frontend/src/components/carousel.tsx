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

  return (
    <div className="flex justify-center items-center">
      <Carousel setApi={setApi} className="w-full max-w-2xl   ">
        <CarouselContent>
          <CarouselItem className="flex justify-center">
            <img src={image2} className="object-contain w-full h-auto" alt="" />
          </CarouselItem>
          <CarouselItem className="flex justify-center">
            <img src={image} className="object-contain w-full h-auto" alt="" />
          </CarouselItem>
          <CarouselItem className="flex justify-center">
            <img src={image} className="object-contain w-full h-auto" alt="" />
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

export { CarouselCard };
