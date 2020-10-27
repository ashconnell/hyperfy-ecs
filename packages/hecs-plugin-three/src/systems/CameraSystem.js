import { System, Not, Groups } from 'hecs'
import { Object3D, Camera, CameraAttached } from '../components'
import { IS_BROWSER } from '../utils'

export class CameraSystem extends System {
  active = IS_BROWSER
  order = Groups.Initialization

  static queries = {
    added: [Object3D, Camera, Not(CameraAttached)],
    removed: [Not(Camera), CameraAttached],
  }

  init({ presentation }) {
    this.camera = presentation?.camera
  }

  update() {
    this.queries.added.forEach(entity => {
      const object3d = entity.get(Object3D).value
      object3d.add(this.camera)
      entity.add(CameraAttached)
    })
    this.queries.removed.forEach(entity => {
      this.camera.parent.remove(this.camera)
      entity.remove(CameraAttached)
    })
  }
}
