import * as THREE from 'three'
import Stats from 'stats-js'
import dat from 'dat.gui'
import { gsap } from 'gsap'

import { Plane } from '../plane/index'
import { viewWidth, viewHeight, math } from '../store'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Vector3 } from 'three'

export let hide
export let reveal

let tween
let running = false

const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

const timelineSettings = {
  staggerValue: 0.005,
  charsDuration: 0.5,
}

export class Canvas {
  constructor() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xac6614)
    this.camera = new THREE.PerspectiveCamera(
      40,
      viewWidth / viewHeight,
      1,
      1000
    )
    this.camera.position.z = 11.5
    this.camera.position.y += 4.88

    this.textureLoader = new THREE.TextureLoader()

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(viewWidth, viewHeight)
    this.renderer.shadowMap.autoUpdate = false
    this.renderer.shadowMap.needsUpdate = false
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enabled = true
    this.controls.enableDamping = true

    this.controls.enablePan = false
    this.controls.enableZoom = false
    this.controls.minPolarAngle = Math.PI / 2
    this.controls.maxPolarAngle = Math.PI / 2
    this.controls.target.z = -10
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.ROTATE,
    }
    this.controls.update()

    this.currentScroll = 0
    this.previousScroll = 0
    this.scrolling = false

    this.planes = []
    this.positions = []
    this.init()
  }

  render = () => {
    stats.begin()

    this.previousScroll = math.lerp(
      this.previousScroll,
      this.currentScroll,
      0.75
    )
    this.previousScroll = Math.floor(this.previousScroll * 100) / 100

    if (this.planes.length > 0) {
      for (let i = 0; i < this.planes.length; i++) {
        if (this.planes[i].inView) {
          this.planes[i].render()
        }
      }
    }

    this.renderer.render(this.scene, this.camera)
    this.controls.update()

    stats.end()

    window.requestAnimationFrame(this.render)
  }

  addToDom() {
    document.body.appendChild(this.renderer.domElement)
  }

  addPlanes() {
    const planes = [...document.querySelectorAll('.js-plane')]

    planes.forEach((plane, index) => {
      this.observer.observe(plane)
      this.planes.push(new Plane().init(plane, index))
    })

    this.planes.forEach((plane) => {
      if (plane.index == 1) {
        plane.position.set(0, 0, -20)
      }
      if (plane.index == 2) {
        plane.position.set(10, 0, -10)
        plane.rotation.y = Math.PI / 2
      }
      if (plane.index == 3) {
        plane.position.set(-10, 0, -10)
        plane.rotation.y = Math.PI / 2
      }
      this.scene.add(plane)
    })
  }

  addPositions() {
    const pos1 = new Vector3(0, 0, 12.046)
    const pos2 = new Vector3(22.05, 0, -9.96)
    const pos3 = new Vector3(0, 0, -32.05)
    const pos4 = new Vector3(-22.05, 0, -9.96)
    this.positions.push(pos1, pos2, pos3, pos4)
  }

  removePlanes() {
    this.planes.forEach((plane) => {
      this.observer.unobserve(plane)
      this.removeTile(plane)
    })

    this.planes = []
  }

  removeTile(plane) {
    if (plane.material) {
      if (plane.material.uniforms) {
        Object.keys(plane.material.uniforms).forEach((k) => {
          const uni = plane.material.uniforms[k]

          if (uni && uni.value instanceof WebGLTexture) {
            uni.value.dispose()
          }
        })
      }

      plane.material.dispose()
    }

    if (plane.geometry) {
      plane.geometry.dispose()
    }

    this.scene.remove(plane)
  }

  resize = () => {
    this.renderer.setSize(viewWidth, viewHeight)
    this.camera.updateProjectionMatrix()

    this.planes.forEach((plane) => {
      plane.resize()
    })
  }

  handlePointerDown = () => {
    this.scrolling = true
    running = false
    if (tween) {
      tween.kill()
    }
    if (reveal) {
      reveal.kill()
    }

    const chars = document.querySelectorAll(
      `.current--item > .word > .char, .whitespace`
    )
    hide = gsap
      .timeline({ paused: true })
      .addLabel('start')
      // Stagger the animation of the home section chars
      .staggerTo(
        chars,
        timelineSettings.charsDuration,

        {
          ease: 'Power3.easeIn',
          y: '-100%',
          opacity: 0,
        },
        timelineSettings.staggerValue,
        'start'
      )

    const items = document.querySelectorAll(`.current--item`)
    items.forEach((item) => {
      item.classList.remove(`current--item`)
    })

    hide.play()
  }

  handlePointerUp = () => {
    this.scrolling = false

    setTimeout(() => {
      // reveal.play()
      if (this.scrolling == false && !running) {
        running = true
        const stopPosition = this.camera.position
        this.planes.sort((a, b) => {
          return (
            a.position.distanceTo(stopPosition) -
            b.position.distanceTo(stopPosition)
          )
        })
        if (this.planes[0].src.includes(`road`)) {
          const h1 = document.querySelector(`.h1__road`)
          const p = document.querySelector(`.p__road`)
          const a = document.querySelector(`.a__road`)
          h1.classList.add(`current--item`)
          p.classList.add(`current--item`)
          a.classList.add(`current--item`)
        }
        if (this.planes[0].src.includes(`save`)) {
          const h1 = document.querySelector(`.h1__save`)
          const p = document.querySelector(`.p__save`)
          const a = document.querySelector(`.a__save`)
          h1.classList.add(`current--item`)
          p.classList.add(`current--item`)
          a.classList.add(`current--item`)
        }
        if (this.planes[0].src.includes(`durf`)) {
          const h1 = document.querySelector(`.h1__durf`)
          const p = document.querySelector(`.p__durf`)
          const a = document.querySelector(`.a__durf`)
          h1.classList.add(`current--item`)
          p.classList.add(`current--item`)
          a.classList.add(`current--item`)
        }
        if (this.planes[0].src.includes(`craft`)) {
          const h1 = document.querySelector(`.h1__craft`)
          const p = document.querySelector(`.p__craft`)
          const a = document.querySelector(`.a__craft`)
          h1.classList.add(`current--item`)
          p.classList.add(`current--item`)
          a.classList.add(`current--item`)
        }

        const chars = document.querySelectorAll(
          `.current--item > .word > .char, .whitespace`
        )
        reveal = gsap
          .timeline({ paused: false })
          .addLabel('start')
          // Stagger the animation of the home section chars
          .staggerTo(
            chars,
            1,

            {
              ease: 'Power3.easeIn',
              y: '0',
              opacity: 1,
            },
            timelineSettings.staggerValue,
            'start'
          )
        const snapElement = this.planes[0].element.dataset.type
        tween = gsap.to(this.camera.position, {
          x: this.positions[snapElement].x,
          y: this.positions[snapElement].y,
          z: this.positions[snapElement].z,

          onComplete: () => {
            running = false
          },
          duration: 1,
          ease: 'Power3.easeOut',
        })
      }
    }, 1000)
  }

  removeSplits() {
    const removeChars = document.querySelectorAll(
      `.split > .word > .char, .whitespace`
    )
    removeChars.forEach((char) => {
      char.style.opacity = `0`
      char.style.transform = `translateY(-100%)`
    })

    const chars = document.querySelectorAll(
      `.current--item > .word > .char, .whitespace`
    )
    gsap
      .timeline({ paused: false })
      .addLabel('start')
      // Stagger the animation of the home section chars
      .staggerTo(
        chars,
        1,

        {
          ease: 'Power3.easeIn',
          y: '0',
          opacity: 1,
        },
        timelineSettings.staggerValue,
        'start'
      )
  }

  bindResize() {
    window.addEventListener('resize', this.resize)
  }

  bindPointerDown() {
    window.addEventListener(`pointerdown`, this.handlePointerDown)
  }

  bindPointerUp() {
    window.addEventListener(`pointerup`, this.handlePointerUp)
  }

  bindScroll() {
    window.addEventListener('scroll', () => {
      this.currentScroll = window.scrollY
    })
  }

  addObserver() {
    this.observer = new window.IntersectionObserver(
      (entries) => {
        if (this.planes.length > 0 && entries.length > 0) {
          entries.forEach((entry, index) => {
            const plane = this.planes.filter((plane) => {
              return plane.element === entry.target
            })[0]
            plane.inView = entry.intersectionRatio > 0 ? true : false
          })
        }
      },
      {
        rootMargin: '20% 0% 20% 0%',
      }
    )
  }

  init() {
    this.addObserver()
    this.addToDom()
    this.addPositions()
    this.removeSplits()
    this.bindScroll()
    this.bindPointerUp()
    this.bindPointerDown()
    this.render()
    this.bindResize()
  }
}
