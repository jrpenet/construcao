export function CtaSection() {
  return (
    <section className="bg-background py-20 md:py-24">
      <div className="mx-auto w-[min(1160px,calc(100%-40px))]">
        <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#1877f2,#0d5fd1)] px-8 py-16 text-center text-brand-foreground shadow-[0_25px_70px_rgba(24,119,242,0.35)] md:px-16">
          <div
            className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
              Pronto para organizar sua agenda?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-white/85">
              Comece agora e descubra como o Vai Agenda! pode deixar seu negócio
              mais simples, profissional e organizado.
            </p>
            <a
              href="#planos"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 font-bold text-brand transition-transform hover:-translate-y-0.5"
            >
              Começar gratuitamente
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
