import type { MediaId } from './media'

/**
 * Portfólio da RZ — estrutura pronta para CMS.
 *
 * status 'conceito'  → estudo visual com imagens geradas por IA. O site sempre exibe o selo
 *                      "Estudo conceitual" e nunca mostra cliente, local real ou ano.
 * status 'realizado' → obra executada pela RZ, com fotos reais e dados autorizados.
 *
 * Para publicar uma obra real: copie um item, troque `status` para 'realizado', aponte `hero`,
 * `gallery` e `beforeAfter` para fotos reais (veja scripts/images.mjs) e preencha somente
 * os campos confirmados (client, location, year). Campos vazios simplesmente não aparecem.
 */

export type ProjectCategory = 'fachadas' | 'acm' | 'letras-caixa' | 'letreiros' | 'iluminacao'

export const categoryLabels: Record<ProjectCategory, string> = {
  fachadas: 'Fachadas',
  acm: 'ACM',
  'letras-caixa': 'Letras caixa',
  letreiros: 'Letreiros',
  iluminacao: 'Iluminação',
}

/** Recorte editorial de uma imagem: foco (0–100) e ampliação. */
export type Crop = { x: number; y: number; zoom: number }

/** focus: ponto de interesse (CSS object-position) usado quando a imagem é recortada em retrato. */
export type ProjectImage = { media: MediaId; alt: string; crop?: Crop; focus?: string }

export type GalleryItem = ProjectImage & {
  /** full = 100vw · wide = 60vw · pair = duas lado a lado · tall = vertical · inset = recorte pequeno */
  layout: 'full' | 'wide' | 'pair' | 'tall' | 'inset'
  caption?: string
}

export type Project = {
  slug: string
  status: 'conceito' | 'realizado'
  title: string
  type: string
  categories: ProjectCategory[]
  summary: string
  concept: string
  challenge: string
  solution: string
  materials: { name: string; spec: string }[]
  hero: ProjectImage
  gallery: GalleryItem[]
  beforeAfter?: { before: ProjectImage; after: ProjectImage }
  /** Somente para obras reais e autorizadas. */
  client?: string
  location?: string
  year?: string
}

export const projects: Project[] = [
  {
    slug: 'fachada-acm-restaurante',
    status: 'conceito',
    title: 'Mar',
    type: 'Restaurante de esquina',
    categories: ['fachadas', 'acm', 'iluminacao'],
    summary: 'A fachada como a primeira mesa servida.',
    concept: 'Um restaurante de esquina precisa ser lido de longe e sentido de perto. O estudo trata o volume inteiro como uma peça escura e silenciosa, onde só o nome acende.',
    challenge: 'Ganhar presença na esquina sem perder a atmosfera intimista que o salão promete.',
    solution: 'Painéis de ACM preto fosco organizam o volume. Um brise vertical em madeira aquece a leitura. Letras caixa em latão escovado com luz halo marcam o nome sem ofuscar.',
    materials: [
      { name: 'ACM', spec: 'Preto fosco · juntas finas' },
      { name: 'Letra caixa', spec: 'Latão escovado · luz halo' },
      { name: 'Brise', spec: 'Madeira em réguas verticais' },
      { name: 'Iluminação', spec: 'LED quente indireto' },
    ],
    hero: { media: 'restaurante-mar', alt: 'Visualização conceitual: fachada de restaurante em ACM preto com brise de madeira e letras em latão iluminadas ao entardecer' },
    gallery: [
      { media: 'restaurante-mar', alt: 'Recorte das letras em latão com luz halo sobre o ACM preto', crop: { x: 52, y: 30, zoom: 2.3 }, layout: 'wide', caption: 'Luz halo: o nome aparece sem ofuscar.' },
      { media: 'letra-retorno-halo', alt: 'Detalhe conceitual da lateral de uma letra caixa com halo de LED', layout: 'tall', caption: 'Lateral, espaçador e halo.' },
      { media: 'acm-junta', alt: 'Detalhe conceitual da junta entre painéis de ACM preto fosco', layout: 'inset', caption: 'Junta seca entre painéis.' },
      { media: 'restaurante-mar', alt: 'Recorte do brise de madeira junto ao ACM', crop: { x: 20, y: 55, zoom: 1.8 }, layout: 'full' },
    ],
  },
  {
    slug: 'totem-acm-corporativo',
    status: 'conceito',
    title: '120',
    type: 'Edifício corporativo',
    categories: ['acm', 'letreiros'],
    summary: 'Um monólito para orientar a chegada.',
    concept: 'Antes da portaria, o totem já apresenta o endereço. Um volume preto, vertical, com uma única linha de luz.',
    challenge: 'Sinalizar o acesso de um edifício em uma praça aberta sem competir com a arquitetura.',
    solution: 'Totem revestido em ACM preto fosco, números em alumínio escovado e um rasgo vertical retroiluminado em verde.',
    materials: [
      { name: 'Totem', spec: 'ACM preto fosco' },
      { name: 'Números', spec: 'Alumínio escovado' },
      { name: 'Iluminação', spec: 'Rasgo retroiluminado' },
    ],
    hero: { media: 'totem-120', alt: 'Visualização conceitual: totem monolítico em ACM preto com linha de luz verde em praça corporativa' },
    gallery: [
      { media: 'totem-120', alt: 'Recorte dos números em alumínio escovado', crop: { x: 50, y: 30, zoom: 2.4 }, layout: 'tall' },
      { media: 'acm-chapas', alt: 'Chapas de ACM em quatro acabamentos', layout: 'wide', caption: 'Acabamentos: do preto ao verde.' },
      { media: 'cnc-acm', alt: 'Fresagem conceitual de dobra em chapa de ACM', layout: 'inset' },
    ],
  },
  {
    slug: 'letreiro-luminoso-bar',
    status: 'conceito',
    title: 'Bar',
    type: 'Bar de esquina',
    categories: ['letreiros', 'iluminacao'],
    summary: 'Três letras para a noite inteira.',
    concept: 'Num casarão antigo, a intervenção é mínima: um volume preto e três letras que acendem quando a rua escurece.',
    challenge: 'Respeitar a fachada histórica e, ainda assim, ser o ponto mais visível da esquina à noite.',
    solution: 'Caixa em ACM preto fosco recebendo letras caixa com face em acrílico leitoso e LED interno, com brilho uniforme e sem pontos de luz aparentes.',
    materials: [
      { name: 'Letreiro', spec: 'Face em acrílico leitoso' },
      { name: 'Iluminação', spec: 'Módulos de LED internos' },
      { name: 'Caixa', spec: 'ACM preto fosco' },
    ],
    hero: { media: 'bar-noturno', alt: 'Visualização conceitual: letreiro luminoso BAR com letras de acrílico iluminadas em fachada antiga à noite' },
    gallery: [
      { media: 'led-interno', alt: 'Interior conceitual de uma letra caixa com módulos de LED', layout: 'tall', caption: 'Dentro da letra: LED distribuído.' },
      { media: 'bar-noturno', alt: 'Recorte das letras iluminadas', crop: { x: 44, y: 24, zoom: 2.2 }, layout: 'wide', caption: 'Brilho uniforme, sem pontos.' },
      { media: 'atras-do-letreiro', alt: 'Bastidor conceitual de um letreiro iluminado visto por trás', layout: 'full' },
    ],
  },
  {
    slug: 'fachada-acm-varejo',
    status: 'conceito',
    title: 'Moda',
    type: 'Loja de varejo',
    categories: ['fachadas', 'acm'],
    summary: 'O mesmo endereço, outra presença.',
    concept: 'Uma loja de rua entre sobrados antigos. A fachada deixa de ser um acúmulo de intervenções e vira um único plano limpo.',
    challenge: 'Unificar reboco desgastado, fiação aparente e um luminoso antigo sem mudar a estrutura do imóvel.',
    solution: 'Revestimento completo em ACM claro modulado, vitrines emolduradas em preto e letras caixa pretas centradas sobre a entrada.',
    materials: [
      { name: 'ACM', spec: 'Prata claro · grade modular' },
      { name: 'Letra caixa', spec: 'Preta · face plana' },
      { name: 'Vitrines', spec: 'Molduras pretas' },
    ],
    hero: { media: 'varejo-moda', alt: 'Visualização conceitual: fachada de loja revestida em ACM claro com letras caixa pretas' },
    beforeAfter: {
      before: { media: 'varejo-antes', alt: 'Simulação do antes: fachada antiga com reboco desgastado, luminoso apagado e fiação aparente' },
      after: { media: 'varejo-moda', alt: 'Simulação do depois: a mesma fachada revestida em ACM com letras caixa' },
    },
    gallery: [
      { media: 'acm-junta', alt: 'Detalhe conceitual de junta entre painéis de ACM', layout: 'inset', caption: 'Modulação e juntas.' },
      { media: 'fachada-instalacao', alt: 'Fachada conceitual em instalação, com estrutura metálica aparente', layout: 'full', caption: 'Estrutura antes do revestimento.' },
      { media: 'cnc-acm', alt: 'Usinagem conceitual de chapa de ACM em fresadora CNC', layout: 'wide' },
    ],
  },
  {
    slug: 'fachada-esquina-iluminada',
    status: 'conceito',
    title: 'Esquina',
    type: 'Edifício comercial',
    categories: ['fachadas', 'acm', 'iluminacao'],
    summary: 'Um volume inteiro esperando a próxima marca.',
    concept: 'Um prédio de esquina tratado como uma única superfície contínua, com luz rasante que revela o material à noite.',
    challenge: 'Dar unidade a duas fachadas de uma esquina sem criar um bloco pesado.',
    solution: 'ACM preto contornando a esquina, faixa de testeira contínua pronta para a marca e iluminação rasante de baixo para cima.',
    materials: [
      { name: 'ACM', spec: 'Preto fosco contínuo' },
      { name: 'Iluminação', spec: 'Wall washer rasante' },
      { name: 'Testeira', spec: 'Faixa contínua para marca' },
    ],
    hero: { media: 'esquina-noturna', focus: '44% 50%', alt: 'Visualização conceitual: prédio de esquina revestido em ACM preto com iluminação rasante à noite' },
    gallery: [
      { media: 'esquina-noturna', alt: 'Recorte da luz rasante sobre o ACM', crop: { x: 35, y: 60, zoom: 2.2 }, layout: 'wide' },
      { media: 'fachada-instalacao', alt: 'Estrutura metálica e painéis de ACM durante a instalação', layout: 'full' },
      { media: 'acm-junta', alt: 'Junta entre painéis de ACM', layout: 'inset' },
    ],
  },
  {
    slug: 'letras-caixa-inox-clinica',
    status: 'conceito',
    title: 'Nova',
    type: 'Clínica',
    categories: ['letras-caixa'],
    summary: 'Volume e sombra em vez de cor.',
    concept: 'Para uma clínica, a marca precisa transmitir precisão antes de qualquer palavra. O estudo usa apenas o metal e a luz do dia.',
    challenge: 'Destacar o nome em uma parede de concreto claro sem recorrer a contraste agressivo.',
    solution: 'Letras caixa em aço inox escovado, afastadas da parede por espaçadores ocultos. A sombra projetada desenha a marca uma segunda vez ao longo do dia.',
    materials: [
      { name: 'Letra caixa', spec: 'Aço inox escovado' },
      { name: 'Fixação', spec: 'Espaçadores ocultos' },
      { name: 'Base', spec: 'Concreto aparente claro' },
    ],
    hero: { media: 'letras-nova', alt: 'Visualização conceitual: letras caixa em aço inox escovado sobre parede de concreto com luz rasante' },
    gallery: [
      { media: 'letras-nova', alt: 'Recorte da letra O em aço escovado e sua sombra', crop: { x: 42, y: 55, zoom: 2.6 }, layout: 'tall', caption: 'A sombra desenha a marca de novo.' },
      { media: 'letras-nova', alt: 'Recorte da junção entre as letras V e A', crop: { x: 72, y: 50, zoom: 2.1 }, layout: 'wide' },
      { media: 'estrutura-metalon', alt: 'Perfil de alumínio escovado em estudo de estrutura', layout: 'inset', caption: 'Perfil, corte e acabamento.' },
    ],
  },
  {
    slug: 'fachada-iluminada-academia',
    status: 'conceito',
    title: 'Pulso',
    type: 'Academia',
    categories: ['fachadas', 'iluminacao', 'letras-caixa'],
    summary: 'Uma fachada que treina a noite toda.',
    concept: 'A energia de dentro aparece do lado de fora. Linhas de luz percorrem o volume e o nome flutua sobre um halo verde.',
    challenge: 'Ser reconhecida em uma avenida larga, à noite, por quem passa de carro.',
    solution: 'ACM preto com perfis de LED embutidos em linhas horizontais e letras caixa com luz halo, lidas a distância sem poluir o volume.',
    materials: [
      { name: 'ACM', spec: 'Preto fosco' },
      { name: 'Iluminação', spec: 'Perfis de LED embutidos' },
      { name: 'Letra caixa', spec: 'Luz halo verde' },
    ],
    hero: { media: 'academia-pulso', focus: '24% 50%', alt: 'Visualização conceitual: fachada de academia em ACM preto com linhas de LED e letras com halo verde à noite' },
    gallery: [
      { media: 'academia-pulso', alt: 'Recorte das letras com halo verde', crop: { x: 50, y: 22, zoom: 2.4 }, layout: 'wide' },
      { media: 'letra-retorno-halo', alt: 'Detalhe conceitual do halo de LED atrás da letra', layout: 'tall', caption: 'O halo desenha a letra na parede.' },
      { media: 'led-interno', alt: 'Módulos de LED no interior de uma letra caixa', layout: 'inset' },
    ],
  },
]

export const findProject = (slug: string) => projects.find(project => project.slug === slug)

/** Projetos exibidos no trailer da Home (os três mais fortes). */
export const selectedSlugs = ['fachada-acm-restaurante', 'letreiro-luminoso-bar', 'fachada-acm-varejo']
