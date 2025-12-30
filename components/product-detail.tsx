"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Truck,
  Shield,
  Star,
  Clock,
  Check,
  Ruler,
  Sparkles,
  ZoomIn,
  Share2,
  Info,
  ChevronDown,
  Lock,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { ImageZoomModal } from "@/components/image-zoom-modal"
import type { Product } from "@/lib/products"
import { subscribeToRecommendationSections, type RecommendationSection } from "@/lib/firebase-store-config"
import { subscribeToProducts, type Product as FirebaseProduct } from "@/lib/firebase-products"

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | undefined>()
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0]?.name)
  const [quantity, setQuantity] = useState(1)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [showZoomModal, setShowZoomModal] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>("description")
  const [sizeError, setSizeError] = useState(false)
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [recommendationSections, setRecommendationSections] = useState<RecommendationSection[]>([])
  const [allProducts, setAllProducts] = useState<FirebaseProduct[]>([])
  const [loadingSections, setLoadingSections] = useState(true)

  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const sizeSelectionRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextImage()
      } else {
        prevImage()
      }
    }
  }

  useEffect(() => {
    const unsubSections = subscribeToRecommendationSections((sections) => {
      const filteredSections = sections.filter((s) => s.enabled && s.showOnCategories.includes(product.category))
      setRecommendationSections(filteredSections)
    })

    const unsubProducts = subscribeToProducts((products) => {
      setAllProducts(products.filter((p) => p.active))
      setLoadingSections(false)
    })

    return () => {
      unsubSections()
      unsubProducts()
    }
  }, [product.category])

  useEffect(() => {
    if (selectedSize) {
      setSizeError(false)
    }
  }, [selectedSize])

  const getSectionProducts = (section: RecommendationSection): Product[] => {
    if (section.productIds && section.productIds.length > 0) {
      return section.productIds
        .map((id) => {
          const fp = allProducts.find((p) => p.id === id)
          if (!fp) return null
          return {
            id: fp.id,
            name: fp.name,
            price: fp.price,
            originalPrice: fp.originalPrice,
            image: (fp.images && fp.images[0]) || "",
            images: fp.images || [],
            category: fp.category,
            description: fp.description,
            sizes: fp.sizes || [],
            isNew: fp.featured,
            isSale: !!fp.discount,
          } as Product
        })
        .filter((p): p is Product => p !== null && p.id !== product.id)
        .slice(0, 4)
    }
    return relatedProducts.slice(0, 4)
  }

  const images = product.images || [product.image]

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true)
      sizeSelectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    addItem(product, quantity, selectedSize, selectedColor)
    window.location.href = "https://app.syncpayments.com.br/payment-link/a0b6a316-0b7d-4f45-bebf-1053e21f43dd"
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Confira ${product.name} na usecalistar!`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiado!")
    }
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const favorited = isFavorite(product.id)
  const totalPrice = product.price * quantity

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const canPurchase = selectedSize !== undefined

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content - Better mobile layout */}
      <div className="w-full max-w-7xl mx-auto px-0 md:px-4 lg:px-6 pb-32 md:pb-16">
        <div className="grid lg:grid-cols-2 gap-0 lg:gap-8 xl:gap-12">
          {/* Image Gallery */}
          <div className="relative">
            {/* Main Image */}
            <div
              className="relative aspect-[3/4] md:aspect-[4/5] md:rounded-2xl overflow-hidden bg-secondary cursor-zoom-in group"
              onClick={() => setShowZoomModal(true)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />

              {/* Zoom indicator - Desktop only */}
              <div className="hidden md:flex absolute bottom-4 left-4 items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4" />
                <span>Clique para ampliar</span>
              </div>

              {/* Navigation Arrows - Smaller on mobile */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      prevImage()
                    }}
                    className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      nextImage()
                    }}
                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </>
              )}

              {/* Badges - Smaller on mobile */}
              <div className="absolute top-3 md:top-4 left-3 md:left-4 flex flex-col gap-1.5 md:gap-2">
                {product.isNew && (
                  <span className="bg-primary text-primary-foreground text-[10px] md:text-xs px-2.5 md:px-3 py-1 md:py-1.5 rounded-full font-medium">
                    Novo
                  </span>
                )}
                {product.isSale && discountPercent > 0 && (
                  <span className="bg-red-500 text-white text-[10px] md:text-xs px-2.5 md:px-3 py-1 md:py-1.5 rounded-full font-medium">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {/* Top Right Actions - Larger touch targets */}
              <div className="absolute top-3 md:top-4 right-3 md:right-4 flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(product.id)
                  }}
                  className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                    favorited
                      ? "bg-red-500 text-white"
                      : "bg-background/90 backdrop-blur-sm text-foreground hover:bg-background"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${favorited ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare()
                  }}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Image dots indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-background/60 backdrop-blur-sm rounded-full px-2.5 md:px-3 py-1.5 md:py-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(idx)
                      }}
                      className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${
                        selectedImage === idx ? "bg-foreground w-4 md:w-6" : "bg-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails - Desktop only */}
            {images.length > 1 && (
              <div className="hidden md:flex gap-2 lg:gap-3 mt-3 lg:mt-4 overflow-x-auto pb-2 px-4 lg:px-0 hide-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative flex-shrink-0 w-16 h-20 lg:w-20 lg:h-24 rounded-lg overflow-hidden transition-all ${
                      selectedImage === idx ? "ring-2 ring-primary ring-offset-2" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Better mobile padding */}
          <div className="px-4 lg:px-0 pt-5 md:pt-6 space-y-4 md:space-y-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                Início
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/categoria/${product.category}`} className="hover:text-primary transition-colors capitalize">
                {product.category}
              </Link>
            </nav>

            {/* Title & Rating - Better mobile sizing */}
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground text-balance leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-[10px] md:text-xs text-muted-foreground">(127 avaliações)</span>
              </div>
            </div>

            {/* Price - Responsive sizing */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                  R$ {product.price.toLocaleString("pt-BR")}
                </span>
                {product.originalPrice && (
                  <span className="text-sm md:text-base text-muted-foreground line-through">
                    R$ {product.originalPrice.toLocaleString("pt-BR")}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                ou{" "}
                <span className="font-medium text-foreground">
                  10x de R$ {(product.price / 10).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>{" "}
                sem juros
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-xs md:text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Economia de R$ {(product.originalPrice - product.price).toLocaleString("pt-BR")}
                </p>
              )}
            </div>

            {/* Colors - Larger touch targets */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <span className="text-xs md:text-sm font-medium text-foreground">
                  Cor: <span className="text-muted-foreground">{selectedColor}</span>
                </span>
                <div className="flex gap-2.5 md:gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-full border-2 transition-all active:scale-95 ${
                        selectedColor === color.name
                          ? "border-primary scale-110 shadow-lg"
                          : "border-border hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes - Larger buttons for mobile */}
            {product.sizes && (
              <div className="space-y-2 md:space-y-3" ref={sizeSelectionRef}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs md:text-sm font-medium ${sizeError ? "text-red-500" : "text-foreground"}`}>
                    Tamanho:{" "}
                    <span className={sizeError ? "text-red-500" : "text-muted-foreground"}>
                      {selectedSize || "Selecione"}
                    </span>
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-[10px] md:text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Ruler className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    Guia de Medidas
                  </button>
                </div>

                {sizeError && (
                  <div className="flex items-center gap-2 text-red-500 text-xs md:text-sm animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>Por favor, selecione um tamanho</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] md:min-w-[3.5rem] h-11 md:h-12 px-3 md:px-4 rounded-xl border-2 text-xs md:text-sm font-medium transition-all active:scale-95 ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground shadow-lg"
                          : sizeError
                            ? "border-red-300 hover:border-red-500 text-foreground"
                            : "border-border hover:border-primary text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Size Guide - Better mobile table */}
                {showSizeGuide && (
                  <div className="p-3 md:p-4 bg-secondary rounded-xl mt-2 md:mt-3 space-y-3 md:space-y-4">
                    <h4 className="font-semibold flex items-center gap-2 text-xs md:text-sm">
                      <Ruler className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      Guia de Tamanhos
                    </h4>

                    <div className="p-2.5 md:p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-[10px] md:text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Modelagem Asa Delta:</strong> Esta peça possui corte cavado para valorizar o corpo.
                        </span>
                      </p>
                    </div>

                    <div className="overflow-x-auto -mx-3 md:-mx-4 px-3 md:px-4">
                      <table className="w-full text-[10px] md:text-xs min-w-[280px]">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 font-semibold">Tam</th>
                            <th className="text-center py-2 font-semibold">Busto</th>
                            <th className="text-center py-2 font-semibold">Cintura</th>
                            <th className="text-center py-2 font-semibold">Quadril</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { size: "PP", bust: "78-82", waist: "58-62", hip: "84-88" },
                            { size: "P", bust: "82-86", waist: "62-66", hip: "88-92" },
                            { size: "M", bust: "86-90", waist: "66-70", hip: "92-96" },
                            { size: "G", bust: "90-94", waist: "70-74", hip: "96-100" },
                            { size: "GG", bust: "94-98", waist: "74-78", hip: "100-104" },
                          ].map((row) => (
                            <tr key={row.size} className="border-b border-border/50">
                              <td className="py-2 font-medium">{row.size}</td>
                              <td className="text-center py-2">{row.bust}</td>
                              <td className="text-center py-2">{row.waist}</td>
                              <td className="text-center py-2">{row.hip}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Medidas em centímetros</p>
                  </div>
                )}
              </div>
            )}

            {/* Buy Button - Desktop only */}
            <div className="hidden md:block space-y-3 pt-2">
              <Button
                size="lg"
                className={`w-full h-14 text-base font-semibold rounded-xl transition-all ${
                  canPurchase
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                onClick={handleBuyNow}
                disabled={!canPurchase}
              >
                <Lock className="w-5 h-5 mr-2" />
                {canPurchase ? `Finalizar Compra • R$ ${totalPrice.toLocaleString("pt-BR")}` : "Selecione o tamanho"}
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-green-500" />
                  Pagamento Seguro
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  Cartão, Pix ou Boleto
                </span>
              </div>
            </div>

            {/* Info Accordions - Better mobile spacing */}
            <div className="space-y-2 pt-2 md:pt-4">
              {/* Description */}
              <div className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("description")}
                  className="w-full flex items-center justify-between p-3 md:p-4 text-left"
                >
                  <span className="font-medium text-sm md:text-base">Descrição</span>
                  <ChevronDown
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${expandedSection === "description" ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSection === "description" && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4 text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {product.description || "Peça exclusiva da coleção de verão, confeccionada com tecidos premium."}
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("shipping")}
                  className="w-full flex items-center justify-between p-3 md:p-4 text-left"
                >
                  <span className="font-medium text-sm md:text-base flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    Entrega
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${expandedSection === "shipping" ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSection === "shipping" && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-2 md:space-y-3">
                    <div className="flex items-start gap-2 md:gap-3">
                      <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm font-medium">Prazo de Envio</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          3-5 dias úteis para separação + tempo dos Correios
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm font-medium text-green-600">Frete Grátis</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">Em compras acima de R$ 299</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Guarantees */}
              <div className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("guarantees")}
                  className="w-full flex items-center justify-between p-3 md:p-4 text-left"
                >
                  <span className="font-medium text-sm md:text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Garantias
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${expandedSection === "guarantees" ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSection === "guarantees" && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm">7 dias para troca ou devolução</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm">Produto original com garantia</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm">Pagamento 100% seguro</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 md:mt-16 px-4 lg:px-0">
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6">Você também pode gostar</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {relatedProducts.slice(0, 4).map((rp) => (
                <Link key={rp.id} href={`/produto/${rp.id}`} className="group">
                  <div className="aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden bg-secondary mb-2 md:mb-3">
                    <img
                      src={rp.image || "/placeholder.svg"}
                      alt={rp.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="text-xs md:text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {rp.name}
                  </h4>
                  <p className="text-xs md:text-sm font-bold">R$ {rp.price.toLocaleString("pt-BR")}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Footer - Better iOS safe area support */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background/95 backdrop-blur-lg border-t border-border p-3 safe-bottom z-50">
        <Button
          className={`w-full h-12 text-sm font-semibold rounded-xl transition-all ${
            canPurchase
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={handleBuyNow}
          disabled={!canPurchase}
        >
          <Lock className="w-4 h-4 mr-2" />
          {canPurchase ? `Finalizar Compra • R$ ${totalPrice.toLocaleString("pt-BR")}` : "Selecione o tamanho"}
        </Button>
        <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-500" />
            Seguro
          </span>
          <span className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Cartão, Pix ou Boleto
          </span>
        </div>
      </div>

      {/* Zoom Modal */}
      <ImageZoomModal
        images={images}
        currentIndex={selectedImage}
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        onNavigate={setSelectedImage}
      />
    </div>
  )
}
