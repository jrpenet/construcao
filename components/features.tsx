import {
  CalendarClock,
  LayoutGrid,
  MessageCircle,
  CreditCard,
  Sparkles,
  Infinity as InfinityIcon,
} from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'

const features = [
  {
    icon: CalendarClock,
    title: 'Agendamento online',
    description:
      'Compartilhe seu link e permita que seus clientes agendem quando quiserem.',
  },
  {
    icon: LayoutGrid,
    title: 'Agenda organizada',
    description:
      'Visualize seus horários e mantenha sua rotina mais previsível e profissional.',
  },
  {
    icon: MessageCircle,
    title: 'Lembretes pelo WhatsApp',
    description:
      'Ajude seus clientes a lembrarem do compromisso e reduza esquecimentos.',
  },
  {
    icon: CreditCard,
    title: 'Receba pagamentos',
    description:
      'Facilite o pagamento dos seus serviços diretamente pelo seu fluxo de atendimento.',
  },
  {
    icon: Sparkles,
    title: 'Mais profissionalismo',
    description:
      'Uma experiência de agendamento moderna para valorizar a sua marca.',
  },
  {
    icon: InfinityIcon,
    title: 'Disponível 24 horas',
    description:
      'Seu cliente não precisa esperar você responder para marcar um horário.',
  },
]

export function Features() {
  return (
    <section id="vantagens" className="bg-background py-20 md:py-24">
      <div className="mx-auto w-[min(1160px,calc(100%-40px))]">
        <SectionHeading
          title="Mais organização. Menos mensagens."
          description="Tenha uma agenda profissional e deixe seus clientes escolherem o melhor horário."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_20px_50px_rgba(24,55,100,0.1)]"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                <feature.icon className="size-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
