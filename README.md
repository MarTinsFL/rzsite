# RZ Design RJ — Construímos o que as pessoas notam

Site multipágina em React + TypeScript + Vite, com GSAP/ScrollTrigger, Lenis e WebGL leve. Cada rota é pré-renderizada em HTML estático (conteúdo e SEO antes do JavaScript) e depois recebe as interações.

## Executar

```sh
npm install
npm run dev        # desenvolvimento
npm run build      # build + HTML estático por rota + sitemap
npm run preview    # serve o build com URLs limpas e 404 real
npm run test:e2e   # verificação completa (rode depois do build)
```

## Páginas

| Rota | Conteúdo |
| --- | --- |
| `/` | Trailer da RZ: abertura (wireframe → estrutura → ACM → letras → luz), hero em 6 camadas, construção pinada, 3 projetos, vista explodida, Material Reactor, serviços, antes/depois, RZ como máscara, LIGHT / ON e o momento final |
| `/projetos` | Portfólio editorial com filtros |
| `/projetos/[slug]` | Página própria de cada projeto (`src/data/projects.ts`) |
| `/servicos` | Cinco serviços, um por tela, cada um com sua cena |
| `/sobre` | Por trás da fachada: processo, material e princípios |
| `/contato` | Orçamento em 6 etapas com pré-visualização do letreiro |
| qualquer outra | 404 "Essa fachada ainda não existe." (status 404) |

Os links do menu principal (Projetos, Serviços, Sobre, Contato) e os CTAs internos abrem em nova aba (`target="_blank"` + `rel="noopener noreferrer"`), via `src/components/PageLink.tsx`. A Home permanece aberta. Não há âncoras de seção.

O build gera `dist/rota/index.html` **e** `dist/rota.html`, além de `dist/404.html`, para funcionar em hospedagens estáticas com ou sem "URLs limpas".

## Imagens: conceito × portfólio real

Todas as imagens atuais são **visualizações conceituais geradas por IA** (Higgsfield — `z_image`; o "antes" do antes/depois foi editado a partir do "depois" com Seedream 5.0 Flash). O site sempre as identifica ("Estudo conceitual", "Imagem conceitual · IA") e **nunca** as apresenta como obras realizadas. Cliente, local e ano não são exibidos em estudos conceituais.

- Fontes originais e prompts: `media-src/` e `media-src/sources.json`.
- `npm run images` gera AVIF + WebP em 4 larguras em `public/media/` e o manifesto `src/data/media.json`.

**Para publicar uma obra real da RZ**

1. Coloque a foto em `media-src/`, registre em `sources.json` com `"kind": "foto"` (sem o selo de IA) e rode `npm run images`. Para uma nova imagem, adicione o id também em `MediaId` (`src/data/media.ts`).
2. Em `src/data/projects.ts`, copie um projeto, mude `status` para `'realizado'` e preencha só o que for confirmado (`client`, `location`, `year`). Campos vazios não aparecem.
3. Projetos exibidos na Home: `selectedSlugs` no mesmo arquivo.

Uma imagem referenciada que ainda não exista aparece como espaço reservado técnico, pronto para a foto real.

## Contatos e orçamento

Variáveis (veja `.env.example`): `VITE_WHATSAPP`, `VITE_INSTAGRAM_URL`, `VITE_SITE_URL` (canonical, Open Graph e sitemap) e `VITE_QUOTE_ENDPOINT` (opcional).

Com `VITE_QUOTE_ENDPOINT`, o orçamento envia `multipart/form-data` com `name`, `company`, `location`, `type`, `phone` e `photo`. Sem endpoint, abre o WhatsApp da RZ com o briefing pronto (a foto é anexada na conversa). Sem nenhum canal, baixa o briefing em `.txt`. Nenhum envio é simulado como concluído.

## Ajustes rápidos

- Headline do hero: `HEADLINE` em `src/pages/home/Hero.tsx` (`'notam'` ou `'vista'`).
- Micro-sons: sintetizados em WebAudio (`src/lib/sound.ts`), desligados por padrão, só após o visitante ligar "Sound".
- Movimento reduzido: sem abertura animada; seções pinadas mostram o estado final e as faixas horizontais viram rolagem lateral.

## Estrutura

```
src/app/         Shell, navegação, cursor, rolagem, transições de página, rodapé
src/pages/       uma pasta por página (componentes + CSS próprio, carregados sob demanda)
src/components/  Media, BeforeAfter, Logo (logo original animada por camadas), AcmShader, Marquee…
src/data/        projetos, serviços e manifesto de imagens
src/lib/         runtime de animação, sons, contornos da logo, transição de projeto
scripts/         images (otimização), prerender (HTML por rota), verify (testes)
```

Fontes locais: Archivo (variável, eixos de peso e largura) e IBM Plex Mono — licenças OFL em `public/fonts/`.
