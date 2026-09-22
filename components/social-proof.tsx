const segments = [
  'Barbearias',
  'Salões de Beleza',
  'Clínicas',
  'Estúdios',
  'Autônomos',
  'Consultórios',
]

export function SocialProof() {
  return (
    <section className="border-y border-border bg-background py-10">
      <div className="mx-auto w-[min(1160px,calc(100%-40px))]">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Feito para negócios que vivem de horários marcados
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {segments.map((name) => (
            <span
              key={name}
              className="text-lg font-extrabold tracking-tight text-foreground/35 transition-colors hover:text-foreground/60"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
