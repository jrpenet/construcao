import { Headphones, Zap, Share2, MessageCircle } from 'lucide-react'

const items = [
  {
    icon: Headphones,
    title: 'Suporte via WhatsApp',
    description: 'Precisou de ajuda? Fale com o suporte de forma rápida e direta.',
  },
  {
    icon: Zap,
    title: 'Configuração simples',
    description:
      'Cadastre seus serviços e horários sem precisar entender de tecnologia.',
  },
  {
    icon: Share2,
    title: 'Link profissional para divulgar',
    description:
      'Use sua página de agendamento nas redes sociais, WhatsApp e Google.',
  },
]

export function Differentials() {
  return (
    <section id="diferenciais" className="bg-background py-20 md:py-24">
      <div className="mx-auto grid w-[min(1160px,calc(100%-40px))] items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
            Um atendimento que continua depois do agendamento.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            O Vai Agenda! combina tecnologia com uma experiência simples para quem
            administra o próprio negócio.
          </p>
          <div className="mt-8 space-y-6">
            {items.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-brand p-9 text-brand-foreground shadow-[0_25px_70px_rgba(24,119,242,0.35)]">
          <div>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15">
              <MessageCircle className="size-7" aria-hidden="true" />
            </div>
            <h3 className="mt-6 text-2xl font-extrabold">
              Quando precisar, a gente está aqui.
            </h3>
            <p className="mt-3 text-white/85">
              Conte com suporte para configurar sua agenda e aproveitar melhor a
              plataforma.
            </p>
          </div>
          <a
            href="https://wa.me/5581987540999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-bold text-brand transition-transform hover:-translate-y-0.5"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
