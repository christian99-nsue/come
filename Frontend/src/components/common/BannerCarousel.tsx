import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import burger from "../../assets/banner23.png";
import pizza from "../../assets/pizza.png";
import delivery from "../../assets/repartidor-logo-1.png";

interface BannerItem {
  id: string;
  title: string[];
  subtitle: string;
  buttonText: string;
  destino: string;
  emoji: React.ReactNode;
  bgColor: string;
}

// Cada banner promete algo que la lista a la que lleva realmente cumple
const banners: BannerItem[] = [
  {
    id: "banner-1",
    title: ["Comida rápida,", "entrega rápida"],
    subtitle: "Tus restaurantes favoritos en minutos",
    buttonText: "Ver restaurantes",
    destino: "/cliente/restaurantes",
    emoji: <img src={burger} alt="" />,
    bgColor: "#d9f7e3",
  },
  {
    id: "banner-2",
    title: ["Abiertos ahora"],
    subtitle: "Restaurantes que están recibiendo pedidos.",
    buttonText: "Pedir ahora",
    destino: "/cliente/restaurantes?filtro=abierto",
    emoji: <img src={pizza} alt="" />,
    bgColor: "#dbeafe",
  },
  {
    id: "banner-3",
    title: ["Entrega rápida"],
    subtitle: "Entrega estimada en 30 minutos o menos.",
    buttonText: "Explorar",
    destino: "/cliente/restaurantes?filtro=entrega_rapida",
    emoji: <img src={delivery} alt="" />,
    bgColor: "#fef3c7",
  },
];

const AUTO_ADVANCE_MS = 4000;
const SWIPE_THRESHOLD = 40;

export default function BannerCarousel() {
  const navigate = useNavigate();
  const total = banners.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + banners.length) % banners.length);
  }, []);

  const startAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);

    // Con "reducir movimiento" (o si el dispositivo lo pide) el carrusel no avanza solo
    const reducir =
      document.documentElement.hasAttribute("data-cliente-reduce") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducir) return;

    autoAdvanceTimer.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, AUTO_ADVANCE_MS);
  }, []);

  useEffect(() => {
    startAutoAdvance();
    return () => {
      if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);
    };
  }, [startAutoAdvance]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > SWIPE_THRESHOLD)
      goTo(activeIndex + 1); // deslizó a la izquierda
    else if (diff < -SWIPE_THRESHOLD) goTo(activeIndex - 1); // deslizó a la derecha

    startAutoAdvance();
    touchStartX.current = null;
  };

  return (
    <div className="banner-carousel">
      {/* El recorte vive aquí para que no se asomen los banners vecinos */}
      <div style={{ overflow: "hidden", borderRadius: 18 }}>
        <div
          className="banner-track"
          style={{
            display: "flex",
            width: `${total * 100}%`,
            transform: `translateX(-${(activeIndex * 100) / total}%)`,
            transition: "transform 0.35s ease",
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
                flex: `0 0 ${100 / total}%`,
                width: `${100 / total}%`,
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
                  onClick={() => navigate(banner.destino)}
                >
                  {banner.buttonText}
                </button>
              </div>

              <div className="banner-visual">
                <span className="banner-emoji">{banner.emoji}</span>
              </div>
            </div>
          ))}
        </div>
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
              startAutoAdvance();
            }}
          />
        ))}
      </div>
    </div>
  );
}
