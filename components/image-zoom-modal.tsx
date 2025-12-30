"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageZoomModalProps {
  images: string[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  productName: string
}

export function ImageZoomModal({ images, initialIndex, isOpen, onClose, productName }: ImageZoomModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [initialIndex, isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") prevImage()
      if (e.key === "ArrowRight") nextImage()
      if (e.key === "+" || e.key === "=") zoomIn()
      if (e.key === "-") zoomOut()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const zoomIn = () => setScale((s) => Math.min(s + 0.5, 4))
  const zoomOut = () => {
    setScale((s) => {
      const newScale = Math.max(s - 0.5, 1)
      if (newScale === 1) setPosition({ x: 0, y: 0 })
      return newScale
    })
  }
  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const nextImage = () => {
    setCurrentIndex((i) => (i + 1) % images.length)
    resetZoom()
  }

  const prevImage = () => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length)
    resetZoom()
  }

  // Mouse drag for panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  // Touch pinch zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }

  // Double tap to zoom
  const handleDoubleClick = () => {
    if (scale > 1) {
      resetZoom()
    } else {
      setScale(2.5)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-sm font-medium">{productName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 1}
            className="text-white hover:bg-white/20"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <span className="text-sm w-16 text-center">{Math.round(scale * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 4}
            className="text-white hover:bg-white/20"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 ml-2">
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`${productName} - Imagem ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain transition-transform duration-200 select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          }}
          draggable={false}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 p-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx)
                resetZoom()
              }}
              className={`w-16 h-20 rounded-lg overflow-hidden transition-all ${
                currentIndex === idx ? "ring-2 ring-white" : "opacity-50 hover:opacity-80"
              }`}
            >
              <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center pb-4 text-white/60 text-xs">
        Duplo clique para zoom | Arraste para mover | Scroll para zoom | Setas para navegar
      </div>
    </div>
  )
}
