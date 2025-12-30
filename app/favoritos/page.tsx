"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/contexts/favorites-context"
import { useCart } from "@/contexts/cart-context"
import { subscribeToProducts, type Product as FirebaseProduct } from "@/lib/firebase-products"

export default function FavoritosPage() {
  const { favorites, removeFavorite } = useFavorites()
  const { addItem, openCart } = useCart()
  const [products, setProducts] = useState<FirebaseProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToProducts((allProducts) => {
      setProducts(allProducts.filter((p) => p.active))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const favoriteProducts = products.filter((p) => favorites.includes(p.id))

  const handleAddToCart = (product: FirebaseProduct) => {
    const defaultSize = product.sizes?.[0]
    const defaultColor = product.colors?.[0]

    if (!defaultSize) {
      alert("Este produto não possui tamanhos disponíveis")
      return
    }

    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0] || "",
        category: product.category as "conjuntos" | "tops" | "calcinhas",
      },
      1,
      defaultSize,
      defaultColor,
    )
    openCart()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a loja
          </Link>

          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 mb-4">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Meus Favoritos</h1>
            <p className="text-muted-foreground">
              {favoriteProducts.length === 0
                ? "Você ainda não adicionou nenhum produto aos favoritos"
                : `${favoriteProducts.length} ${favoriteProducts.length === 1 ? "peça salva" : "peças salvas"}`}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : favoriteProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-6">
                Clique no coração nos produtos que você gostou para salvar aqui!
              </p>
              <Link href="/">
                <Button size="lg" className="rounded-full">
                  Explorar Produtos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteProducts.map((product) => (
                <div key={product.id} className="group relative">
                  <Link href={`/produto/${product.id}`}>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary mb-4">
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.featured && (
                          <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                            Novo
                          </span>
                        )}
                        {product.discount && product.discount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                            -{product.discount}%
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Remove from favorites */}
                  <button
                    onClick={() => removeFavorite(product.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center transition-all hover:bg-red-600 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <Link href={`/produto/${product.id}`}>
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                    </Link>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">R$ {product.price.toLocaleString("pt-BR")}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          R$ {product.originalPrice.toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>

                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex gap-1 text-xs text-muted-foreground">
                        {product.sizes.map((size) => (
                          <span key={size} className="px-2 py-0.5 bg-secondary rounded">
                            {size}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add to cart button */}
                    <Button size="sm" className="w-full rounded-full mt-2" onClick={() => handleAddToCart(product)}>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
