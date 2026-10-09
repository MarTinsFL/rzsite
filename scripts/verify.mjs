// Verificação de ponta a ponta do site estático (rode `npm run build` antes).
// Sobe `vite preview` quando necessário (ou use TEST_URL) e testa rotas, navegação em nova aba,
// interações principais, orçamento, mobile e movimento reduzido. Capturas em artifacts/.
import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

fs.mkdirSync('artifacts', { recursive: true })
const base = (process.env.TEST_URL || 'http://127.0.0.1:4173').replace(/\/$/, '')
let server
if (!process.env.TEST_URL) {
  try { await fetch(base) } catch {
    if (!fs.existsSync('dist/index.html')) throw new Error('Rode `npm run build` antes dos testes.')
    server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'ignore', windowsHide: true })
    let ready = false
    for (let i = 0; i < 100 && !ready; i++) { try { ready = (await fetch(base)).ok } catch { await delay(100) } }
    if (!ready) { server.kill(); throw new Error('A prévia não iniciou.') }
  }
}

const systemChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const executablePath = process.env.CHROME_PATH || (fs.existsSync(systemChrome) ? systemChrome : undefined)
const browser = await chromium.launch({ executablePath, headless: true })
const results = []
const ok = message => { results.push(message); console.log(`✓ ${message}`) }

async function open(context, path, { waitIntro = false } = {}) {
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' && !/status of 404/.test(message.text())) errors.push(message.text()) })
  const response = await page.goto(base + path, { waitUntil: 'networkidle' })
  if (waitIntro) await page.locator('.intro').waitFor({ state: 'detached', timeout: 9000 })
  return { page, errors, response }
}

try {
  // ---------- Rotas reais e independentes ----------
  const routes = { '/': 'Construímos o que as pessoas notam', '/projetos': 'Projetos', '/servicos': 'Serviços', '/sobre': 'Sobre', '/contato': 'Orçamento', '/projetos/fachada-acm-restaurante': 'Mar' }
  for (const [path, title] of Object.entries(routes)) {
    const response = await fetch(base + path)
    assert.equal(response.status, 200, path)
    const html = await response.text()
    assert.match(html.match(/<title>([^<]*)/)[1], new RegExp(title), path)
    assert.match(html, /<main id="conteudo" data-page="/, `${path} pré-renderizado`)
  }
  const missing = await fetch(`${base}/essa-pagina-nao-existe`)
  assert.equal(missing.status, 404)
  assert.match(await missing.text(), /ainda não existe/)
  ok('Rotas: páginas reais, HTML próprio por rota e 404 com status correto')

  // ---------- Desktop ----------
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await desktop.addInitScript(() => { window.open = url => { window.__opened = String(url); return null } })
  const home = await open(desktop, '/', { waitIntro: true })
  const page = home.page
  await page.screenshot({ path: 'artifacts/desktop-home.png' })
  assert.equal((await page.locator('h1').textContent()).trim(), 'Construímos o que as pessoas notam.')
  const navLinks = page.locator('.nav-links a')
  assert.equal(await navLinks.count(), 4)
  for (let i = 0; i < 4; i++) {
    const link = navLinks.nth(i)
    assert.match(await link.getAttribute('href'), /^\/(projetos|servicos|sobre|contato)$/)
    assert.equal(await link.getAttribute('target'), '_blank')
    assert.equal(await link.getAttribute('rel'), 'noopener noreferrer')
  }
  assert.equal(await page.locator('a[href^="#"]:not(.skip-link)').count(), 0, 'sem âncoras de seção')
  ok('Navegação: links principais abrem em nova aba (noopener noreferrer), sem âncoras')

  assert.equal(await page.locator('.sw-card').count(), 3)
  assert.equal(await page.locator('.sw-end').getAttribute('href'), '/projetos')
  assert.equal(await page.locator('.sw-end').getAttribute('target'), '_blank')
  assert.equal(await page.locator('.sound-toggle').first().getAttribute('aria-pressed'), 'false')
  ok('Home como trailer: 3 projetos, link para o arquivo completo, som desligado por padrão')

  const handle = page.getByRole('slider', { name: 'Comparar antes e depois' })
  await handle.scrollIntoViewIfNeeded()
  await page.waitForTimeout(2200)
  await handle.focus()
  await page.keyboard.press('Home')
  await page.waitForTimeout(400)
  assert.equal(await handle.getAttribute('aria-valuenow'), '0')
  for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowRight')
  assert.equal(await handle.getAttribute('aria-valuenow'), '50')
  assert.equal(await page.locator('.ba-frame.is-center').count(), 1)
  ok('Antes/depois: teclado e sinal visual exatamente em 50%')

  await page.getByRole('button', { name: /Acender o letreiro/ }).click()
  assert.equal(await page.locator('.lighton.is-on').count(), 1)
  ok('LIGHT / ON: o letreiro acende no clique')
  assert.deepEqual(home.errors, [])

  const projects = await open(desktop, '/projetos')
  assert.equal(await projects.page.locator('.pj-item').count(), 7)
  await projects.page.getByRole('button', { name: /Letras caixa/ }).click()
  await projects.page.waitForTimeout(1300)
  assert.equal(await projects.page.locator('.pj-item').count(), 2)
  assert.equal(await projects.page.getByRole('button', { name: /Letras caixa/ }).getAttribute('aria-pressed'), 'true')
  await projects.page.screenshot({ path: 'artifacts/desktop-projetos.png' })
  assert.deepEqual(projects.errors, [])
  ok('/projetos: grid editorial e filtros')

  const project = await open(desktop, '/projetos/fachada-acm-varejo')
  assert.match(await project.page.locator('.pp-disclaimer').textContent(), /Não representam uma obra executada/)
  assert.equal(await project.page.locator('.pp-meta dt', { hasText: 'Cliente' }).count(), 0)
  assert.equal(await project.page.locator('.pp-ba .ba-frame').count(), 1)
  assert.deepEqual(project.errors, [])
  ok('Projeto: estudo identificado como conceitual, sem dados inventados, com antes/depois')

  for (const path of ['/servicos', '/sobre']) {
    const visit = await open(desktop, path)
    await visit.page.screenshot({ path: `artifacts/desktop-${path.slice(1)}.png` })
    assert.deepEqual(visit.errors, [], path)
  }
  ok('/servicos e /sobre sem erros de execução')

  // ---------- Orçamento (wizard) ----------
  const contact = await open(desktop, '/contato')
  const cp = contact.page
  const next = () => cp.getByRole('button', { name: /Próximo|Pular|Finalizar/ }).click()
  await next()
  assert.match(await cp.locator('#ct-error').textContent(), /como podemos te chamar/)
  await cp.locator('#ct-name').fill('Teste automatizado')
  await next(); await cp.locator('#ct-company').fill('Empresa Teste')
  await next(); await cp.locator('#ct-location').fill('Botafogo, Rio de Janeiro')
  await next(); await cp.getByRole('button', { name: 'ACM', exact: true }).click()
  await next(); await cp.locator('#ct-photo').setInputFiles('public/images/rz-logo.png')
  await cp.locator('.ct-drop img').waitFor()
  await next(); await cp.locator('#ct-phone').fill('21999990000')
  assert.equal(await cp.locator('#ct-phone').inputValue(), '(21) 99999-0000')
  await next()
  await cp.locator('.ct-final').waitFor()
  assert.equal(await cp.locator('.sp.is-lit').count(), 1)
  await cp.screenshot({ path: 'artifacts/desktop-contato-final.png' })
  await cp.getByRole('button', { name: /Enviar pelo WhatsApp|Enviar briefing|Baixar briefing/ }).first().click()
  await cp.locator('.ct-status').waitFor()
  const opened = await cp.evaluate(() => window.__opened || '')
  if (opened) assert.match(decodeURIComponent(opened), /Empresa Teste/)
  assert.deepEqual(contact.errors, [])
  ok('Orçamento: 6 etapas, validação, foto, máscara de WhatsApp e envio para a integração configurada')
  await desktop.close()

  // ---------- Mobile ----------
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const mHome = await open(mobile, '/', { waitIntro: true })
  await mHome.page.screenshot({ path: 'artifacts/mobile-home.png' })
  await mHome.page.getByRole('button', { name: /Menu/ }).click()
  await mHome.page.waitForTimeout(900)
  assert.equal(await mHome.page.locator('.menu.is-open').count(), 1)
  assert.equal(await mHome.page.locator('.menu-item').count(), 5)
  assert.equal(await mHome.page.locator('.menu-item[href="/projetos"]').getAttribute('target'), '_blank')
  await mHome.page.screenshot({ path: 'artifacts/mobile-menu.png' })
  await mHome.page.keyboard.press('Escape')
  assert.equal(await mHome.page.locator('.menu.is-open').count(), 0)
  assert.deepEqual(mHome.errors, [])
  await mobile.close()
  // Largura real: no celular o navegador expande a área de layout se algo transborda, então a
  // medida é feita numa janela de 390 px sem emulação de zoom.
  const narrow = await browser.newContext({ viewport: { width: 390, height: 844 } })
  for (const path of ['/', '/projetos', '/projetos/fachada-acm-varejo', '/servicos', '/sobre', '/contato']) {
    const visit = await open(narrow, path)
    await visit.page.waitForTimeout(400)
    assert.equal(await visit.page.evaluate(() => document.documentElement.scrollWidth), 390, `${path} sem transbordar`)
    await visit.page.close()
  }
  await narrow.close()
  ok('Mobile: menu em tela cheia (01–05), nova aba, Escape e nenhuma página mais larga que a tela')

  // ---------- Movimento reduzido ----------
  const reduced = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  const rHome = await open(reduced, '/')
  await rHome.page.waitForTimeout(600)
  assert.equal(await rHome.page.locator('.intro').count(), 0)
  assert.equal(await rHome.page.locator('h1').count(), 1)
  const rAbout = await open(reduced, '/sobre')
  await rAbout.page.waitForTimeout(300)
  assert.equal(await rAbout.page.locator('.page-intro').evaluate(el => getComputedStyle(el).visibility), 'hidden')
  assert.deepEqual([...rHome.errors, ...rAbout.errors], [])
  ok('Movimento reduzido: sem abertura animada e conteúdo imediato')
  await reduced.close()

  fs.writeFileSync('artifacts/verification.json', JSON.stringify({ base, results, date: new Date().toISOString() }, null, 2))
  console.log(`\n${results.length} verificações aprovadas.`)
} finally {
  await browser.close()
  server?.kill()
}
