import Link from "next/link"
import { Instagram, Facebook, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground py-10 md:py-16">
      <div className="w-full px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
          {/* Brand */}
          <div className="space-y-3 md:space-y-4 col-span-2 md:col-span-1">
            <h4 className="text-xl md:text-2xl font-bold">usecalistar</h4>
            <p className="text-xs md:text-sm opacity-80 leading-relaxed">
              Biquínis exclusivos para mulheres que brilham. Cada peça conta uma história de elegância e liberdade.
            </p>
            <div className="flex gap-3 md:gap-4">
              <Link
                href="#"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors active:scale-95"
              >
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
              <Link
                href="#"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors active:scale-95"
              >
                <Facebook className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3 md:space-y-4">
            <h5 className="font-semibold uppercase tracking-wide text-xs md:text-sm">Loja</h5>
            <ul className="space-y-2 text-xs md:text-sm opacity-80">
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Novidades
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Biquínis
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Vestidos
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Acessórios
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-3 md:space-y-4">
            <h5 className="font-semibold uppercase tracking-wide text-xs md:text-sm">Informações</h5>
            <ul className="space-y-2 text-xs md:text-sm opacity-80">
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Entregas
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 md:space-y-4 col-span-2 md:col-span-1">
            <h5 className="font-semibold uppercase tracking-wide text-xs md:text-sm">Contato</h5>
            <ul className="space-y-2 text-xs md:text-sm opacity-80">
              <li>contato@usecalistar.com.br</li>
              <li>(11) 99999-9999</li>
              <li>Segunda a Sexta, 9h às 18h</li>
            </ul>
          </div>
        </div>

        {/* Bottom - Stack on mobile */}
        <div className="border-t border-primary-foreground/20 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-center md:text-left">
          <p className="text-xs md:text-sm opacity-60">© 2025 usecalistar. Todos os direitos reservados.</p>
          <p className="text-xs md:text-sm opacity-60 flex items-center gap-1">
            Feito com <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary fill-primary" /> no Brasil
          </p>
        </div>
      </div>
    </footer>
  )
}
