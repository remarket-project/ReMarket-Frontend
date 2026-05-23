import {
  BellRing,
  Handshake,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { type PointerEventHandler, useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/Common/LanguageSwitcher";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const authSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80",
    icon: ShieldCheck,
    title: "Escrow giữ tiền an toàn",
    desc: "Tiền được khóa cho đến khi đơn hàng được xác nhận đúng mô tả.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1600&q=80",
    icon: Handshake,
    title: "Đề xuất và thương lượng linh hoạt",
    desc: "Gửi đề xuất, phản đề xuất và chốt giá trực tiếp trên từng tin đăng.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=1600&q=80",
    icon: Wallet,
    title: "Ví thông minh cập nhật theo thời gian thực",
    desc: "Số dư, dòng tiền và trạng thái giải ngân hiển thị tức thì, minh bạch.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
    icon: BellRing,
    title: "Thông báo thời gian thực",
    desc: "Nhận ngay cập nhật đơn hàng, đề xuất và thay đổi trạng thái giao dịch.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    icon: Sparkles,
    title: "KYC, đánh giá và điểm uy tín",
    desc: "Xác thực danh tính và lịch sử đánh giá giúp bạn chọn đúng người giao dịch.",
  },
] as const;

export function AuthLayout({ children }: AuthLayoutProps) {
  const [visualIndex, setVisualIndex] = useState(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [allowTransition, setAllowTransition] = useState(true);
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    dragging: false,
    startX: 0,
    pointerId: -1,
  });

  const slideCount = authSlides.length;
  const loopSlides = [authSlides[slideCount - 1], ...authSlides, authSlides[0]];
  const activeSlide = (visualIndex - 1 + slideCount) % slideCount;
  const resolvedWidth = sliderWidth > 0 ? Math.round(sliderWidth) : 0;

  const goToPreviousSlide = () => {
    setAllowTransition(true);
    setVisualIndex((prev) => (prev <= 0 ? 0 : prev - 1));
  };

  const goToNextSlide = () => {
    setAllowTransition(true);
    setVisualIndex((prev) =>
      prev >= slideCount + 1 ? slideCount + 1 : prev + 1,
    );
  };

  useEffect(() => {
    const element = sliderRef.current;
    if (!element) return;

    const updateWidth = () => {
      setSliderWidth(element.clientWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (allowTransition) return;

    const raf = window.requestAnimationFrame(() => {
      setAllowTransition(true);
    });

    return () => window.cancelAnimationFrame(raf);
  }, [allowTransition]);

  useEffect(() => {
    if (isDragging) return;

    const timer = window.setInterval(() => {
      goToNextSlide();
    }, 4600);

    return () => window.clearInterval(timer);
  }, [isDragging, goToNextSlide]);

  const handleTrackTransitionEnd = () => {
    if (visualIndex <= 0) {
      setAllowTransition(false);
      setVisualIndex(slideCount);
      return;
    }

    if (visualIndex >= slideCount + 1) {
      setAllowTransition(false);
      setVisualIndex(1);
    }
  };

  const onSliderPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    dragStateRef.current.dragging = true;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.pointerId = event.pointerId;
    setIsDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onSliderPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!dragStateRef.current.dragging) return;
    setDragOffset(event.clientX - dragStateRef.current.startX);
  };

  const finishDrag = (deltaX: number) => {
    const threshold = 70;

    if (deltaX <= -threshold) {
      goToNextSlide();
    } else if (deltaX >= threshold) {
      goToPreviousSlide();
    }

    setDragOffset(0);
    setIsDragging(false);
    dragStateRef.current.dragging = false;
    dragStateRef.current.pointerId = -1;
  };

  const onSliderPointerUp: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!dragStateRef.current.dragging) return;
    const deltaX = event.clientX - dragStateRef.current.startX;
    finishDrag(deltaX);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onSliderPointerCancel: PointerEventHandler<HTMLDivElement> = () => {
    if (!dragStateRef.current.dragging) return;
    finishDrag(0);
  };

  const onSliderPointerLeave: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!dragStateRef.current.dragging) return;
    if (dragStateRef.current.pointerId !== event.pointerId) return;
    finishDrag(event.clientX - dragStateRef.current.startX);
  };

  return (
    <div className="rmk-auth-shell relative isolate grid h-svh w-screen overflow-hidden lg:grid-cols-2">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <div className="rmk-auth-showcase relative hidden px-10 py-10 lg:flex lg:flex-col">
        <div className="rmk-auth-showcase-orb-a" />
        <div className="rmk-auth-showcase-orb-b" />

        <div className="relative z-10 flex h-full flex-col gap-6">
          <div className="space-y-3">
            <div className="rmk-auth-brand-row">
              <span className="rmk-auth-logo-frame">
                <img
                  src="/assets/images/logo_Remarket_2.png"
                  alt="Logo ReMarket"
                  className="rmk-auth-logo-image"
                  loading="eager"
                  decoding="sync"
                />
              </span>
              <h2 className="rmk-auth-brand-title">ReMarket</h2>
            </div>

            <p className="rmk-auth-kicker">NỀN TẢNG GIAO DỊCH AN TOÀN</p>
            <p className="rmk-auth-brief">
              ReMarket giúp bạn mua bán đồ đã qua sử dụng một cách minh bạch,
              nhanh và an tâm.
            </p>
          </div>

          <div
            className={`rmk-auth-stage rmk-auth-slider ${isDragging ? "is-dragging" : ""}`}
            aria-hidden="true"
            onPointerDown={onSliderPointerDown}
            onPointerMove={onSliderPointerMove}
            onPointerUp={onSliderPointerUp}
            onPointerCancel={onSliderPointerCancel}
            onPointerLeave={onSliderPointerLeave}
          >
            <span className="rmk-auth-stage-grid" />
            <span className="rmk-auth-stage-ring" />
            <span className="rmk-auth-stage-beam" />
            <span className="rmk-auth-stage-glow" />

            <div ref={sliderRef} className="rmk-auth-slider-viewport">
              <div
                className="rmk-auth-slider-track"
                onTransitionEnd={handleTrackTransitionEnd}
                style={{
                  transform:
                    resolvedWidth > 0
                      ? `translate3d(${-(visualIndex * resolvedWidth) + dragOffset}px, 0, 0)`
                      : `translateX(calc(${-visualIndex * 100}% + ${dragOffset}px))`,
                  transition:
                    !allowTransition || isDragging
                      ? "none"
                      : "transform 680ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {loopSlides.map((slide, index) => {
                  const Icon = slide.icon;
                  const active = index === visualIndex;

                  return (
                    <div
                      key={`${slide.title}-${index}`}
                      className={`rmk-auth-slide ${active ? "is-active" : ""}`}
                    >
                      <img
                        src={slide.image}
                        alt=""
                        className="rmk-auth-slide-image"
                      />

                      <div
                        className={`rmk-auth-slide-popup ${active ? "is-active" : ""}`}
                      >
                        <span className="rmk-auth-slide-icon">
                          <Icon className="size-4" />
                        </span>
                        <div className="space-y-1">
                          <p className="rmk-auth-slide-title">{slide.title}</p>
                          <p className="rmk-auth-slide-desc">{slide.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rmk-auth-slide-dots">
              {authSlides.map((slide, index) => (
                <button
                  type="button"
                  key={`${slide.title}-dot`}
                  aria-label={slide.title}
                  onClick={() => {
                    setAllowTransition(true);
                    setVisualIndex(index + 1);
                    setDragOffset(0);
                  }}
                  className={`rmk-auth-slide-dot ${index === activeSlide ? "is-active" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rmk-auth-main flex h-full flex-col gap-4 overflow-hidden p-5 md:p-8">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="rmk-auth-card w-full max-w-md rounded-2xl p-6 md:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
