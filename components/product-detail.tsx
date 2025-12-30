"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  Star,
  Clock,
  Check,
  Ruler,
  Package,
  Sparkles,
  Loader2,
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

  // Touch swipe for mobile gallery
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

  // Carrega seções de recomendação e produtos do Firebase
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

  // Função para obter produtos de uma seção
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

  // Stock count based on product ID for consistency
  const stockCount = (product.id.charCodeAt(0) % 5) + 3

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true)
      // Scroll to size selection on mobile
      sizeSelectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    // Add to cart first
    addItem(product, quantity, selectedSize, selectedColor)

    // Redirect to SyncPayments checkout
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
      {/* Main Content */}
      <div className="container mx-auto px-0 md:px-4 pb-36 md:pb-16">
        <div className="grid lg:grid-cols-2 gap-0 lg:gap-12">
          {/* Image Gallery - Full width on mobile */}
          <div className="relative">
            {/* Main Image with touch swipe */}
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

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      prevImage()
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      nextImage()
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full font-medium">
                    Novo
                  </span>
                )}
                {product.isSale && discountPercent > 0 && (
                  <span className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {/* Top Right Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(product.id)
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
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
                  className="w-11 h-11 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Image dots indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-background/60 backdrop-blur-sm rounded-full px-3 py-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(idx)
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedImage === idx ? "bg-foreground w-6" : "bg-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails - Desktop only */}
            {images.length > 1 && (
              <div className="hidden md:flex gap-3 mt-4 overflow-x-auto pb-2 px-4 lg:px-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden transition-all ${
                      selectedImage === idx ? "ring-2 ring-primary ring-offset-2" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="px-4 lg:px-0 pt-6 space-y-5">
            {/* Breadcrumb - Mobile mini version */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground md:hidden">
              <Link href="/" className="hover:text-primary transition-colors">
                Início
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/categoria/${product.category}`} className="hover:text-primary transition-colors capitalize">
                {product.category}
              </Link>
            </nav>

            {/* Title & Rating */}
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground text-balance leading-tight">
                {product.name}
              </h1>

              {/* Stars */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">(127 avaliações)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-foreground">
                  R$ {product.price.toLocaleString("pt-BR")}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-muted-foreground line-through">
                    R$ {product.originalPrice.toLocaleString("pt-BR")}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                ou{" "}
                <span className="font-medium text-foreground">
                  10x de R$ {(product.price / 10).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>{" "}
                sem juros
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Economia de R$ {(product.originalPrice - product.price).toLocaleString("pt-BR")}
                </p>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <span className="text-sm font-medium text-foreground">
                  Cor: <span className="text-muted-foreground">{selectedColor}</span>
                </span>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all active:scale-95 ${
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

            {/* Sizes - With error state */}
            {product.sizes && (
              <div className="space-y-3" ref={sizeSelectionRef}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${sizeError ? "text-red-500" : "text-foreground"}`}>
                    Tamanho:{" "}
                    <span className={sizeError ? "text-red-500" : "text-muted-foreground"}>
                      {selectedSize || "Selecione"}
                    </span>
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    Guia de Medidas
                  </button>
                </div>

                {sizeError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm animate-pulse">
                    <AlertCircle className="w-4 h-4" />
                    <span>Por favor, selecione um tamanho para continuar</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3.5rem] h-12 px-4 rounded-xl border-2 text-sm font-medium transition-all active:scale-95 ${
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

                {showSizeGuide && (
                  <div className="p-4 bg-secondary rounded-xl mt-3 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2 text-sm">
                      <Ruler className="w-4 h-4 text-primary" />
                      Guia de Tamanhos
                    </h4>

                    {/* Fit Warning */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Modelagem Asa Delta:</strong> Esta peça possui corte cavado para valorizar o corpo.
                        </span>
                      </p>
                    </div>

                    <div className="overflow-x-auto -mx-4 px-4">
                      <table className="w-full text-xs">
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
                    <p className="text-xs text-muted-foreground">
                      Dica: Se estiver entre dois tamanhos, opte pelo maior para maior conforto.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-foreground">Quantidade</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-secondary rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:text-primary transition-colors active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                    className="w-11 h-11 flex items-center justify-center hover:text-primary transition-colors active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">{stockCount} disponíveis</span>
              </div>
            </div>

            {/* Trust Badges - Compact horizontal scroll on mobile */}
            <div className="flex items-center gap-4 py-4 border-y border-border overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-xs whitespace-nowrap">Frete Grátis +R$299</span>
              </div>
              <div className="w-px h-4 bg-border flex-shrink-0" />
              <div className="flex items-center gap-2 flex-shrink-0">
                <RefreshCw className="w-4 h-4 text-primary" />
                <span className="text-xs whitespace-nowrap">Troca Grátis</span>
              </div>
              <div className="w-px h-4 bg-border flex-shrink-0" />
              <div className="flex items-center gap-2 flex-shrink-0">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs whitespace-nowrap">Compra Segura</span>
              </div>
            </div>

            {/* Accordion Sections - Desktop */}
            <div className="hidden md:block space-y-0 border border-border rounded-xl overflow-hidden">
              {/* Description */}
              <div className="border-b border-border last:border-b-0">
                <button
                  onClick={() => toggleSection("description")}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="font-medium text-sm">Descrição</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === "description" ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSection === "description" && (
                  <div className="px-4 pb-4 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                    {product.material && (
                      <p className="text-sm">
                        <span className="font-medium">Material:</span>{" "}
                        <span className="text-muted-foreground">{product.material}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Details */}
              {product.details && product.details.length > 0 && (
                <div className="border-b border-border last:border-b-0">
                  <button
                    onClick={() => toggleSection("details")}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <span className="font-medium text-sm">Detalhes</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === "details" ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSection === "details" && (
                    <div className="px-4 pb-4">
                      <ul className="space-y-2">
                        {product.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Shipping */}
              <div className="border-b border-border last:border-b-0">
                <button
                  onClick={() => toggleSection("shipping")}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="font-medium text-sm">Entrega</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === "shipping" ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSection === "shipping" && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">3 a 5 dias úteis</strong> para postagem
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Truck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">+ Prazo dos Correios conforme sua região</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Frete Grátis</strong> para compras acima de R$299
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button - Desktop only */}
            <div className="hidden md:block pt-4 space-y-4">
              <Button
                size="lg"
                className={`w-full rounded-xl h-14 text-base font-bold gap-2 shadow-lg transition-all ${
                  canPurchase
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                onClick={handleBuyNow}
              >
                <Lock className="w-4 h-4" />
                {canPurchase ? `Finalizar Compra - R$ ${totalPrice.toLocaleString("pt-BR")}` : "Selecione o tamanho"}
              </Button>

              {/* Payment trust indicators */}
              <div className="flex items-center justify-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1.5 text-xs">
                  <Shield className="w-3.5 h-3.5 text-green-600" />
                  <span>Pagamento 100% Seguro</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cartão, Pix ou Boleto</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Accordion Sections */}
        <div className="md:hidden px-4 mt-6 space-y-0 border-y border-border">
          {/* Description */}
          <div className="border-b border-border last:border-b-0">
            <button
              onClick={() => toggleSection("description")}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="font-medium text-sm">Descrição</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === "description" ? "rotate-180" : ""}`}
              />
            </button>
            {expandedSection === "description" && (
              <div className="pb-4 space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                {product.material && (
                  <p className="text-sm">
                    <span className="font-medium">Material:</span>{" "}
                    <span className="text-muted-foreground">{product.material}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          {product.details && product.details.length > 0 && (
            <div className="border-b border-border last:border-b-0">
              <button
                onClick={() => toggleSection("details")}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="font-medium text-sm">Detalhes</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === "details" ? "rotate-180" : ""}`}
                />
              </button>
              {expandedSection === "details" && (
                <div className="pb-4">
                  <ul className="space-y-2">
                    {product.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Shipping */}
          <div>
            <button
              onClick={() => toggleSection("shipping")}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="font-medium text-sm">Entrega</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === "shipping" ? "rotate-180" : ""}`}
              />
            </button>
            {expandedSection === "shipping" && (
              <div className="pb-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">3 a 5 dias úteis</strong> para postagem
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">+ Prazo dos Correios conforme sua região</p>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Frete Grátis</strong> acima de R$299
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendation Sections */}
        <div className="px-4 lg:px-0">
          {loadingSections ? (
            <div className="mt-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {recommendationSections.map((section) => {
                const sectionProducts = getSectionProducts(section)
                if (sectionProducts.length === 0) return null

                return (
                  <div key={section.id} className="mt-12">
                    <div className="mb-6">
                      <h2 className="text-lg md:text-xl font-bold text-foreground">{section.title}</h2>
                      {section.description && (
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                      {sectionProducts.map((sectionProduct) => (
                        <Link key={sectionProduct.id} href={`/produto/${sectionProduct.id}`} className="group">
                          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary mb-2">
                            <img
                              src={sectionProduct.image || "/placeholder.svg"}
                              alt={sectionProduct.name}
                              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            />
                            {sectionProduct.isNew && (
                              <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                Novo
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {sectionProduct.name}
                          </h4>
                          <p className="text-sm font-bold text-foreground">
                            R$ {sectionProduct.price.toLocaleString("pt-BR")}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}

              {recommendationSections.length === 0 && relatedProducts.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-lg md:text-xl font-bold text-foreground mb-6">Você também pode gostar</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {relatedProducts.map((relatedProduct) => (
                      <Link key={relatedProduct.id} href={`/produto/${relatedProduct.id}`} className="group">
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary mb-2">
                          <img
                            src={relatedProduct.image || "/placeholder.svg"}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                          {relatedProduct.isNew && (
                            <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                              Novo
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {relatedProduct.name}
                        </h4>
                        <p className="text-sm font-bold text-foreground">
                          R$ {relatedProduct.price.toLocaleString("pt-BR")}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sticky CTA Footer - Mobile only */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-6 md:hidden z-50">
        <Button
          size="lg"
          className={`w-full rounded-xl h-14 font-bold gap-2 shadow-xl transition-all active:scale-[0.98] ${
            canPurchase ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
          onClick={handleBuyNow}
        >
          <Lock className="w-5 h-5" />
          {canPurchase ? `Comprar - R$ ${totalPrice.toLocaleString("pt-BR")}` : "Selecione o tamanho"}
        </Button>
        <div className="flex items-center justify-center gap-4 mt-3 text-muted-foreground">
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span>Seguro</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cartão, Pix ou Boleto</span>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        images={images}
        initialIndex={selectedImage}
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        productName={product.name}
      />
    </div>
  )
}
