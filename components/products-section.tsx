"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { QuickViewModal } from "@/components/quick-view-modal"
import { subscribeToProducts, type Product as FirebaseProduct } from "@/lib/firebase-products"
import type { Product } from "@/lib/products"
import { useCart } from "@/contexts/cart-context"

const categories = [
  { id: "all", name: "Todos" },
  { id: "conjuntos", name: "Conjuntos" },
  { id: "tops", name: "Tops" },
  { id: "calcinhas", name: "Calcinhas" },
]

function convertFirebaseProduct(fp: FirebaseProduct): Product {
  return {
    id: fp.id,
    name: fp.name,
    description: fp.description,
    price: fp.price,
    originalPrice: fp.originalPrice,
    image: fp.images[0] || "/placeholder.svg",
    images: fp.images,
    category: fp.category,
    sizes: fp.sizes,
    colors: fp.colors.map((c) => ({ name: c, hex: getColorHex(c) })),
    isNew: fp.featured,
    isSale: (fp.discount || 0) > 0,
    rating: fp.rating,
    reviews: fp.reviews,
    details: [],
    material: "Poliamida com elastano",
    careInstructions: ["Lavar à mão", "Não usar alvejante", "Secar à sombra"],
  }
}

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    Preto: "#000000",
    Branco: "#FFFFFF",
    Rosa: "#FF69B4",
    Azul: "#87CEEB",
    Verde: "#90EE90",
    Vermelho: "#FF6B6B",
    Nude: "#E8C4A8",
    "Animal Print": "#D4A574",
  }
  return colorMap[colorName] || "#CCCCCC"
}

export function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const unsub = subscribeToProducts((firebaseProducts) => {
      const activeProducts = firebaseProducts.filter((p) => p.active)
      setProducts(activeProducts.map(convertFirebaseProduct))
      setLoading(false)
    })
    return unsub
  }, [])

  const filteredProducts = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)

  const handleAddToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    addItem(product, quantity, size, color)
  }

  return (
    <section id="novidades" className="py-12 md:py-24">
      <div className="w-full px-4 md:px-6 max-w-7xl mx-auto">
        {/* Section Header - Smaller on mobile */}
        <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4">
          <span className="text-primary text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em]">
            Coleção
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Nossos Produtos</h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Peças cuidadosamente selecionadas para o seu verão perfeito
          </p>
        </div>

        {/* Category Filters - Horizontal scroll on mobile */}
        <div className="flex justify-start md:justify-center gap-2 mb-8 md:mb-12 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 active:scale-95 ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16 md:py-20">
            <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <p className="text-sm md:text-base text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
          </div>
        ) : (
          /* Products Grid - Better gap on mobile */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Quick View Modal */}
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      </div>
    </section>
  )
}
