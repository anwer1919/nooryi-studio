"use client"

import { useEffect, useRef, useState } from "react"

interface CosmicDustBackgroundProps {
  scrimStrength?: "none" | "soft" | "medium" | "strong"
  zIndex?: number
}

export default function CosmicDustBackground({
  scrimStrength = "medium",
  zIndex = 0,
}: CosmicDustBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLowEnd, setIsLowEnd] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // كشف الأجهزة الضعيفة
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    const deviceMemory = (navigator as any).deviceMemory
    const isLowMemory = deviceMemory && deviceMemory < 4
    const connection = (navigator as any).connection
    const isSlowConnection = connection && 
      ['slow-2g', '2g', '3g'].includes(connection.effectiveType)
    
    const lowEnd = isMobile || isLowMemory || isSlowConnection
    setIsLowEnd(lowEnd)
    setIsReady(true)
    
    if (lowEnd) return

    const canvas = canvasRef.current
    if (!canvas) return

    let destroyed = false
    let rafHandle = 0
    let cleanup: (() => void) | null = null

    import("three").then(async (THREE) => {
      const { EffectComposer } = await import("three/examples/jsm/postprocessing/EffectComposer.js")
      const { RenderPass } = await import("three/examples/jsm/postprocessing/RenderPass.js")
      const { UnrealBloomPass } = await import("three/examples/jsm/postprocessing/UnrealBloomPass.js")
      const { ShaderPass } = await import("three/examples/jsm/postprocessing/ShaderPass.js")
      const { GammaCorrectionShader } = await import("three/examples/jsm/shaders/GammaCorrectionShader.js")
      const { CopyShader } = await import("three/examples/jsm/shaders/CopyShader.js")

      if (destroyed) return

      function hexToVec3(hex: string) {
        const n = parseInt(hex.slice(1), 16)
        return new THREE.Vector3(
          ((n >> 16) & 255) / 255,
          ((n >> 8) & 255) / 255,
          (n & 255) / 255
        )
      }

      // Renderer - محسّن للأداء
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false, // تعطيل antialias للأداء
        powerPreference: "high-performance",
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // حد أقصى 1.5
      renderer.setSize(window.innerWidth, window.innerHeight, false)

      // Scene
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x000000)
      scene.fog = new THREE.Fog(0x000000, 0, 22)

      // Camera
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        80
      )
      camera.position.set(0, 0, 3)
      scene.add(camera)

      const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 }
      camera.layers.enable(LAYERS.TORUS_SCENE)
      camera.layers.enable(LAYERS.BLOOM_SCENE)
      camera.layers.enable(LAYERS.ENTIRE_SCENE)

      // Geometry - تقليل عدد النقاط للأداء
      const count = 500 // كان 940، قللناه لـ 500
      const positions: number[] = []
      const sizes: number[] = []
      for (let i = 0; i < count; i++) {
        positions.push(
          2 * Math.random() - 1,
          2 * Math.random() - 1,
          2 * Math.random() - 1
        )
        sizes.push(25 + 25 * Math.random())
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1))

      // Material
      const uniforms = {
        iTime: { value: 0 },
        iShift: { value: new THREE.Vector3() },
        iAlpha: { value: 0 },
        iAnimation: { value: new THREE.Vector3(0, 0, 0) },
        iResolution: {
          value: {
            x: window.innerWidth * Math.min(window.devicePixelRatio, 1.5),
            y: window.innerHeight * Math.min(window.devicePixelRatio, 1.5),
          },
        },
        uDepth: { value: 3.7 },
        uCool: { value: hexToVec3("#b3401f") },
        uWarm: { value: hexToVec3("#ffc46b") },
      }

      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        stencilWrite: false,
        vertexShader: `
          attribute float size;
          uniform float iTime;
          uniform vec3 iShift;
          uniform vec2 iResolution;
          uniform vec3 iAnimation;
          uniform float uDepth;
          varying float transparency;
          varying float warmness;
          vec3 warp3d(vec3 pos, float t) {
            float curv = 0.9, a = 1.9, b = 0.25, b2 = 0.03, c = 0.02;
            pos *= 2.;
            pos.x += curv * sin(c * t + a * pos.y) + t * b2;
            pos.y += curv * cos(c * t + a * pos.x);
            pos.z += curv * cos(c * t + a * pos.y);
            pos.z += curv * sin(c * t + a * pos.x) + t * b;
            pos.z = abs(pos.z);
            return pos.xyz;
          }
          void main() {
            vec3 v = warp3d(position, iTime);
            v = uDepth * (2. * fract(v + iShift) - 1.) + iAnimation;
            vec4 vpos = modelViewMatrix * vec4(v, 1.);
            transparency = step(length(v), uDepth);
            warmness = step(.75, fract(size * 7.13));
            gl_PointSize = size * iResolution.y / 1000. / -vpos.z;
            gl_Position = projectionMatrix * vpos;
          }
        `,
        fragmentShader: `
          varying float transparency;
          varying float warmness;
          uniform float iAlpha;
          uniform vec3 uCool;
          uniform vec3 uWarm;
          void main() {
            vec3 color = mix(uCool * .8, uWarm * .8, warmness);
            float tex = smoothstep(1., .3, length(2. * gl_PointCoord - 1.));
            gl_FragColor = vec4(tex * color, tex * transparency * iAlpha);
          }
        `,
      })

      const flyPoints = new THREE.Points(geometry, material)
      flyPoints.position.set(0, 0, -1)
      flyPoints.layers.enable(LAYERS.ENTIRE_SCENE)
      scene.add(flyPoints)

      // Postprocessing - محسّن للأداء
      const renderPass = new RenderPass(scene, camera)

      const torusComposer = new EffectComposer(renderer)
      torusComposer.renderToScreen = false
      torusComposer.addPass(renderPass)
      torusComposer.addPass(new ShaderPass(GammaCorrectionShader))
      torusComposer.addPass(
        new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          0.2, // كان 0.3
          0.2, // كان 0.3
          0
        )
      )
      torusComposer.addPass(new ShaderPass(CopyShader))

      const bloomComposer = new EffectComposer(renderer)
      bloomComposer.renderToScreen = false
      bloomComposer.addPass(new RenderPass(scene, camera))
      bloomComposer.addPass(
        new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          0.3, // كان 0.5
          0.5, // كان 0.7
          0
        )
      )
      bloomComposer.addPass(new ShaderPass(GammaCorrectionShader))

      const FinalPass = {
        uniforms: {
          iTime: { value: 0 },
          tDiffuse: { value: null },
          torusTexture: { value: null },
          bloomTexture: { value: null },
          haloTexture: { value: null },
          uBg: { value: hexToVec3("#1a0a04") },
          uFlameA: { value: hexToVec3("#ff7a2a") },
          uFlameB: { value: hexToVec3("#ffce5a") },
          uFlameAmt: { value: 0.2 },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
        fragmentShader: `
          uniform float iTime;
          uniform sampler2D tDiffuse;
          uniform sampler2D bloomTexture;
          uniform sampler2D torusTexture;
          uniform sampler2D haloTexture;
          uniform vec3 uBg;
          uniform vec3 uFlameA;
          uniform vec3 uFlameB;
          uniform float uFlameAmt;
          varying vec2 vUv;
          vec3 warp3d(vec3 pos, float t){
            float curv=.8,a=1.9,b=0.7;
            pos*=2.;
            pos.x+=curv*sin(t+a*pos.y)+t*b;
            pos.y+=curv*cos(t+a*pos.x);
            pos.y+=curv*sin(t+a*pos.z)+t*b;
            pos.z+=curv*cos(t+a*pos.y);
            pos.z+=curv*sin(t+a*pos.x)+t*b;
            pos.x+=curv*cos(t+a*pos.z);
            return 0.5+0.5*cos(pos.xyz+vec3(1,2,4));
          }
          void main(){
            vec2 uv = 2.*vUv - 1.;
            vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime*1.5), vec3(1.5));
            vec3 flame = 1.5*uFlameA*w.x;
            flame*=w.y;
            flame += uFlameB*w.z;
            flame *= smoothstep(0.25, 1., abs(uv.y));
            float md = smoothstep(-0.7, 1., -uv.y*uv.x);
            flame *= md*md;
            vec3 bg = uBg * (1.0 - 0.4 * length(uv));
            vec3 halo = texture2D(haloTexture, vUv).xyz;
            gl_FragColor = vec4(
              bg + flame*uFlameAmt
              + texture2D(bloomTexture, vUv).xyz
              + texture2D(torusTexture, vUv).xyz
              + texture2D(tDiffuse, vUv).xyz
              + halo,
              1.
            );
          }
        `,
      }

      const finalPass = new ShaderPass(FinalPass)
      finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture
      finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture

      const finalComposer = new EffectComposer(renderer)
      finalComposer.addPass(new RenderPass(scene, camera))
      finalComposer.addPass(finalPass)

      // Fade-in
      const fadeInStart = performance.now()
      const FADE_DURATION = 2200
      const TARGET_ALPHA = 0.68

      function flyPointsRender() {
        uniforms.iTime.value = performance.now() / 1000
        uniforms.iShift.value.add(
          camera.position.clone().multiplyScalar(0.0022 * 0.4)
        )
      }

      // Resize
      function onResize() {
        const w = window.innerWidth
        const h = window.innerHeight
        const dpr = Math.min(window.devicePixelRatio, 1.5)
        renderer.setPixelRatio(dpr)
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        torusComposer.setPixelRatio(dpr)
        torusComposer.setSize(w, h)
        bloomComposer.setPixelRatio(dpr)
        bloomComposer.setSize(w, h)
        finalComposer.setPixelRatio(dpr)
        finalComposer.setSize(w, h)
        uniforms.iResolution.value = { x: w * dpr, y: h * dpr }
      }
      onResize()
      window.addEventListener("resize", onResize)

      // Render loop - مع throttle للأداء
      let lastRender = 0
      const FPS_LIMIT = 30 // حد أقصى 30 FPS للأداء

      function render(timestamp: number) {
        if (destroyed) return

        // Throttle rendering
        if (timestamp - lastRender < 1000 / FPS_LIMIT) {
          rafHandle = requestAnimationFrame(render)
          return
        }
        lastRender = timestamp

        const now = performance.now()
        const elapsed = now - fadeInStart
        const t = Math.min(elapsed / FADE_DURATION, 1)
        const eased = t * t * t * (t * (t * 6 - 15) + 10)
        uniforms.iAlpha.value = eased * TARGET_ALPHA

        finalPass.uniforms.iTime.value = now / 1000
        flyPointsRender()

        camera.layers.set(LAYERS.TORUS_SCENE)
        torusComposer.render()
        camera.layers.set(LAYERS.BLOOM_SCENE)
        bloomComposer.render()
        camera.layers.set(LAYERS.ENTIRE_SCENE)
        finalComposer.render()

        rafHandle = requestAnimationFrame(render)
      }
      rafHandle = requestAnimationFrame(render)

      cleanup = () => {
        window.removeEventListener("resize", onResize)
        cancelAnimationFrame(rafHandle)
        geometry.dispose()
        material.dispose()
        torusComposer.renderTarget1.dispose()
        torusComposer.renderTarget2.dispose()
        bloomComposer.renderTarget1.dispose()
        bloomComposer.renderTarget2.dispose()
        finalComposer.renderTarget1.dispose()
        finalComposer.renderTarget2.dispose()
        renderer.dispose()
      }
    })

    return () => {
      destroyed = true
      cancelAnimationFrame(rafHandle)
      if (cleanup) cleanup()
    }
  }, [])

  // لو مش جاهز بعد، عرض فاضي
  if (!isReady) {
    return <div style={{ position: "absolute", inset: 0, zIndex, background: "#1a0a04" }} />
  }

  // لو جهاز ضعيف، اعرض خلفية ثابتة
  if (isLowEnd) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex,
          pointerEvents: "none",
          background: "#1a0a04",
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255, 122, 42, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 206, 90, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 20%, rgba(255, 122, 42, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 30% 80%, rgba(255, 206, 90, 0.06) 0%, transparent 35%)
          `,
        }}
      />
    )
  }

  const scrimGradients: Record<string, string> = {
    none: "transparent",
    soft: "radial-gradient(115% 95% at 50% 46%, rgba(26,10,4,0.12) 0%, rgba(26,10,4,0.12) 24%, rgba(26,10,4,0.12) 52%, rgba(26,10,4,0.05) 100%)",
    medium: "radial-gradient(115% 95% at 50% 46%, rgba(26,10,4,0.46) 0%, rgba(26,10,4,0.46) 24%, rgba(26,10,4,0.46) 52%, rgba(26,10,4,0.12) 100%)",
    strong: "radial-gradient(115% 95% at 50% 46%, rgba(26,10,4,0.68) 0%, rgba(26,10,4,0.68) 24%, rgba(26,10,4,0.46) 52%, rgba(26,10,4,0.12) 100%)",
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex,
          pointerEvents: "none",
          display: "block",
        }}
      />
      {scrimStrength !== "none" && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: zIndex + 1,
            pointerEvents: "none",
            background: scrimGradients[scrimStrength],
          }}
        />
      )}
    </>
  )
}