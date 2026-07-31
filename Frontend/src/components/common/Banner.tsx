import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import banner from "../../assets/banner23.png";
import pizza from "../../assets/pizza.png";
import { Star } from "lucide-react";

interface BannerItem {
  id: string;
  title: string[];
  subtitle: string;
  buttonText: string;
  onButtonClick?: () => void;
  visual: { type: "image"; src: string } | { type: "icono"; value: ReactNode };
  bgColor?: string;
}

const banners: BannerItem[] = [
  {
    id: "banner-1",
    title: ["Comida rapida,", "entrega rapida"],
    subtitle: "Tus restaurantes favoritos en minutos",
    buttonText: "Ver restaurantes",
    visual: {
      type: "image",
      src: banner,
    },
    bgColor: "#d9f7e3",
  },
  {
    id: "banner-2",
    title: ["Envío gratuito"],
    subtitle: "Durante hoy.",
    buttonText: "Pedir ahora",
    visual: { type: "image", src: pizza },
    bgColor: "#dbeafe",
  },
  {
    id: "banner-3",
    title: ["Restaurantes destacados"],
    subtitle: "Los mejores valorados.",
    buttonText: "Explorar",
    visual: {
      type: "icono",
      value: <Star color="#f8c822" fill="#f8c822" size={70} />,
    },
    bgColor: "#fef3c7",
  },
];

const AUTO_ADVANCE_MS = 4000;

export default function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    const total = banners.length;
    const next = (index + total) % total;
    setActiveIndex(next);
  }, []);

  // Auto-avance
  useEffect(() => {
    autoAdvanceTimer.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, AUTO_ADVANCE_MS);

    return () => {
      if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);
    };
  }, []);

  const resetAutoAdvance = () => {
    if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, AUTO_ADVANCE_MS);
  };

  // Swipe táctil
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const SWIPE_THRESHOLD = 40;

    if (diff > SWIPE_THRESHOLD) {
      goTo(activeIndex + 1);
    } else if (diff < -SWIPE_THRESHOLD) {
      goTo(activeIndex - 1);
    }
    resetAutoAdvance();
    isDragging.current = false;
    touchStartX.current = null;
  };

  return (
    <div className="banner-carousel">
      <div
        className="banner-track"
        ref={trackRef}
        style={{
          width: `${banners.length * 100}%`,
          transform: `translateX(-${(activeIndex * 100) / banners.length}%)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="banner-slide"
            style={{
              backgroundColor: banner.bgColor,
              width: `${100 / banners.length}%`,
            }}
          >
            <div className="banner-text">
              <h2 className="banner-title">
                {banner.title.map((line, i) => (
                  <span key={i}>
                    {i === banner.title.length - 1 &&
                    banner.title.length > 1 ? (
                      <span className="banner-title-accent">{line}</span>
                    ) : (
                      line
                    )}
                    {i < banner.title.length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="banner-subtitle">{banner.subtitle}</p>
              <button
                type="button"
                className="banner-btn"
                onClick={banner.onButtonClick}
              >
                {banner.buttonText}
              </button>
            </div>

            <div className="banner-visual">
              {banner.visual.type === "image" ? (
                <img src={banner.visual.src} alt="" className="banner-img" />
              ) : (
                <span className="banner-emoji">{banner.visual.value}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="banner-dots">
        {banners.map((banner, i) => (
          <button
            key={banner.id}
            type="button"
            className={i === activeIndex ? "banner-dot active" : "banner-dot"}
            aria-label={`Ir al banner ${i + 1}`}
            onClick={() => {
              goTo(i);
              resetAutoAdvance();
            }}
          />
        ))}
      </div>
    </div>
  );
}
