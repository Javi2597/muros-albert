'use client'

/* eslint-disable @next/next/no-img-element */
// Landing "Living Interface" — ported from the home-future static design.
// Markup is React; the scroll/map/portal choreography (GSAP + Leaflet, loaded
// from CDN) is driven imperatively inside a single effect, mirroring the
// original main.js so the animation timing stays identical.

import { useEffect, useRef, useState } from 'react'
import './horizon.css'

const BRAND = 'Albert Inmo'

export type HorizonProperty = {
  id: string
  slug: string
  name: string
  loc: string
  address: string
  price: string
  tag: string
  img: string
  beds: number
  baths: number
  area: string
  lat: number | null
  lng: number | null
  accent: 'cyan' | 'violet' | 'pink'
  desc: string
}

interface HorizonLandingProps {
  properties: HorizonProperty[]
}

/* ---------------- external library loaders (CDN, once) ---------------- */
const loaded: Record<string, Promise<void> | undefined> = {}

function loadScript(src: string): Promise<void> {
  const cached = loaded[src]
  if (cached) return cached
  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded) return resolve()
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject())
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => { s.dataset.loaded = '1'; resolve() }
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
  loaded[src] = promise
  return promise
}

function loadStyle(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return
  const l = document.createElement('link')
  l.rel = 'stylesheet'
  l.href = href
  document.head.appendChild(l)
}

// Leaflet auto-hospedado (mismo origen) → sin latencia de CDN externo en móvil
const LEAFLET_CSS = '/vendor/leaflet/leaflet.css'
const LEAFLET_JS = '/vendor/leaflet/leaflet.js'
const GSAP_JS = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'
const SCROLLTRIGGER_JS = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'

// sin {r} (retina @2x): en móviles de alta densidad las tiles @2x pesan ~4x
// más y hacen lento el mapa; las normales casi no se notan en un mapa estilizado
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
const LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'

type Theme = 'dark' | 'light'
const THEME_KEY = 'horizon-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function HorizonLanding({ properties }: HorizonLandingProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null)
  const [theme, setTheme] = useState<Theme>('dark')

  // restore saved preference after mount (the preloader hides any flash)
  useEffect(() => { setTheme(getInitialTheme()) }, [])

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem(THEME_KEY, next) } catch {}
      const tile = tileLayerRef.current
      if (tile) tile.setUrl(next === 'light' ? LIGHT_TILES : DARK_TILES)
      return next
    })
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)
    const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel))

    // Carga adaptativa: en 3G/2G o "ahorro de datos" evitamos descargar lo no
    // esencial (video del hero ~1MB, GSAP) para que cargue mucho más rápido.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn = (navigator as any).connection
    const slowConn = !!(conn && (conn.saveData || ['slow-2g', '2g', '3g'].includes(conn.effectiveType)))

    // Video del hero: solo se descarga/reproduce en conexiones razonables.
    // En conexión lenta o reduce-motion queda el póster (130KB) y nada más.
    const heroVideo = $<HTMLVideoElement>('.hero__video')
    if (heroVideo && !slowConn && !reduceMotion) {
      heroVideo.preload = 'auto'
      heroVideo.play().catch(() => {})
    }

    let leafletMap: any = null
    let cancelled = false
    let started = false
    let failsafe: ReturnType<typeof setTimeout> | null = null
    const triggers: any[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any

    /* ---------------- PORTAL ---------------- */
    const portal = $('#portal')!
    const portalImg = $<HTMLImageElement>('#portalImg')!
    const portalLoc = $('#portalLoc')!
    const portalName = $('#portalName')!
    const portalAddr = $('#portalAddr')!
    const portalDesc = $('#portalDesc')!
    const portalSpecs = $('#portalSpecs')!
    const portalPrice = $('#portalPrice')!
    const portalLink = $<HTMLAnchorElement>('#portalLink')!
    const portalClose = $('#portalClose')!
    let lastFocused: HTMLElement | null = null

    function openPortal(prop: HorizonProperty, originEl: HTMLElement) {
      const gsap = w.gsap
      lastFocused = originEl
      portalImg.src = prop.img
      portalImg.alt = `${prop.name} — interior`
      portalLoc.textContent = prop.loc
      portalName.textContent = prop.name
      portalAddr.textContent = `📍 ${prop.address}`
      portalDesc.textContent = prop.desc
      portalPrice.textContent = prop.price
      portalLink.href = `/propiedades/${prop.slug}`
      portalSpecs.innerHTML = [
        prop.beds ? `<span>${prop.beds} amb</span>` : '',
        prop.baths ? `<span>${prop.baths} baños</span>` : '',
        prop.area ? `<span>${prop.area}</span>` : '',
        prop.tag ? `<span>${prop.tag}</span>` : '',
      ].join('')

      document.body.classList.add('is-locked')
      portal.classList.add('is-open')
      portal.setAttribute('aria-hidden', 'false')

      if (gsap && !reduceMotion) {
        const rect = originEl.getBoundingClientRect()
        const ox = rect.left + rect.width / 2
        const oy = rect.top + rect.height / 2
        gsap.fromTo(portal,
          { clipPath: `circle(0% at ${ox}px ${oy}px)` },
          { clipPath: `circle(150% at ${ox}px ${oy}px)`, duration: .8, ease: 'power3.inOut' })
        gsap.fromTo(portal.querySelector('.portal__media img'), { scale: 1.25 }, { scale: 1, duration: 1.2, ease: 'power2.out' })
        gsap.fromTo(portal.querySelectorAll('.portal__panel > *'),
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: .6, stagger: .07, delay: .35, ease: 'power3.out' })
      }
      ;(portalClose as HTMLElement).focus({ preventScroll: true })
    }

    function closePortal() {
      const gsap = w.gsap
      document.body.classList.remove('is-locked')
      portal.setAttribute('aria-hidden', 'true')
      if (gsap && !reduceMotion) {
        gsap.to(portal, {
          opacity: 0, duration: .4, ease: 'power2.in',
          onComplete() {
            portal.classList.remove('is-open')
            ;(portal as HTMLElement).style.opacity = ''
            ;(portal as HTMLElement).style.clipPath = ''
          },
        })
      } else {
        portal.classList.remove('is-open')
      }
      if (lastFocused) lastFocused.focus({ preventScroll: true })
    }

    /* card → portal */
    const grid = $('#propsGrid')
    const onGridClick = (e: Event) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-prop]')
      if (!card) return
      const prop = properties.find((p) => p.id === card.dataset.prop)
      if (prop) openPortal(prop, card)
    }
    const onGridKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onGridClick(e) }
    }
    grid?.addEventListener('click', onGridClick)
    grid?.addEventListener('keydown', onGridKey as EventListener)

    const onPortalClose = () => closePortal()
    const onPortalBackdrop = (e: Event) => { if (e.target === portal) closePortal() }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && portal.classList.contains('is-open')) closePortal()
    }
    portalClose?.addEventListener('click', onPortalClose)
    portal?.addEventListener('click', onPortalBackdrop)
    document.addEventListener('keydown', onEsc)
    const portalCta = portal.querySelector('[data-portal-cta]')
    const onPortalCta = () => closePortal()
    portalCta?.addEventListener('click', onPortalCta)

    /* ---------------- smooth-scroll anchors ---------------- */
    const scrollLinks = $$('[data-scroll]')
    const onAnchor = (e: Event) => {
      const link = e.currentTarget as HTMLAnchorElement
      const id = link.getAttribute('href')
      if (!id || !id.startsWith('#')) return
      const target = root.querySelector(id)
      if (!target) return
      e.preventDefault()
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }
    scrollLinks.forEach((l) => l.addEventListener('click', onAnchor))

    /* ---------------- nav scrolled state ---------------- */
    const nav = $('#nav')
    const onScroll = () => {
      if (!nav) return
      nav.classList.toggle('is-scrolled', window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    /* ---------------- bottom-nav active state ---------------- */
    let botObserver: IntersectionObserver | null = null
    const botItems = $$('[data-botnav]')
    if ('IntersectionObserver' in window) {
      botObserver = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const id = (en.target as HTMLElement).id
            botItems.forEach((b) => b.classList.toggle('is-active', (b as HTMLElement).dataset.botnav === id))
          }
        })
      }, { threshold: .5 })
      ;['hero', 'map', 'properties', 'cta'].forEach((id) => {
        const s = root.querySelector(`#${id}`)
        if (s) botObserver!.observe(s)
      })
    }

    /* ---------------- init functions (run after libs ready) ---------------- */
    function initHero() {
      const gsap = w.gsap
      if (!gsap || reduceMotion) return
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero__eyebrow', { y: 18, opacity: 0, duration: .6 })
        .from('.hero__title .line > span', { yPercent: 115, duration: .9, stagger: .12 }, '-=.3')
        .from('.hero__sub', { y: 22, opacity: 0, duration: .7 }, '-=.45')
        .from('.hero__actions', { y: 22, opacity: 0, duration: .7 }, '-=.5')
        .from('.poi', { scale: 0, duration: .7, stagger: .1, ease: 'back.out(2)' }, '-=.7')
        .from('.hero__scroll', { opacity: 0, duration: .6 }, '-=.4')

      triggers.push(gsap.to('.hero__bg', {
        yPercent: 16, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      }).scrollTrigger)
      triggers.push(gsap.to('.hero__content', {
        yPercent: -8, opacity: .25, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      }).scrollTrigger)
    }

    function initScrollReveals() {
      const gsap = w.gsap
      const ScrollTrigger = w.ScrollTrigger
      const items = $$('[data-reveal]:not(.is-in)')
      if (!gsap || reduceMotion) { items.forEach((el) => el.classList.add('is-in')); return }
      items.forEach((el) => {
        triggers.push(ScrollTrigger.create({
          trigger: el, start: 'top 86%',
          onEnter: () => el.classList.add('is-in'),
        }))
      })
    }

    function initMap() {
      const L = w.L
      const gsap = w.gsap
      const el = $('#floresMap')
      if (!el || leafletMap) return
      const located = properties.filter((p) => p.lat != null && p.lng != null)

      if (typeof L === 'undefined') {
        el.innerHTML = '<div class="map__fallback">No se pudo cargar el mapa. ' +
          'Revisá tu conexión y recargá.</div>'
        $('#mapLoader')?.classList.add('is-hidden')
        return
      }

      // centrado en CABA y acotado a ~25 km a la redonda
      // 1° lat ≈ 111 km · 1° lng ≈ 91 km a esta latitud → 25 km ≈ 0.225° lat / 0.275° lng
      const CABA: [number, number] = [-34.6037, -58.3816]
      const LAT_R = 0.225, LNG_R = 0.275
      const maxBounds: [[number, number], [number, number]] = [
        [CABA[0] - LAT_R, CABA[1] - LNG_R],
        [CABA[0] + LAT_R, CABA[1] + LNG_R],
      ]
      leafletMap = L.map(el, {
        center: CABA,
        zoom: 12, minZoom: 12, maxZoom: 18,
        maxBounds, maxBoundsViscosity: 1.0,
        zoomControl: true, scrollWheelZoom: false,
        attributionControl: true,
      })

      const tile = L.tileLayer(getInitialTheme() === 'light' ? LIGHT_TILES : DARK_TILES, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd', maxZoom: 20,
        // optimizaciones para móvil: sin retina y cargar tiles solo al detenerse
        detectRetina: false, updateWhenIdle: true, keepBuffer: 1,
      }).addTo(leafletMap)
      tileLayerRef.current = tile

      // ocultar el cargador cuando las tiles visibles terminan de cargar
      const loaderEl = $('#mapLoader')
      const hideLoader = () => loaderEl?.classList.add('is-hidden')
      tile.once('load', hideLoader)
      setTimeout(hideLoader, 8000) // fallback por si algún tile no responde

      const markerEls: HTMLElement[] = []
      const bounds: [number, number][] = []
      located.forEach((p) => {
        const icon = L.divIcon({
          className: `mmarker mmarker--${p.accent}`,
          html: `<div class="mmarker__inner">
                   <span class="mmarker__pin"></span>
                   <span class="mmarker__chip">${p.price}</span>
                 </div>`,
          iconSize: [20, 20], iconAnchor: [10, 20],
        })
        const m = L.marker([p.lat, p.lng], { icon, title: `${p.name} · ${p.address}`, keyboard: true, riseOnHover: true }).addTo(leafletMap)
        m.on('click', () => openPortal(p, m.getElement()))
        bounds.push([p.lat as number, p.lng as number])
        const inner = m.getElement()?.querySelector('.mmarker__inner')
        if (inner) markerEls.push(inner as HTMLElement)
      })

      if (bounds.length > 1) leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })

      // el mapa se inicializa ya cerca del viewport → asegurar tamaño correcto
      const fixSize = () => leafletMap && leafletMap.invalidateSize()
      setTimeout(fixSize, 120)
      setTimeout(fixSize, 600)

      // entrada de los pines inmediata (no via ScrollTrigger, que podría no dispararse)
      if (gsap && !reduceMotion && markerEls.length) {
        gsap.fromTo(markerEls,
          { scale: 0, transformOrigin: 'center bottom' },
          { scale: 1, duration: .7, stagger: .08, ease: 'back.out(2.2)', delay: .15 })
      }
    }

    function initLifestyle() {
      const gsap = w.gsap
      const section = $('#lifestyle')
      const track = $('#lifeTrack')
      if (!section || !track) return
      if (!gsap || reduceMotion || window.innerWidth < 720) return
      const panels = track.querySelectorAll('.life__panel')
      const total = panels.length
      triggers.push(gsap.to(track, {
        xPercent: -100 * (total - 1), ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top top',
          end: () => '+=' + (window.innerHeight * (total - 1)),
          pin: true, scrub: 1, invalidateOnRefresh: true,
        },
      }).scrollTrigger)
    }

    function initStats() {
      const gsap = w.gsap
      const ScrollTrigger = w.ScrollTrigger
      $$('[data-count]').forEach((el) => {
        const target = parseInt((el as HTMLElement).dataset.count || '0', 10)
        if (!gsap || reduceMotion) { el.textContent = String(target); return }
        const obj = { v: 0 }
        triggers.push(ScrollTrigger.create({
          trigger: el, start: 'top 88%', once: true,
          onEnter() {
            gsap.to(obj, { v: target, duration: 1.6, ease: 'power2.out', onUpdate() { el.textContent = String(Math.round(obj.v)) } })
          },
        }))
      })
    }

    /* ---------------- preloader + boot ---------------- */
    const preloader = $('#preloader')
    const barEl = $('#preloaderBar')
    const countEl = $('#preloaderCount')

    let gsapReady = false
    let leafletReady = false
    let mapWanted = false

    function tryInitMap() {
      if (mapWanted && leafletReady && !leafletMap) initMap()
    }

    // Mostrar el sitio. NO depende de ninguna librería externa: si GSAP ya
    // está, anima; si no, muestra todo estático pero legible.
    function revealSite() {
      if (started || cancelled) return
      started = true
      if (failsafe) { clearTimeout(failsafe); failsafe = null }
      if (preloader) (preloader as HTMLElement).style.display = 'none'
      document.body.classList.remove('is-locked')

      if (gsapReady && !reduceMotion) {
        if (w.gsap && w.ScrollTrigger) w.gsap.registerPlugin(w.ScrollTrigger)
        initHero()
        initScrollReveals()
        initLifestyle()
        initStats()
        if (w.ScrollTrigger) w.ScrollTrigger.refresh()
      } else {
        // sin GSAP (o reduce-motion): contenido visible al instante
        $$('[data-reveal]').forEach((el) => el.classList.add('is-in'))
        $$('[data-count]').forEach((el) => { el.textContent = (el as HTMLElement).dataset.count || '0' })
      }
      tryInitMap() // el mapa ya está observado; inicia si corresponde
    }

    // Preloader: contador 0→100 con requestAnimationFrame.
    // Independiente del CDN y SIEMPRE corre (incluso con "reducir animaciones"),
    // solo que más corto en ese caso → el % nunca queda en blanco ni "desaparece".
    function runPreloader() {
      document.body.classList.add('is-locked')
      const DURATION = reduceMotion ? 500 : 1100
      const fade = reduceMotion ? 200 : 480
      const t0 = performance.now()
      const step = (now: number) => {
        if (cancelled) return
        const p = Math.min(1, (now - t0) / DURATION)
        const val = Math.round(p * 100)
        if (countEl) countEl.textContent = String(val)
        if (barEl) (barEl as HTMLElement).style.width = val + '%'
        if (p < 1) {
          requestAnimationFrame(step)
        } else {
          if (countEl) countEl.textContent = '100'
          if (barEl) (barEl as HTMLElement).style.width = '100%'
          if (preloader) {
            const pe = preloader as HTMLElement
            pe.style.transition = 'opacity .5s ease'
            pe.style.opacity = '0'
          }
          setTimeout(revealSite, fade)
        }
      }
      requestAnimationFrame(step)
    }

    // 1) Arrancar el preloader YA, sin esperar librerías
    runPreloader()
    // 2) Failsafe duro por si el RAF no corriera por algún motivo
    failsafe = setTimeout(revealSite, 4000)

    // 3) GSAP (animaciones, no esencial) solo en conexiones razonables y sin reduce-motion
    if (!slowConn && !reduceMotion) {
      loadScript(GSAP_JS)
        .then(() => loadScript(SCROLLTRIGGER_JS))
        .then(() => {
          if (cancelled) return
          gsapReady = true
          if (w.gsap && w.ScrollTrigger) w.gsap.registerPlugin(w.ScrollTrigger)
        })
        .catch(() => {})
    }

    // 4) Leaflet se descarga RECIÉN cuando el mapa se acerca al viewport
    //    (no al inicio) → en móvil/3G no pesa sobre la carga inicial.
    let leafletLoading = false
    function ensureLeaflet() {
      if (leafletReady || leafletLoading) return
      leafletLoading = true
      loadStyle(LEAFLET_CSS)
      loadScript(LEAFLET_JS)
        .then(() => { if (cancelled) return; leafletReady = true; tryInitMap() })
        .catch(() => {
          const el = $('#floresMap')
          if (el) el.innerHTML = '<div class="map__fallback">No se pudo cargar el mapa. Revisá tu conexión y recargá.</div>'
          $('#mapLoader')?.classList.add('is-hidden')
        })
    }

    let mapObserver: IntersectionObserver | null = null
    const mapSection = $('#map')
    if (mapSection && 'IntersectionObserver' in window) {
      mapObserver = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          mapWanted = true
          ensureLeaflet()
          tryInitMap()
          mapObserver?.disconnect()
          mapObserver = null
        }
      }, { rootMargin: '500px 0px' })
      mapObserver.observe(mapSection)
    } else {
      mapWanted = true
      ensureLeaflet()
      tryInitMap()
    }

    /* ---------------- cleanup ---------------- */
    return () => {
      cancelled = true
      if (failsafe) { clearTimeout(failsafe); failsafe = null }
      document.body.classList.remove('is-locked')
      grid?.removeEventListener('click', onGridClick)
      grid?.removeEventListener('keydown', onGridKey as EventListener)
      portalClose?.removeEventListener('click', onPortalClose)
      portal?.removeEventListener('click', onPortalBackdrop)
      portalCta?.removeEventListener('click', onPortalCta)
      document.removeEventListener('keydown', onEsc)
      window.removeEventListener('scroll', onScroll)
      scrollLinks.forEach((l) => l.removeEventListener('click', onAnchor))
      botObserver?.disconnect()
      mapObserver?.disconnect()
      triggers.forEach((t) => t && t.kill && t.kill())
      if (leafletMap) { leafletMap.remove(); leafletMap = null }
      tileLayerRef.current = null
    }
  }, [properties])

  return (
    <div className={theme === 'light' ? 'horizon is-light' : 'horizon'} ref={rootRef}>
      {/* resource hints: acelerar la primera conexión a los tiles del mapa y a GSAP */}
      <link rel="preconnect" href="https://a.basemaps.cartocdn.com" />
      <link rel="preconnect" href="https://b.basemaps.cartocdn.com" />
      <link rel="dns-prefetch" href="https://c.basemaps.cartocdn.com" />
      <link rel="dns-prefetch" href="https://d.basemaps.cartocdn.com" />
      <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />

      {/* ============ PRELOADER ============ */}
      <div className="preloader" id="preloader">
        <div className="preloader__inner">
          <div className="preloader__brand">{BRAND.toUpperCase()}</div>
          <div className="preloader__bar"><span id="preloaderBar" /></div>
          <div className="preloader__count"><span id="preloaderCount">0</span>%</div>
        </div>
      </div>

      {/* ============ NAV ============ */}
      <header className="nav" id="nav">
        <a href="#hero" className="nav__logo" data-scroll>
          <span className="nav__logo-mark" />{BRAND}
        </a>
        <div className="nav__right">
          <nav className="nav__links">
            <a href="#map" data-scroll>El Mapa</a>
            <a href="#properties" data-scroll>Propiedades</a>
            <a href="#lifestyle" data-scroll>Estilo de vida</a>
          </nav>
          <button
            type="button"
            className="nav__theme"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <a href="#cta" className="nav__cta" data-scroll>Reservar visita</a>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="hero" id="hero">
        <div className="hero__bg" data-parallax="0.25">
          <video
            className="hero__video"
            muted
            loop
            playsInline
            preload="none"
            poster="/horizon/video/hero-poster.jpg"
            aria-hidden="true"
          >
            <source src="/horizon/video/hero-city.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero__grid" aria-hidden="true" />
        <div className="hero__vignette" aria-hidden="true" />

        {/* puntos confinados a la banda superior (.hero__poi) → nunca tocan la copy */}
        <div className="hero__poi" aria-hidden="true">
          <span className="poi" style={{ '--x': '24%', '--y': '58%' } as React.CSSProperties} />
          <span className="poi poi--violet" style={{ '--x': '82%', '--y': '26%' } as React.CSSProperties} />
          <span className="poi poi--pink" style={{ '--x': '47%', '--y': '78%' } as React.CSSProperties} />
          <span className="poi" style={{ '--x': '66%', '--y': '42%' } as React.CSSProperties} />
          <span className="poi poi--violet" style={{ '--x': '92%', '--y': '62%' } as React.CSSProperties} />
        </div>

        <div className="hero__content">
          <p className="hero__eyebrow">{BRAND} · Buenos Aires</p>
          <h1 className="hero__title">
            <span className="line"><span>Tu hogar en el</span></span>
            <span className="line"><span>mapa del <em>futuro</em></span></span>
          </h1>
          <p className="hero__sub">
            Olvidá las listas interminables. Explorá cada propiedad sobre un mapa vivo
            y descubrí no solo una casa — descubrí cómo será tu vida en ella.
          </p>
          <div className="hero__actions">
            <a href="#map" className="btn btn--primary" data-scroll>Explorar el mapa</a>
            <a href="#properties" className="btn btn--ghost" data-scroll>Ver propiedades</a>
          </div>
        </div>

        <div className="hero__scroll" aria-hidden="true">
          <span>Desliza para revelar</span>
          <div className="hero__mouse"><span /></div>
        </div>
      </section>

      {/* ============ LIVING MAP ============ */}
      <section className="map" id="map">
        <div className="map__head">
          <p className="section__eyebrow" data-reveal>El mapa vivo · CABA y GBA</p>
          <h2 className="section__title" data-reveal>Cada propiedad, en el <em>mapa</em></h2>
          <p className="section__lead" data-reveal>
            Tocá un pin y entrá: vas a ver su dirección, su precio y cómo se vive
            en cada barrio de Buenos Aires.
          </p>
        </div>

        <div className="map__stage" id="mapStage">
          <div id="floresMap" className="map__leaflet" />
          <div className="map__overlay-glow" aria-hidden="true" />
          <p className="map__hint">Tocá un pin para entrar · arrastrá y hacé zoom para explorar</p>
          <div className="map__loader" id="mapLoader" role="status" aria-live="polite">
            <span className="map__spinner" aria-hidden="true" />
            <span className="map__loader-text">Cargando mapa…</span>
          </div>
        </div>
      </section>

      {/* ============ PROPERTIES ============ */}
      <section className="props" id="properties">
        <div className="props__head">
          <p className="section__eyebrow" data-reveal>Colección</p>
          <h2 className="section__title" data-reveal>Cruzá el <em>portal</em></h2>
          <p className="section__lead" data-reveal>
            Tocá cualquier propiedad. La fachada se ilumina y te deslizás suavemente
            hacia el interior — de la calle al salón, sin transición brusca.
          </p>
        </div>

        <div className="props__grid" id="propsGrid">
          {properties.length === 0 && (
            <p className="props__empty">Pronto vas a ver acá nuestras propiedades destacadas.</p>
          )}
          {properties.map((p) => (
            <article
              key={p.id}
              className="pcard"
              data-prop={p.id}
              role="button"
              tabIndex={0}
              aria-label={`Abrir ${p.name}, ${p.address}`}
            >
              <div className="pcard__media">
                {p.tag && <span className="pcard__tag">{p.tag}</span>}
                <span className="pcard__shine" />
                <img src={p.img} alt={`${p.name}, ${p.loc}`} loading="lazy" />
              </div>
              <div className="pcard__body">
                <p className="pcard__loc">{p.loc} · {p.address}</p>
                <h3 className="pcard__name">{p.name}</h3>
                <div className="pcard__meta">
                  {p.beds > 0 && <span>{p.beds} amb</span>}
                  {p.baths > 0 && <span>{p.baths} baños</span>}
                  {p.area && <span>{p.area}</span>}
                </div>
                <div className="pcard__foot">
                  <span className="pcard__price">{p.price}</span>
                  <span className="pcard__open">Cruzar portal
                    <svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H8M17 7v9" /></svg>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ============ PORTAL OVERLAY ============ */}
      <div className="portal" id="portal" aria-hidden="true">
        <div className="portal__media"><img id="portalImg" src="" alt="" /></div>
        <button className="portal__close" id="portalClose" aria-label="Cerrar">&times;</button>
        <div className="portal__panel">
          <p className="portal__loc" id="portalLoc" />
          <h3 className="portal__name" id="portalName" />
          <p className="portal__addr" id="portalAddr" />
          <p className="portal__desc" id="portalDesc" />
          <div className="portal__specs" id="portalSpecs" />
          <div className="portal__foot">
            <span className="portal__price" id="portalPrice" />
            <div className="portal__actions">
              <a id="portalLink" className="portal__link" href="#">Ver ficha completa ↗</a>
              <a href="#cta" className="btn btn--primary" data-scroll data-portal-cta>Agendar visita</a>
            </div>
          </div>
        </div>
      </div>

      {/* ============ LIFESTYLE (pinned) ============ */}
      <section className="life" id="lifestyle">
        <div className="life__sticky">
          <div className="life__track" id="lifeTrack">
            <article className="life__panel">
              <div className="life__img"><img src="/horizon/img/rooftop-pool.jpg" alt="Terraza con piscina" /></div>
              <div className="life__copy">
                <span className="life__idx">01</span>
                <h3>Amanece sobre la ciudad</h3>
                <p>Piscinas infinitas y terrazas privadas donde el skyline es solo tu telón de fondo.</p>
              </div>
            </article>
            <article className="life__panel">
              <div className="life__img"><img src="/horizon/img/interior-4.jpg" alt="Salón de diseño" /></div>
              <div className="life__copy">
                <span className="life__idx">02</span>
                <h3>Espacios que respiran</h3>
                <p>Luz natural, materiales nobles y domótica integrada. Diseñado para vivirse, no solo para mirarse.</p>
              </div>
            </article>
            <article className="life__panel">
              <div className="life__img"><img src="/horizon/img/rooftop-1.jpg" alt="Lounge en azotea" /></div>
              <div className="life__copy">
                <span className="life__idx">03</span>
                <h3>La ciudad a tus pies</h3>
                <p>Cada barrio, conectado. Cada servicio, a minutos. El mapa trabaja para vos.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="stats">
        <div className="stats__item" data-reveal>
          <span className="stats__num" data-count="240">0</span><span className="stats__plus">+</span>
          <p>Propiedades exclusivas</p>
        </div>
        <div className="stats__item" data-reveal>
          <span className="stats__num" data-count="18">0</span>
          <p>Barrios cartografiados</p>
        </div>
        <div className="stats__item" data-reveal>
          <span className="stats__num" data-count="96">0</span><span className="stats__plus">%</span>
          <p>Clientes que repiten</p>
        </div>
        <div className="stats__item" data-reveal>
          <span className="stats__num" data-count="12">0</span>
          <p>Años redefiniendo el lujo</p>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="cta" id="cta">
        <div className="cta__glow" aria-hidden="true" />
        <div className="cta__inner">
          <h2 data-reveal>¿Listo para ver tu futuro <em>en el mapa</em>?</h2>
          <p data-reveal>Dejanos tus datos y un asesor te abrirá el portal a las propiedades que encajan con tu vida.</p>
          <CtaForm />
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="footer__top">
          <a href="#hero" className="nav__logo" data-scroll><span className="nav__logo-mark" />{BRAND}</a>
          <nav className="footer__links">
            <a href="#map" data-scroll>El Mapa</a>
            <a href="#properties" data-scroll>Propiedades</a>
            <a href="#lifestyle" data-scroll>Estilo de vida</a>
            <a href="#cta" data-scroll>Contacto</a>
          </nav>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} {BRAND} · Inmobiliaria en Buenos Aires</span>
          <span>Diseñado para moverse contigo</span>
        </div>
      </footer>

      {/* ============ MOBILE BOTTOM NAV ============ */}
      <nav className="botnav" aria-label="Navegación principal">
        <a href="#hero" data-scroll className="botnav__item is-active" data-botnav="hero">
          <svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8M5 9.5V21h14V9.5" /></svg><span>Inicio</span>
        </a>
        <a href="#map" data-scroll className="botnav__item" data-botnav="map">
          <svg viewBox="0 0 24 24"><path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15" /></svg><span>Mapa</span>
        </a>
        <a href="#properties" data-scroll className="botnav__item" data-botnav="properties">
          <svg viewBox="0 0 24 24"><path d="M4 21V9l8-6 8 6v12M9 21v-6h6v6" /></svg><span>Casas</span>
        </a>
        <a href="#cta" data-scroll className="botnav__item" data-botnav="cta">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg><span>Contacto</span>
        </a>
      </nav>
    </div>
  )
}

/* ---------------- theme icons ---------------- */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

/* ---------------- CTA form (real lead → /api/leads) ---------------- */
function CtaForm() {
  const statusRef = useRef<HTMLParagraphElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const status = statusRef.current!
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    const message = String(data.get('message') || '').trim()
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!name) { status.textContent = 'Contanos tu nombre para empezar.'; status.style.color = 'var(--neon-pink)'; return }
    if (!validEmail) { status.textContent = 'Revisá tu email, no parece válido.'; status.style.color = 'var(--neon-pink)'; return }

    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')
    if (submitBtn) submitBtn.disabled = true
    status.style.color = 'var(--neon-cyan)'
    status.textContent = 'Enviando…'

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, source: 'form' }),
      })
      if (!res.ok) throw new Error('bad status')
      status.textContent = `Gracias, ${name}. Un asesor te abrirá el portal muy pronto ✦`
      form.reset()
    } catch {
      status.textContent = 'No pudimos enviar tu consulta. Probá de nuevo en un momento.'
      status.style.color = 'var(--neon-pink)'
    } finally {
      if (submitBtn) submitBtn.disabled = false
    }
  }

  return (
    <form className="cta__form" id="ctaForm" ref={formRef} onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" type="text" autoComplete="name" placeholder="Tu nombre" required />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="tu@email.com" required />
      </div>
      <div className="field">
        <label htmlFor="message">Mensaje (opcional)</label>
        <textarea id="message" name="message" rows={3} placeholder="Contanos qué estás buscando…" />
      </div>
      <button type="submit" className="btn btn--primary btn--block">Abrir el portal</button>
      <p className="cta__status" id="ctaStatus" ref={statusRef} role="status" aria-live="polite" />
    </form>
  )
}
