"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, ShoppingBag, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product } from "@/lib/products"

interface ProductCardProps {
  product: Product
  onQuickView: (product: Product) => void
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onQuickView, onAddToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(product.id)

  return (
    <div className="group relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Link href={`/produto/${product.id}`}>
        {/* Image Container - Larger border radius, better aspect ratio */}
        <div className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden bg-secondary mb-3 md:mb-4">
          <img
            src={isHovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badges - Smaller on mobile */}
          <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1.5 md:gap-2">
            {product.isNew && (
              <span className="bg-primary text-primary-foreground text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full font-medium">
                Novo
              </span>
            )}
            {product.isSale && (
              <span className="bg-accent text-accent-foreground text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full font-medium">
                -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Favorite button - Larger touch target */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleFavorite(product.id)
        }}
        className={`absolute top-2 md:top-3 right-2 md:right-3 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all z-10 active:scale-90 ${
          favorited ? "bg-red-500 text-white" : "bg-card/80 backdrop-blur-sm text-foreground hover:bg-card"
        }`}
      >
        <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
      </button>

      {/* Hover Actions - Hidden on mobile, show on desktop hover */}
      <div
        className={`absolute inset-x-2 md:inset-x-3 bottom-[calc(25%+0.75rem)] md:bottom-[calc(25%+1rem)] hidden md:flex gap-2 transition-all duration-300 z-10 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Button
          size="sm"
          className="flex-1 rounded-full text-xs md:text-sm h-9 md:h-10"
          onClick={(e) => {
            e.preventDefault()
            onAddToCart(product)
          }}
        >
          <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
          Adicionar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full px-2.5 md:px-3 bg-card/80 backdrop-blur-sm border-0 hover:bg-card h-9 md:h-10"
          onClick={(e) => {
            e.preventDefault()
            onQuickView(product)
          }}
        >
          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </Button>
      </div>

      {/* Product Info - Better mobile typography */}
      <Link href={`/produto/${product.id}`}>
        <div className="space-y-1.5 md:space-y-2">
          <h4 className="font-medium text-sm md:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h4>

          {/* Colors - Smaller dots on mobile */}
          {product.colors && (
            <div className="flex gap-1">
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color.name}
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] md:text-xs text-muted-foreground">+{product.colors.length - 4}</span>
              )}
            </div>
          )}

          {/* Price - Responsive font sizes */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            <span className="font-bold text-sm md:text-base text-foreground">
              R$ {product.price.toLocaleString("pt-BR")}
            </span>
            {product.originalPrice && (
              <span className="text-xs md:text-sm text-muted-foreground line-through">
                R$ {product.originalPrice.toLocaleString("pt-BR")}
              </span>
            )}
          </div>

          {/* Sizes Preview - Scrollable on mobile */}
          {product.sizes && (
            <div className="flex gap-1 text-[10px] md:text-xs text-muted-foreground overflow-x-auto hide-scrollbar">
              {product.sizes.slice(0, 5).map((size) => (
                <span key={size} className="px-1.5 md:px-2 py-0.5 bg-secondary rounded flex-shrink-0">
                  {size}
                </span>
              ))}
              {product.sizes.length > 5 && (
                <span className="px-1.5 md:px-2 py-0.5 text-muted-foreground flex-shrink-0">...</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
