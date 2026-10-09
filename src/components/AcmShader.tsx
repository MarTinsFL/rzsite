import { useEffect, useRef } from 'react'

export type Finish = { base: [number, number, number]; metal: number; rough: number; aniso: number; clear: number; brush: number }

/** Acabamentos de ACM em espaço de cor linear. */
export const finishes: Record<'black' | 'brushed' | 'white' | 'green', Finish> = {
  black: { base: [0.011, 0.011, 0.011], metal: 0, rough: 0.26, aniso: 0, clear: 0.62, brush: 0 },
  brushed: { base: [0.6, 0.61, 0.62], metal: 1, rough: 0.3, aniso: 0.88, clear: 0, brush: 1 },
  white: { base: [0.8, 0.8, 0.78], metal: 0, rough: 0.2, aniso: 0, clear: 0.62, brush: 0 },
  green: { base: [0.4, 0.62, 0.06], metal: 0.18, rough: 0.28, aniso: 0, clear: 0.5, brush: 0 },
}

const vertex = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`

const fragment = `
precision highp float;
uniform vec2 uRes; uniform vec3 uLight; uniform vec2 uTilt; uniform float uTime;
uniform vec3 uBase; uniform float uMetal; uniform float uRough; uniform float uAniso; uniform float uClear; uniform float uBrush;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n1(float x){ float i = floor(x); float f = fract(x); return mix(hash(vec2(i, 1.7)), hash(vec2(i + 1.0, 1.7)), f * f * (3.0 - 2.0 * f)); }
mat3 rx(float a){ float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 ry(float a){ float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
vec3 studio(vec3 d){
  float strip1 = smoothstep(0.07, 0.0, abs(d.x - 0.58)) * smoothstep(-0.55, 0.2, d.y);
  float strip2 = smoothstep(0.05, 0.0, abs(d.x + 0.74)) * 0.55;
  float top = smoothstep(0.45, 0.98, d.y) * 0.65;
  float floorBounce = smoothstep(-0.2, -0.9, d.y) * 0.05;
  return vec3(1.0, 0.985, 0.95) * (strip1 * 2.4 + strip2 * 1.3 + top) + vec3(floorBounce);
}
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 ro = vec3(0.0, 0.0, 3.3);
  vec3 rd = normalize(vec3(p, -2.05));
  mat3 R = ry(uTilt.x) * rx(uTilt.y);
  mat3 Ri = rx(-uTilt.y) * ry(-uTilt.x);
  vec3 n0 = R * vec3(0.0, 0.0, 1.0);
  float t = -dot(ro, n0) / dot(rd, n0);
  float vig = 1.0 - 0.55 * dot(p, p);
  vec3 col = mix(vec3(0.006), vec3(0.03, 0.031, 0.028), vig);
  vec2 halfSize = vec2(1.1, 0.64);
  if (t > 0.0) {
    vec3 hit = ro + rd * t;
    vec2 uv = (Ri * hit).xy;
    vec2 q = abs(uv);
    vec2 sd = abs(uv - vec2(0.07, -0.1)) - halfSize;
    float outside = length(max(sd, 0.0)) + min(max(sd.x, sd.y), 0.0);
    col *= 1.0 - 0.75 * smoothstep(0.32, -0.02, outside);
    if (q.x < halfSize.x && q.y < halfSize.y) {
      float joint = 0.011;
      if (q.x < joint) {
        col = vec3(0.002);
      } else {
        float exOuter = halfSize.x - q.x;
        float exJoint = q.x - joint;
        float ey = halfSize.y - q.y;
        float fold = 0.034;
        vec3 nl = vec3(0.0, 0.0, 1.0);
        float e = min(min(exOuter, exJoint), ey);
        if (e < fold) {
          float k = 1.0 - e / fold;
          vec2 dir;
          if (ey <= min(exOuter, exJoint)) dir = vec2(0.0, sign(uv.y));
          else if (exOuter < exJoint) dir = vec2(sign(uv.x), 0.0);
          else dir = vec2(-sign(uv.x), 0.0);
          float a = k * k * 1.35;
          nl = normalize(vec3(dir * sin(a), cos(a)));
        }
        float b = n1(uv.y * 950.0 + n1(uv.y * 31.0) * 7.0) - 0.5;
        float b2 = n1(uv.y * 2600.0 + uv.x * 3.0) - 0.5;
        nl.y += (b * 0.075 + b2 * 0.035) * uBrush;
        float peel = (hash(floor(uv * 420.0)) - 0.5) * 0.012 * (1.0 - uBrush);
        nl.xy += peel;
        nl = normalize(nl);
        vec3 N = normalize(R * nl);
        vec3 V = normalize(ro - hit);
        vec3 L = normalize(uLight - hit);
        vec3 H = normalize(L + V);
        vec3 T = normalize(R * vec3(1.0, 0.0, 0.0));
        vec3 B = normalize(cross(N, T));
        float NdL = max(dot(N, L), 0.0);
        float NdV = max(dot(N, V), 0.001);
        float NdH = max(dot(N, H), 0.001);
        float ax = max(0.035, uRough * mix(1.0, 0.18, uAniso));
        float ay = max(0.035, uRough * mix(1.0, 1.6, uAniso));
        float hx = dot(H, T) / ax;
        float hy = dot(H, B) / ay;
        float ward = exp(-(hx * hx + hy * hy) / (NdH * NdH)) / (12.566 * ax * ay * sqrt(max(NdL * NdV, 0.0001)));
        vec3 F0 = mix(vec3(0.04), uBase, uMetal);
        vec3 F = F0 + (1.0 - F0) * pow(1.0 - max(dot(H, V), 0.0), 5.0);
        float dist = length(uLight - hit);
        float atten = 10.0 / (1.0 + 0.8 * dist * dist);
        vec3 diffuse = (1.0 - uMetal) * uBase * 0.3183;
        col = (diffuse + F * ward * 0.32) * NdL * atten * vec3(1.0, 0.97, 0.92);
        vec3 Rv = reflect(-V, N);
        vec3 env = studio(Rv);
        float gloss = mix(1.0, 0.25, smoothstep(0.1, 0.45, uRough));
        vec3 Fv = F0 + (1.0 - F0) * pow(1.0 - NdV, 5.0);
        col += env * Fv * gloss * mix(uClear, 1.0, uMetal) * 0.85;
        col += uBase * 0.018;
        float edgeLine = smoothstep(0.004, 0.0, min(exJoint, min(exOuter, ey)));
        col *= 1.0 - edgeLine * 0.6;
      }
    }
  }
  col = col / (1.0 + col);
  col = pow(col, vec3(0.4545));
  col += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.018;
  gl_FragColor = vec4(col, 1.0);
}`

type Props = { finish: Finish; className?: string; onLight?: (x: number, y: number) => void }

/**
 * Painel de ACM em tempo real (WebGL puro, sem bibliotecas). A luz segue o ponteiro e o
 * acabamento muda por interpolação física. Fora da tela, o render para.
 */
export default function AcmShader({ finish, className = '', onLight }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const target = useRef(finish)
  const lightCb = useRef(onLight)
  target.current = finish
  lightCb.current = onLight

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const gl = el.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' })
    if (!gl) { el.dataset.fallback = 'true'; return }
    const compile = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { el.dataset.fallback = 'true'; return }
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = (name: string) => gl.getUniformLocation(program, name)
    const uRes = u('uRes'), uLight = u('uLight'), uTilt = u('uTilt'), uTime = u('uTime'), uBase = u('uBase'), uMetal = u('uMetal'), uRough = u('uRough'), uAniso = u('uAniso'), uClear = u('uClear'), uBrush = u('uBrush')

    const current: Finish = { ...target.current, base: [...target.current.base] as Finish['base'] }
    let mx = 0.62, my = 0.38, lx = mx, ly = my, tiltX = 0, tiltY = 0, visible = false, frame = 0, idle = 0, lastMove = 0
    const fine = window.matchMedia('(pointer: fine)').matches
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const rect = el.getBoundingClientRect()
      el.width = Math.max(2, Math.round(rect.width * dpr))
      el.height = Math.max(2, Math.round(rect.height * dpr))
      gl.viewport(0, 0, el.width, el.height)
    }
    const render = (now: number) => {
      const f = target.current
      const k = 0.08
      current.base = current.base.map((v, i) => v + (f.base[i] - v) * k) as Finish['base']
      current.metal += (f.metal - current.metal) * k
      current.rough += (f.rough - current.rough) * k
      current.aniso += (f.aniso - current.aniso) * k
      current.clear += (f.clear - current.clear) * k
      current.brush += (f.brush - current.brush) * k
      if (now - lastMove > 2600) {
        idle += 0.006
        mx = 0.5 + Math.cos(idle) * 0.32
        my = 0.45 + Math.sin(idle * 1.3) * 0.22
      }
      lx += (mx - lx) * 0.09
      ly += (my - ly) * 0.09
      tiltX += ((lx - 0.5) * 0.26 - tiltX) * 0.06
      tiltY += ((ly - 0.5) * -0.18 - tiltY) * 0.06
      const aspect = el.width / el.height
      gl.uniform2f(uRes, el.width, el.height)
      gl.uniform3f(uLight, (lx - 0.5) * 3.6 * Math.max(1, aspect * 0.6), (0.5 - ly) * 2.4, 1.35)
      gl.uniform2f(uTilt, tiltX, tiltY)
      gl.uniform1f(uTime, now / 1000)
      gl.uniform3f(uBase, current.base[0], current.base[1], current.base[2])
      gl.uniform1f(uMetal, current.metal)
      gl.uniform1f(uRough, current.rough)
      gl.uniform1f(uAniso, current.aniso)
      gl.uniform1f(uClear, current.clear)
      gl.uniform1f(uBrush, current.brush)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      lightCb.current?.(lx, ly)
      frame = visible ? requestAnimationFrame(render) : 0
    }
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      mx = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      my = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
      lastMove = performance.now()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !frame) frame = requestAnimationFrame(render)
    })
    observer.observe(el)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(el)
    resize()
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerdown', move, { passive: true })
    if (!fine) lastMove = -10000
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver.disconnect()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerdown', move)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <canvas ref={canvas} className={`acm-canvas ${className}`} data-cursor="light" aria-hidden="true" />
}
