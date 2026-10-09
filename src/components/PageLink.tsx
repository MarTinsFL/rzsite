import type { AnchorHTMLAttributes, ReactNode } from 'react'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; sameTab?: boolean; children: ReactNode }

/**
 * Link para outra página do site. Regra de navegação da RZ: páginas internas abrem em nova aba
 * (target _blank + rel noopener noreferrer). A Home e links de retorno usam `sameTab`.
 */
export default function PageLink({ to, sameTab = false, children, ...rest }: Props) {
  if (sameTab) return <a href={to} {...rest}>{children}</a>
  return (
    <a href={to} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  )
}
