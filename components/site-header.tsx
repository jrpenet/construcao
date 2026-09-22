'use client'

import { useState } from 'react'
import { CalendarCheck, Menu, X } from 'lucide-react'

const navItems = [
  { label: 'Vantagens', href: '#vantagens' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Planos', href: '#planos' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] w-[min(1160px,calc(100%-40px))] items-center justify-between gap-7">
        <a
          href="#inicio"
          className="flex items-center gap-2.5 text-xl font-extrabold whitespace-nowrap"
          aria-label="Vai Agenda!"
        >
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-brand text-brand-foreground shadow-[0_8px_20px_rgba(24,119,242,0.25)]">
            <CalendarCheck className="size-5" aria-hidden="true" />
          </span>
          <span>Vai Agenda!</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-brand"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#planos"
            className="hidden rounded-xl bg-brand px-5 py-3 text-sm font-bold text-brand-foreground shadow-[0_8px_20px_rgba(24,119,242,0.2)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark sm:inline-flex"
          >
            Começar agora
          </a>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:border-brand hover:text-brand md:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background md:hidden">
          <nav className="mx-auto flex w-[min(1160px,calc(100%-40px))] flex-col py-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand-soft hover:text-brand"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#planos"
              className="mt-2 rounded-xl bg-brand px-5 py-3 text-center text-sm font-bold text-brand-foreground"
              onClick={() => setOpen(false)}
            >
              Começar agora
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
