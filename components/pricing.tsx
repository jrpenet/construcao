'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'

type Billing = 'monthly' | 'annual'

type Plan = {
  name: string
  desc: string
  price: string
  period: string
  features: string[]
  cta: string
  href: string
  featured?: boolean
  badge?: string
}

const trialPlan: Plan = {
  name: 'Trial',
  desc: 'Experimente a plataforma antes de decidir. Ah, é sem cartão de crédito, pode relaxar.',
  price: 'Grátis',
  period: 'por 10 dias',
  features: [
    'Acesso à plataforma',
    'Agenda online',
    'Cadastro de serviços',
    'Link para seus clientes',
  ],
  cta: 'Começar teste',
  href: '/cadastro/?plano=basico&ciclo=monthly&trial=1',
}

const plans: Record<Billing, Plan[]> = {
  monthly: [
    {
      name: 'Básico Mensal',
      desc: 'Para quem quer profissionalizar seus agendamentos.',
      price: 'R$ 34,90',
      period: '/ mês',
      features: [
        'Agendamento online',
        'Escolha das cores de alguns itens',
        'Recebimento de pagamentos',
        'Lembretes pelo WhatsApp',
        'Link profissional para divulgação',
      ],
      cta: 'Assinar plano',
      href: '/cadastro/?plano=basico&ciclo=monthly',
      featured: true,
      badge: 'MAIS ESCOLHIDO',
    },
    {
      name: 'Pro Mensal',
      desc: 'Para negócios que querem mais presença e personalização.',
      price: 'R$ 99,90',
      period: '/ mês',
      features: [
        'Tudo do Plano Básico',
        'Perguntas customizadas',
        'Número de vagas por serviço ilimitado',
        'Lembretes pelo WhatsApp',
      ],
      cta: 'Quero o Pro',
      href: '/cadastro/?plano=pro&ciclo=monthly',
    },
  ],
  annual: [
    {
      name: 'Básico Anual',
      desc: 'A mesma simplicidade com economia no pagamento anual.',
      price: 'R$ 349,90',
      period: '/ ano',
      features: [
        'Agendamento online',
        'Escolha das cores da página',
        'Recebimento de pagamentos',
        'Lembretes pelo WhatsApp',
        'Link profissional para divulgação',
      ],
      cta: 'Assinar plano',
      href: '/cadastro/?plano=basico&ciclo=yearly',
      featured: true,
      badge: 'MAIS VANTAJOSO',
    },
    {
      name: 'Pro Anual',
      desc: 'Para negócios que querem mais presença e personalização.',
      price: 'R$ 999,00',
      period: '/ ano',
      features: [
        'Tudo do Plano Básico',
        'Perguntas customizadas',
        'Número de vagas por serviço ilimitado',
        'Lembretes pelo WhatsApp',
      ],
      cta: 'Quero o Pro',
      href: '/cadastro/?plano=pro&ciclo=yearly',
    },
  ],
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article
      className={[
        'relative flex flex-col rounded-2xl border bg-card p-8 transition-all hover:-translate-y-1',
        plan.featured
          ? 'border-brand shadow-[0_25px_60px_rgba(24,119,242,0.18)]'
          : 'border-border hover:shadow-[0_20px_50px_rgba(24,55,100,0.1)]',
      ].join(' ')}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-8 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-foreground">
          {plan.badge}
        </span>
      )}
      <h3 className="text-xl font-extrabold">{plan.name}</h3>
      <p className="mt-2 min-h-[48px] text-sm text-muted-foreground">
        {plan.desc}
      </p>
      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold">{plan.price}</span>
        <span className="text-sm text-muted-foreground">{plan.period}</span>
      </div>
      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href={plan.href}
        className={[
          'mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3.5 font-bold transition-all hover:-translate-y-0.5',
          plan.featured
            ? 'bg-brand text-brand-foreground shadow-[0_8px_20px_rgba(24,119,242,0.2)] hover:bg-brand-dark'
            : 'border border-[#cfe0f8] bg-background text-brand',
        ].join(' ')}
      >
        {plan.cta}
      </a>
    </article>
  )
}

export function Pricing() {
  const [billing, setBilling] = useState<Billing>('monthly')

  return (
    <section id="planos" className="bg-[#f8fafd] py-20 md:py-24">
      <div className="mx-auto w-[min(1160px,calc(100%-40px))]">
        <SectionHeading
          title="Escolha o plano para o seu momento"
          description="Comece pequeno e evolua conforme o seu negócio cresce."
        />

        <div
          className="mx-auto mb-10 flex w-fit items-center gap-1 rounded-full border border-border bg-card p-1"
          role="tablist"
          aria-label="Escolha a periodicidade"
        >
          {(['monthly', 'annual'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={billing === option}
              onClick={() => setBilling(option)}
              className={[
                'rounded-full px-6 py-2.5 text-sm font-bold transition-colors',
                billing === option
                  ? 'bg-brand text-brand-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {option === 'monthly' ? 'Mensal' : 'Anual'}
            </button>
          ))}
        </div>

        <div className="grid items-start gap-5 md:grid-cols-3">
          <PlanCard plan={trialPlan} />
          {plans[billing].map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Acesse a página de exemplo:{' '}
          <a
            href="https://teste.vaiagenda.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand hover:underline"
          >
            Clique aqui
          </a>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          * O período de teste do Vai Agenda! é de 10 dias.
        </p>
      </div>
    </section>
  )
}
