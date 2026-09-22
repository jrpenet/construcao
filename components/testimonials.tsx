import { Star } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'

const testimonials = [
  {
    quote:
      'Agora meus clientes conseguem escolher o horário sozinhos. Minha rotina ficou muito mais organizada.',
    name: 'Ana',
    role: 'Profissional de beleza',
    initial: 'A',
  },
  {
    quote:
      'Eu perdia muito tempo respondendo mensagens. Com o agendamento online, ficou bem mais simples.',
    name: 'Marcos',
    role: 'Barbeiro',
    initial: 'M',
  },
  {
    quote:
      'Ter uma página própria para meus clientes agendarem passa uma imagem muito mais profissional.',
    name: 'Juliana',
    role: 'Profissional autônoma',
    initial: 'J',
  },
]

export function Testimonials() {
  return (
    <section id="depoimentos" className="bg-[#f8fafd] py-20 md:py-24">
      <div className="mx-auto w-[min(1160px,calc(100%-40px))]">
        <SectionHeading
          title="Quem usa, ganha tempo"
          description="Relatos de profissionais que transformaram a rotina de agendamentos com o Vai Agenda!."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(24,55,100,0.1)]"
            >
              <div className="flex gap-0.5 text-amber-400" aria-label="5 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <p className="mt-4 flex-1 text-pretty text-foreground/90">
                {item.quote}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand text-lg font-bold text-brand-foreground">
                  {item.initial}
                </span>
                <div className="leading-tight">
                  <strong className="block">{item.name}</strong>
                  <span className="text-sm text-muted-foreground">
                    {item.role}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
