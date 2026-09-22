import { CalendarMockup } from '@/components/calendar-mockup'

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_82%_15%,rgba(24,119,242,0.12),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] py-20 md:py-24"
    >
      <div className="mx-auto grid w-[min(1160px,calc(100%-40px))] items-center gap-12 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-2 text-[13px] font-extrabold text-brand">
            <span className="size-[7px] rounded-full bg-brand" aria-hidden="true" />
            Agendamento simples para o seu negócio
          </div>
          <h1 className="max-w-[650px] text-balance text-[clamp(2.6rem,5vw,4.25rem)] font-extrabold leading-[1.04] tracking-[-0.03em]">
            Seu tempo é valioso.{' '}
            <span className="text-brand">Sua agenda também.</span>
          </h1>
          <p className="mt-6 max-w-[570px] text-lg leading-relaxed text-muted-foreground md:text-xl">
            O Vai Agenda! organiza seus agendamentos, ajuda seus clientes a
            escolherem um horário e deixa você livre para cuidar do que realmente
            importa: o seu negócio.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#planos"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3.5 font-bold text-brand-foreground shadow-[0_8px_20px_rgba(24,119,242,0.2)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              Começar gratuitamente
            </a>
            <a
              href="#vantagens"
              className="inline-flex items-center justify-center rounded-xl bg-brand-soft px-6 py-3.5 font-bold text-brand transition-all hover:-translate-y-0.5"
            >
              Conhecer a plataforma
            </a>
          </div>
          <div className="mt-5 text-sm text-muted-foreground">
            Sem cartão de crédito para começar.
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <CalendarMockup />
        </div>
      </div>
    </section>
  )
}
