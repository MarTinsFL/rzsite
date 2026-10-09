import type { ReactNode } from 'react'
import { metaFor, type RouteMatch } from '../routes'
import Cursor from './Cursor'
import Footer from './Footer'
import Navigation from './Navigation'
import PageIntro from './PageIntro'
import ScrollUi from './ScrollUi'

export default function Shell({ match, children }: { match: RouteMatch; children: ReactNode }) {
  const meta = metaFor(match)
  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <PageIntro variant={meta.intro} />
      <Navigation match={match} meta={meta} />
      <main id="conteudo" data-page={match.key}>{children}</main>
      <Footer match={match} meta={meta} />
      <ScrollUi />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
