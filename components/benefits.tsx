import { Check, Globe, Paintbrush, ListChecks } from 'lucide-react'

const rows = [
  {
    eyebrow: 'A sua marca, do seu jeito',
    icon: Paintbrush,
    title: 'Personalize cores, frases e a cara da sua página',
    description:
      'Cada negócio é único. Escolha as cores, escreva as frases que combinam com o seu atendimento e deixe a página de agendamento com a identidade da sua marca.',
    points: [
      'Cores personalizadas para a sua página',
      'Frases e textos que você mesmo escolhe',
      'Formulário de agendamento customizado',
    ],
    visual: 'palette' as const,
  },
  {
    eyebrow: 'Presença profissional',
    icon: Globe,
    title: 'Seu negócio com nome próprio no subdomínio',
    description:
      'Tenha um endereço com o nome do seu negócio para divulgar. Configure o link de redirecionamento pós-agendamento e mantenha site e agenda sempre conectados.',
    points: [
      'Subdomínio com o nome do seu negócio',
      'Redirecionamento após o agendamento',
      'Integração entre o seu site e a agenda',
    ],
    visual: 'domain' as const,
  },
]

function Visual({ kind }: { kind: 'palette' | 'domain' }) {
  if (kind === 'palette') {
    return (
      <div className="relative rounded-3xl border border-border bg-gradient-to-br from-brand-soft to-background p-8">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_20px_50px_rgba(24,55,100,0.12)]">
          <div className="flex items-center gap-2">
            <ListChecks className="size-5 text-brand" aria-hidden="true" />
            <span className="text-sm font-bold">Formulário de agendamento</span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-9 rounded-lg bg-muted" />
            <div className="h-9 rounded-lg bg-muted" />
            <div className="h-9 w-2/3 rounded-lg bg-muted" />
            <div className="h-10 rounded-lg bg-brand" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-3">
          {['#1877f2', '#16a34a', '#9333ea', '#f97316', '#0f172a'].map((c) => (
            <span
              key={c}
              className="size-8 rounded-full ring-2 ring-white shadow-md"
              style={{ backgroundColor: c }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-3xl border border-border bg-gradient-to-br from-brand-soft to-background p-8">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_20px_50px_rgba(24,55,100,0.12)]">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm">
          <Globe className="size-4 text-brand" aria-hidden="true" />
          <span className="font-semibold text-foreground/70">
            seunegocio
            <span className="text-muted-foreground">.vaiagenda.com.br</span>
          </span>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-24 rounded-lg bg-gradient-to-br from-brand/15 to-brand-soft" />
          <div className="h-3 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

export function Benefits() {
  return (
    <section className="bg-[#f8fafd] py-20 md:py-24">
      <div className="mx-auto flex w-[min(1160px,calc(100%-40px))] flex-col gap-20">
        {rows.map((row, index) => (
          <div
            key={row.title}
            className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
          >
            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-2 text-[13px] font-extrabold text-brand">
                <row.icon className="size-4" aria-hidden="true" />
                {row.eyebrow}
              </div>
              <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
                {row.title}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {row.description}
              </p>
              <ul className="mt-6 space-y-3">
                {row.points.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                    <span className="font-medium">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
              <Visual kind={row.visual} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
