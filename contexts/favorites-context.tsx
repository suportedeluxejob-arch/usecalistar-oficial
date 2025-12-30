"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface FavoritesContextType {
  favorites: string[]
  addFavorite: (productId: string) => void
  removeFavorite: (productId: string) => void
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  totalFavorites: number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("usecalistar_favorites")
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (e) {
        console.error("Error loading favorites:", e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("usecalistar_favorites", JSON.stringify(favorites))
    }
  }, [favorites, isLoaded])

  const addFavorite = (productId: string) => {
    setFavorites((prev) => [...prev, productId])
  }

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== productId))
  }

  const toggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      removeFavorite(productId)
    } else {
      addFavorite(productId)
    }
  }

  const isFavorite = (productId: string) => favorites.includes(productId)

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        totalFavorites: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
