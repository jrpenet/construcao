import { Check } from 'lucide-react'

const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const days = Array.from({ length: 30 }, (_, i) => i + 1)
const leadingBlanks = 1 // September 2026 starts on Tuesday-ish placeholder

export function CalendarMockup() {
  return (
    <div className="relative w-full max-w-[380px]">
      <div
        className="absolute -inset-6 rounded-[40px] bg-[linear-gradient(135deg,#dbeafe,#eff6ff)] blur-2xl"
        aria-hidden="true"
      />
      <div className="relative rounded-[28px] border border-border bg-card p-5 shadow-[0_30px_80px_rgba(24,55,100,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden="true">
            <i className="size-2.5 rounded-full bg-red-400" />
            <i className="size-2.5 rounded-full bg-amber-400" />
            <i className="size-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-[11px] font-bold tracking-widest text-muted-foreground">
            MINHA AGENDA
          </div>
        </div>

        <div className="mb-4 text-lg font-extrabold">Setembro 2026</div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((d) => (
            <div
              key={d}
              className="py-1 text-[10px] font-bold text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`b-${i}`} />
          ))}
          {days.map((day) => {
            const active = day === 10
            const dot = day === 17
            return (
              <div
                key={day}
                className={[
                  'relative flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand text-brand-foreground shadow-[0_6px_16px_rgba(24,119,242,0.35)]'
                    : 'text-foreground/80 hover:bg-brand-soft',
                ].join(' ')}
              >
                {day}
                {dot && (
                  <span className="absolute bottom-1 size-1 rounded-full bg-brand" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-[0_18px_45px_rgba(24,55,100,0.18)]">
        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="size-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <strong className="block text-sm">Agendamento confirmado</strong>
          <small className="text-xs text-muted-foreground">Hoje · 14:30</small>
        </div>
      </div>
    </div>
  )
}
