import './home.css'
import Marquee from '../../components/Marquee'
import Construction from './Construction'
import Exploded from './Exploded'
import FinalLight from './FinalLight'
import Hero from './Hero'
import Intro from './Intro'
import LightOn from './LightOn'
import MaterialReactor from './MaterialReactor'
import RZMask from './RZMask'
import SelectedWork from './SelectedWork'
import ServicesTeaser from './ServicesTeaser'
import Statement from './Statement'
import Transformation from './Transformation'

const materials = ['ACM', 'Letra caixa', 'LED', 'Aço escovado', 'Acrílico', 'PVC expandido', 'Vidro', 'Concreto', 'Luz']

/** A Home é um trailer: impacto, alguns projetos, alguns serviços, material, luz e transformação. */
export default function HomePage() {
  return (
    <>
      <Intro />
      <Hero />
      <Statement />
      <Construction />
      <Marquee items={materials} label="Materiais: ACM, letra caixa, LED, aço escovado, acrílico, PVC expandido, vidro, concreto e luz" />
      <SelectedWork />
      <Exploded />
      <MaterialReactor />
      <ServicesTeaser />
      <Transformation />
      <RZMask />
      <LightOn />
      <FinalLight />
    </>
  )
}
