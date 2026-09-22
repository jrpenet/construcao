import type { SVGProps } from 'react'
import { CalendarCheck } from 'lucide-react'

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

const columns = [
  {
    title: 'Produto',
    links: [
      { label: 'Vantagens', href: '#vantagens' },
      { label: 'Diferenciais', href: '#diferenciais' },
      { label: 'Planos', href: '#planos' },
      { label: 'Página de exemplo', href: 'https://teste.vaiagenda.com.br' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nós', href: '#inicio' },
      { label: 'Depoimentos', href: '#depoimentos' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Suporte',
    links: [
      { label: 'WhatsApp', href: 'https://wa.me/5581987540999' },
      { label: 'Central de ajuda', href: '#' },
      { label: 'Contato', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de uso', href: '#' },
      { label: 'Privacidade', href: '#' },
    ],
  },
]

const socials = [
  { icon: InstagramIcon, label: 'Instagram', href: '#' },
  { icon: FacebookIcon, label: 'Facebook', href: '#' },
  { icon: LinkedinIcon, label: 'LinkedIn', href: '#' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid w-[min(1160px,calc(100%-40px))] gap-10 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <a
            href="#inicio"
            className="flex items-center gap-2.5 text-xl font-extrabold"
            aria-label="Vai Agenda!"
          >
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-brand text-brand-foreground">
              <CalendarCheck className="size-5" aria-hidden="true" />
            </span>
            Vai Agenda!
          </a>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Agendamento online simples e profissional para o seu negócio.
            Personalize, divulgue e ganhe tempo.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <social.icon className="size-5" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h4 className="text-sm font-bold">{column.title}</h4>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-[min(1160px,calc(100%-40px))] flex-col items-center justify-between gap-3 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} Vai Agenda! Todos os direitos
            reservados.
          </span>
          <span>Feito com atenção aos seus horários.</span>
        </div>
      </div>
    </footer>
  )
}
