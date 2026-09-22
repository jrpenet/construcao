import { MessageCircle } from 'lucide-react'

export function WhatsappFloat() {
  return (
    <a
      href="https://wa.me/5581987540999?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Vai%20Agenda."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o Vai Agenda pelo WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_12px_30px_rgba(16,163,74,0.4)] transition-transform hover:scale-105"
    >
      <MessageCircle className="size-7" aria-hidden="true" />
    </a>
  )
}
