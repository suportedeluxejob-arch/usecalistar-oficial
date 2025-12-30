"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, Heart, Menu, X, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { totalItems, openCart } = useCart()
  const { totalFavorites } = useFavorites()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border safe-top">
      {/* Announcement Bar - Smaller text on mobile */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 md:py-2 text-xs md:text-sm tracking-wider px-4">
        <span className="font-light">FRETE GRÁTIS</span> em compras acima de R$299
      </div>

      <nav className="w-full px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
          {/* Mobile Menu Button - Larger touch target */}
          <button
            className="lg:hidden p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo - Responsive sizing */}
          <Link href="/" className="flex-1 lg:flex-none text-center lg:text-left min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground truncate">
              usecalistar
            </h1>
            <span className="text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] text-muted-foreground uppercase hidden sm:block">
              Bikini Collection
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
            <Link
              href="/#novidades"
              className="text-sm tracking-wide hover:text-primary transition-colors uppercase font-medium whitespace-nowrap"
            >
              Novidades
            </Link>
            <Link
              href="/categoria/conjuntos"
              className="text-sm tracking-wide hover:text-primary transition-colors uppercase font-medium whitespace-nowrap"
            >
              Conjuntos
            </Link>
            <Link
              href="/categoria/tops"
              className="text-sm tracking-wide hover:text-primary transition-colors uppercase font-medium whitespace-nowrap"
            >
              Tops
            </Link>
            <Link
              href="/categoria/calcinhas"
              className="text-sm tracking-wide hover:text-primary transition-colors uppercase font-medium whitespace-nowrap"
            >
              Calcinhas
            </Link>
            <Link
              href="/nossa-historia"
              className="text-sm tracking-wide hover:text-primary transition-colors uppercase font-medium whitespace-nowrap"
            >
              Nossa História
            </Link>
          </div>

          {/* Actions - Larger touch targets */}
          <div className="flex items-center gap-0.5 md:gap-1">
            <Button variant="ghost" size="icon" className="hidden md:flex w-10 h-10 md:w-11 md:h-11">
              <Search className="w-5 h-5" />
            </Button>
            <Link href="/favoritos">
              <Button variant="ghost" size="icon" className="relative w-10 h-10 md:w-11 md:h-11">
                <Heart className="w-5 h-5" />
                {totalFavorites > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] md:text-xs min-w-[18px] h-[18px] md:min-w-[20px] md:h-5 rounded-full flex items-center justify-center font-medium">
                    {totalFavorites > 9 ? "9+" : totalFavorites}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative w-10 h-10 md:w-11 md:h-11" onClick={openCart}>
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] md:text-xs min-w-[18px] h-[18px] md:min-w-[20px] md:h-5 rounded-full flex items-center justify-center font-medium">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Button>
            <Link href="/admin" className="hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary w-10 h-10 md:w-11 md:h-11"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu - Full screen overlay with better UX */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[calc(theme(spacing.20)+env(safe-area-inset-top))] bg-background z-40 overflow-y-auto">
            <div className="flex flex-col py-6 px-4 space-y-1">
              <Link
                href="/#novidades"
                className="flex items-center justify-center py-4 text-base tracking-wide hover:text-primary hover:bg-secondary rounded-xl transition-all uppercase font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Novidades
              </Link>
              <Link
                href="/categoria/conjuntos"
                className="flex items-center justify-center py-4 text-base tracking-wide hover:text-primary hover:bg-secondary rounded-xl transition-all uppercase font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Conjuntos
              </Link>
              <Link
                href="/categoria/tops"
                className="flex items-center justify-center py-4 text-base tracking-wide hover:text-primary hover:bg-secondary rounded-xl transition-all uppercase font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Tops
              </Link>
              <Link
                href="/categoria/calcinhas"
                className="flex items-center justify-center py-4 text-base tracking-wide hover:text-primary hover:bg-secondary rounded-xl transition-all uppercase font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Calcinhas
              </Link>

              <div className="border-t border-border my-4" />

              <Link
                href="/favoritos"
                className="flex items-center justify-center gap-2 py-4 text-base tracking-wide hover:text-primary hover:bg-secondary rounded-xl transition-all uppercase font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="w-5 h-5" />
                Favoritos {totalFavorites > 0 && `(${totalFavorites})`}
              </Link>
              <Link
                href="/nossa-historia"
                className="flex items-center justify-center py-4 text-base tracking-wide hover:text-primary hover:bg-secondary rounded-xl transition-all uppercase font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Nossa História
              </Link>
              <Link
                href="/admin"
                className="flex items-center justify-center py-4 text-base tracking-wide text-muted-foreground hover:text-primary hover:bg-secondary rounded-xl transition-all uppercase"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="w-5 h-5 mr-2" />
                Admin
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
