"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Loader2 } from "lucide-react"
import { subscribeToHeroConfig, type HeroConfig } from "@/lib/firebase-store-config"

export function HeroSection() {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<HeroConfig | null>(null)

  useEffect(() => {
    const unsub = subscribeToHeroConfig((data) => {
      setConfig(data)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center pt-28 md:pt-32 pb-16 md:pb-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    )
  }

  if (!config?.enabled) {
    return null
  }

  return (
    <section className="relative min-h-[100svh] flex items-center pt-28 md:pt-32 pb-8 md:pb-20 overflow-hidden">
      {/* Background decorative elements - Smaller on mobile */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-0 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-0 md:right-10 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-secondary rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content - Mobile-first text sizing */}
          <div className="text-center lg:text-left space-y-5 md:space-y-8 order-2 lg:order-1">
            {config.badge && (
              <div className="inline-flex items-center gap-2 bg-secondary px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                <span className="text-secondary-foreground">{config.badge}</span>
              </div>
            )}

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-foreground">
              {config.title}
              <span className="block text-primary italic">{config.titleHighlight}</span>
            </h2>

            <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
              {config.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="rounded-full px-6 md:px-8 text-sm md:text-base group h-12 md:h-14 w-full sm:w-auto"
              >
                Ver Coleção
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-6 md:px-8 text-sm md:text-base bg-transparent h-12 md:h-14 w-full sm:w-auto"
              >
                Shop the Look
              </Button>
            </div>

            {/* Stats - Horizontal scroll on mobile */}
            <div className="flex items-center justify-center lg:justify-start gap-4 md:gap-8 pt-6 md:pt-8 overflow-x-auto hide-scrollbar">
              <div className="text-center flex-shrink-0">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{config.stat1Value}</div>
                <div className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">{config.stat1Label}</div>
              </div>
              <div className="w-px h-10 md:h-12 bg-border flex-shrink-0" />
              <div className="text-center flex-shrink-0">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{config.stat2Value}</div>
                <div className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">{config.stat2Label}</div>
              </div>
              <div className="w-px h-10 md:h-12 bg-border flex-shrink-0" />
              <div className="text-center flex-shrink-0">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{config.stat3Value}</div>
                <div className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">{config.stat3Label}</div>
              </div>
            </div>
          </div>

          {/* Hero Image - Better mobile sizing */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[3/4] max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
              {/* Main image frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2rem] md:rounded-[3rem] rotate-3" />
              <div className="absolute inset-0 bg-card rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden -rotate-2">
                <img
                  src={config.mainImage || "/images/photo-2025-12-21-21-01-36.jpg"}
                  alt="Modelo usando biquíni da coleção verão"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Floating cards - Hidden on small mobile, smaller on medium */}
              <div className="absolute -left-2 md:-left-8 top-1/4 bg-card p-2.5 md:p-4 rounded-xl md:rounded-2xl shadow-xl animate-float hidden sm:block">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-semibold text-foreground">Novidades</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">Chegaram</div>
                  </div>
                </div>
              </div>

              {config.discountText && (
                <div className="absolute -bottom-2 md:-bottom-4 left-1/4 bg-primary text-primary-foreground p-2.5 md:p-4 rounded-xl md:rounded-2xl shadow-xl">
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold">{config.discountText}</div>
                    <div className="text-[10px] md:text-xs uppercase tracking-wide">{config.discountSubtext}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
