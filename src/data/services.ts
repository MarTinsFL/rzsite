import type { MediaId } from './media'

/** Serviços da RZ (os mesmos confirmados na versão anterior do site). */
export type Service = {
  number: string
  name: string
  short: string
  lead: string
  body: string
  media: MediaId
  detail: MediaId
  specs: { label: string; value: string }[]
  scene: 'acm' | 'letter' | 'sign' | 'visual' | 'custom'
}

export const services: Service[] = [
  {
    number: '01',
    name: 'Fachadas em ACM',
    short: 'Revestimento que organiza a fachada inteira.',
    lead: 'Um plano contínuo, preciso e durável no lugar de uma fachada fragmentada.',
    body: 'Projetamos a paginação dos painéis, a subestrutura e cada dobra. O resultado é uma superfície limpa, com juntas alinhadas e acabamento que resiste ao sol e à chuva da cidade.',
    media: 'fachada-instalacao',
    detail: 'acm-junta',
    specs: [{ label: 'Material', value: 'ACM · composto de alumínio' }, { label: 'Estrutura', value: 'Subestrutura metálica' }, { label: 'Detalhe', value: 'Dobras, juntas e fixação' }],
    scene: 'acm',
  },
  {
    number: '02',
    name: 'Letras caixa',
    short: 'Volume, sombra e luz para a sua marca.',
    lead: 'A tipografia sai do plano e ganha corpo, lateral e profundidade.',
    body: 'Letras em aço, ACM ou acrílico, com ou sem iluminação. Cada peça é dimensionada para a distância de leitura e fixada com o afastamento certo da parede.',
    media: 'letras-nova',
    detail: 'letra-retorno-halo',
    specs: [{ label: 'Materiais', value: 'Aço · ACM · acrílico · PVC' }, { label: 'Luz', value: 'Face, halo ou sem luz' }, { label: 'Fixação', value: 'Espaçadores e pinos' }],
    scene: 'letter',
  },
  {
    number: '03',
    name: 'Letreiros luminosos',
    short: 'Presença que continua depois do pôr do sol.',
    lead: 'Quando a rua escurece, a marca continua sendo o ponto mais visível da quadra.',
    body: 'Letreiros com LED distribuído para brilho uniforme, sem pontos de luz aparentes, e com a intensidade certa para cada fachada e vizinhança.',
    media: 'bar-noturno',
    detail: 'led-interno',
    specs: [{ label: 'Iluminação', value: 'LED distribuído' }, { label: 'Faces', value: 'Acrílico leitoso' }, { label: 'Leitura', value: 'Dia e noite' }],
    scene: 'sign',
  },
  {
    number: '04',
    name: 'Comunicação visual',
    short: 'Uma linguagem aplicada a todo o espaço.',
    lead: 'Placas, sinalização, adesivos e peças internas falando a mesma língua da fachada.',
    body: 'Do primeiro contato na rua até o último corredor, a identidade é aplicada com o mesmo cuidado de material, proporção e acabamento.',
    media: 'comunicacao-lobby',
    detail: 'estrutura-metalon',
    specs: [{ label: 'Peças', value: 'Placas · sinalização · adesivos' }, { label: 'Ambientes', value: 'Fachada e interiores' }, { label: 'Sistema', value: 'Uma identidade, todo o espaço' }],
    scene: 'visual',
  },
  {
    number: '05',
    name: 'Projetos personalizados',
    short: 'Quando o espaço pede uma peça que ainda não existe.',
    lead: 'Totens, painéis e peças sob medida, desenhadas para o lugar onde vão viver.',
    body: 'Partimos do espaço, da marca e do uso. Desenho técnico, protótipo de material e fabricação acompanham a peça do papel à instalação.',
    media: 'totem-120',
    detail: 'cnc-acm',
    specs: [{ label: 'Peças', value: 'Totens · painéis · objetos' }, { label: 'Processo', value: 'Desenho → protótipo → obra' }, { label: 'Escala', value: 'Do detalhe à fachada' }],
    scene: 'custom',
  },
]
