import { System, Not, Modified, Groups } from 'hecs'
import * as THREE from 'three'

import { Object3D, Model, ModelLoading, ModelMesh } from '../components'

let ids = 0

export class ModelSystem extends System {
  order = Groups.Initialization

  static queries = {
    added: [Object3D, Model, Not(ModelLoading), Not(ModelMesh)],
    modified: [Modified(Model)],
    removedObj: [Not(Object3D), ModelMesh],
    removed: [Not(Model), ModelMesh],
  }

  init({ presentation }) {
    this.presentation = presentation
  }

  update() {
    this.queries.added.forEach(entity => {
      console.log(`ModelSystem: ${entity.name} added`)
      this.build(entity)
    })
    this.queries.modified.forEach(entity => {
      const model = entity.get(Model)
      console.log(
        `ModelSystem: ${entity.name} Model modified`,
        JSON.stringify(model.asset)
      )
      const mesh = entity.get(ModelMesh)?.value
      if (mesh) {
        mesh.parent.remove(mesh)
        mesh.dispose?.()
        mesh.geometry?.dispose()
        mesh.material?.dispose()
      }
      entity.remove(ModelMesh)
      entity.remove(ModelLoading)
      this.build(entity)
    })
    this.queries.removedObj.forEach(entity => {
      console.log(`ModelSystem: ${entity.name} Object3D removed`)
      const mesh = entity.get(ModelMesh).value
      mesh.parent.remove(mesh)
      mesh.dispose?.()
      mesh.geometry?.dispose()
      mesh.material?.dispose()
      entity.remove(ModelMesh)
    })
    this.queries.removed.forEach(entity => {
      console.log(`ModelSystem: ${entity.name} Model removed`)
      const mesh = entity.get(ModelMesh).value
      mesh.parent.remove(mesh)
      mesh.dispose?.()
      mesh.geometry?.dispose()
      mesh.material?.dispose()
      entity.remove(ModelMesh)
    })
  }

  async build(entity) {
    const asset = entity.get(Model).asset
    if (!asset.url) {
      // attach a blank Object3D to move this entity to
      // a query that won't spam this build function repeatedly
      const mesh = new THREE.Object3D()
      const object3d = entity.get(Object3D).value
      object3d.add(mesh)
      entity.add(ModelMesh, { value: mesh })
      console.log(`ModelSystem: ${entity.name} has no asset, using placeholder`)
      return
    }
    const id = ++ids
    entity.add(ModelLoading, { id })
    console.log(`ModelSystem: loading id:${id}`)
    let mesh
    try {
      mesh = await this.presentation.load(asset.url)
    } catch (error) {
      console.error(error)
      return
    }
    const loadingId = entity.get(ModelLoading)?.id
    console.log(`ModelSystem: post-loading id:${loadingId}`)
    // if the id was changed/removed, exit
    if (loadingId !== id) {
      console.log(`ModelSystem: cancelled id:${id} (id was removed/changed)`)
      return
    }
    const object3d = entity.get(Object3D)?.value
    // if there is no longer an Object3D to attach the mesh to, exit
    if (!object3d) {
      console.log('ModelSystem: entity no longer has Object3D, reverting')
      entity.remove(ModelLoading)
      return
    }
    // otherwise, all good to continue
    entity.remove(ModelLoading)
    object3d.add(mesh)
    entity.add(ModelMesh, { value: mesh })
  }
}
