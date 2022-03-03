import * as THREE from 'three'
import { canvas } from '../../script'
import { viewWidth, viewHeight } from '../store.js'
import vertexShader from '../../shaders/vertex.glsl'
import fragmentShader from '../../shaders/fragment.glsl'

export class Plane extends THREE.Object3D {
  init(plane, index) {
    this.element = plane
    this.src = this.element.getAttribute('data-texture')
    this.index = index
    this.inView = false
    this.setBounds()
    this.clock = new THREE.Clock()
    this.speed = 0
    this.targetSpeed = 0
    this.mouse = new THREE.Vector2()
    this.followMouse = new THREE.Vector2()
    this.prevMouse = new THREE.Vector2()

    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32)

    this.createMaterial()
    this.createTexture()
    this.createMesh()

    return this
  }

  setBounds() {
    this.rect = this.element.getBoundingClientRect()

    this.bounds = {
      left: this.rect.left,
      top: this.rect.top + window.scrollY,
      width: this.rect.width,
      height: this.rect.height,
    }

    this.updateSize()
    this.updatePosition()
  }

  calculateUnitSize(distance = this.position.z) {
    const vFov = (canvas.camera.fov * Math.PI) / 180
    const height = 2 * Math.tan(vFov / 2) * distance
    const width = height * canvas.camera.aspect
    return { width, height }
  }

  updateSize() {
    this.camUnit = this.calculateUnitSize(
      canvas.camera.position.z - this.position.z
    )
    const x = this.bounds.width / viewWidth
    const y = this.bounds.height / viewHeight
    if (!x || !y) return
    this.scale.x = this.camUnit.width * x
    this.scale.y = this.camUnit.height * y
  }

  updateY(y = 0) {
    const { top } = this.bounds
    this.position.y = this.camUnit.height / 2 - this.scale.y / 2
    this.position.y -= ((top - y) / viewHeight) * this.camUnit.height
  }

  updateX(x = 0) {
    const { left } = this.bounds
    this.position.x = -(this.camUnit.width / 2) + this.scale.x / 2
    this.position.x += ((left + x) / viewWidth) * this.camUnit.width
  }

  updatePosition(y) {
    this.updateY(y)
    this.updateX(0)
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      precision: 'lowp',
      uniforms: {
        uTexture: { value: 0 },
        uTime: { value: 0 },
        uValue: { value: 5.0 },
        uMousePos: { value: new THREE.Vector2(0, 0) },
        uVelo: { value: 0.0 },
        uResolution: {
          value: new THREE.Vector2(1.0, window.innerHeight / window.innerWidth),
        },
        uHover: { value: 0.7 },
      },
      vertexShader,
      fragmentShader,
    })
    this.material.side = THREE.DoubleSide
  }

  createTexture() {
    const promise = new Promise((resolve) => {
      canvas.textureLoader.load(this.src, (texture) => {
        this.material.uniforms.uTexture.value = texture
        resolve()
      })
    })
  }

  handleMouse = (e) => {
    this.mouse.x = e.clientX / window.innerWidth
    this.mouse.y = 1.0 - e.clientY / window.innerHeight
  }

  getSpeed = () => {
    this.speed = Math.sqrt(
      (this.prevMouse.x - this.mouse.x) ** 2 +
        (this.prevMouse.y - this.mouse.y) ** 2
    )
    this.targetSpeed -= 0.1 * (this.targetSpeed - this.speed)
    this.followMouse.x -= 0.1 * (this.followMouse.x - this.mouse.x)
    this.followMouse.y -= 0.1 * (this.followMouse.y - this.mouse.y)
    this.prevMouse.x = this.mouse.x
    this.prevMouse.y = this.mouse.y
  }

  render() {
    const elapsedTime = this.clock.getElapsedTime()
    this.material.uniforms.uTime.value += 0.01
    window.addEventListener(`mousemove`, this.handleMouse)
    this.material.uniforms.uMousePos.value = this.followMouse
    this.material.uniforms.uVelo.value = Math.min(this.targetSpeed, 20)
    this.targetSpeed *= 0.999
    this.material.uniforms.uTime.value = elapsedTime
    this.getSpeed()
  }

  resize() {
    // this.setBounds()
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.add(this.mesh)
  }
}
