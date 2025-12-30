import { notFound } from "next/navigation"
import { getProduct, getProducts, type Product as FirebaseProduct } from "@/lib/firebase-products"
import { ProductDetail } from "@/components/product-detail"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Product } from "@/lib/products"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

function convertFirebaseProduct(fp: FirebaseProduct): Product {
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

  const images = fp.images || []
  const colors = fp.colors || []
  const sizes = fp.sizes || []
  const tags = fp.tags || []

  return {
    id: fp.id,
    name: fp.name,
    description: fp.description,
    price: fp.price,
    originalPrice: fp.originalPrice,
    image: images[0] || "/placeholder.svg",
    images: images,
    category: fp.category,
    sizes: sizes,
    colors: colors.map((c) => ({ name: c, hex: colorMap[c] || "#CCCCCC" })),
    isNew: fp.featured,
    isSale: (fp.discount || 0) > 0,
    rating: fp.rating,
    reviews: fp.reviews,
    details: tags,
    material: "Poliamida com elastano - tecido de alta qualidade com proteção UV",
    careInstructions: ["Lavar à mão com água fria", "Não usar alvejante", "Secar à sombra", "Não passar a ferro"],
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return { title: "Produto não encontrado | usecalistar" }
  }

  return {
    title: `${product.name} | usecalistar`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const firebaseProduct = await getProduct(id)

  if (!firebaseProduct || !firebaseProduct.active) {
    notFound()
  }

  const product = convertFirebaseProduct(firebaseProduct)

  // Get related products (same category, excluding current)
  const allProducts = await getProducts()
  const relatedFirebaseProducts = allProducts
    .filter((p) => p.active && p.category === firebaseProduct.category && p.id !== firebaseProduct.id)
    .slice(0, 4)

  const relatedProducts = relatedFirebaseProducts.map(convertFirebaseProduct)

  return (
    <>
      <Header />
      <main className="pt-28 md:pt-32">
        <ProductDetail product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </>
  )
}
