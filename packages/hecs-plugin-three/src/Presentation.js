import * as THREE from 'three'
import { Loader } from './Loader'
import { Capture } from './Capture'

let loader
let textureLoader

export class Presentation {
  constructor(world, options) {
    this.world = world
    this.viewport = null
    this.size = { width: 1, height: 1 }
    this.object3ds = []
    this.scene = options.scene || this.createScene()
    this.renderer = options.renderer || this.createRenderer()
    this.camera = options.camera || this.createCamera()
    this.resizeObserver = new ResizeObserver(this.onResize.bind(this))
    this.capture = new Capture(this)
    if (!loader) loader = new Loader()
    if (!textureLoader) textureLoader = new THREE.TextureLoader()
  }

  setViewport(viewport) {
    if (this.viewport === viewport) {
      return
    }
    if (this.viewport) {
      this.resizeObserver.unobserve(this.viewport)
      this.viewport.removeChild(this.renderer.domElement)
      this.viewport = null
    }
    this.viewport = viewport
    this.resize()
    if (this.viewport) {
      this.viewport.appendChild(this.renderer.domElement)
      this.resizeObserver.observe(this.viewport)
    }
  }

  setLoop(fn) {
    this.renderer.setAnimationLoop(fn)
  }

  load(url) {
    return loader.load(url)
  }

  async loadTexture(url) {
    return new Promise((resolve, reject) => {
      textureLoader.load(url, resolve, null, reject)
    })
  }

  onResize() {
    this.resize()
  }

  updateSize() {
    this.size.width = this.viewport?.offsetWidth || 1
    this.size.height = this.viewport?.offsetHeight || 1
  }

  resize() {
    this.updateSize()
    this.camera.aspect = this.size.width / this.size.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.size.width, this.size.height)
    if (this.viewport) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  takePhoto(width, height) {
    // this method is just a proxy method for simplicity
    return this.capture.takePhoto(width, height)
  }

  createScene() {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xaec7ed)
    scene.name = 'scene'

    const hemiLight = new THREE.HemisphereLight(0x444444, 0xffffff)
    hemiLight.position.set(0, 20, 0)
    scene.add(hemiLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 6)
    dirLight.position.set(-3, 20, -40)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.height = 1024
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.camera.top = 15
    dirLight.shadow.camera.bottom = -15
    dirLight.shadow.camera.left = -15
    dirLight.shadow.camera.right = 15
    dirLight.shadow.camera.near = 20
    dirLight.shadow.camera.far = 60
    dirLight.shadow.radius = 1
    dirLight.shadow.bias = -0.01
    scene.add(dirLight)

    return scene
  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    // renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(this.size.width, this.size.height)
    renderer.physicallyCorrectLights = true
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.VSMShadowMap
    renderer.domElement.style = 'outline:0;'

    // TODO: move to XRSystem?
    renderer.xr.enabled = true
    renderer.xr.setReferenceSpaceType('local-floor')

    return renderer
  }

  createCamera() {
    return new THREE.PerspectiveCamera(
      75,
      this.size.width / this.size.height,
      0.1,
      1000
    )
  }
}
