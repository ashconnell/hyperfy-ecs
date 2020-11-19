import EventEmitter from 'eventemitter3'
import { SystemManager } from './SystemManager'
import { QueryManager } from './QueryManager'
import { ArchetypeManager } from './ArchetypeManager'
import { EntityManager } from './EntityManager'
import { ComponentManager } from './ComponentManager'
import { createPlugin } from './createPlugin'

export class World extends EventEmitter {
  constructor(options = {}) {
    super()
    this.id = 0
    this.version = 0
    this.plugins = new Map()
    this.providers = {}
    this.systems = new SystemManager(this)
    this.queries = new QueryManager(this)
    this.archetypes = new ArchetypeManager(this)
    this.entities = new EntityManager(this)
    this.components = new ComponentManager(this)
    this.registerPlugin(
      createPlugin({
        name: 'root',
        ...options,
      })
    )
    this.archetypes.init()
    this.systems.init()
  }

  registerPlugin(plugin, options = {}) {
    if (this.plugins.has(plugin)) {
      // console.warn(`hecs: already registered plugin '${plugin.name}'`)
      return
    }
    this.plugins.set(plugin, true)
    plugin.plugins.forEach(entry => {
      if (entry instanceof Array) {
        const [plugin, options = {}] = entry
        this.registerPlugin(plugin, options)
      } else {
        const plugin = entry
        this.registerPlugin(plugin)
      }
    })
    plugin.systems.forEach(System => {
      this.systems.register(System)
    })
    plugin.components.forEach(Component => {
      this.components.register(Component)
    })
    if (plugin.decorate) {
      plugin.decorate(this, options)
    }
    console.log(`hecs: registered plugin '${plugin.name}'`)
  }

  update(delta) {
    this.version++
    this.systems.update(delta)
  }

  reset() {
    this.entities.reset()
    this.update((1 / 60) * 2)
    this.systems.reset()
  }

  toJSON() {
    const data = {
      nextEntityId: this.entities.nextEntityId,
      entities: [],
    }
    this.entities.entities.forEach(entity =>
      data.entities.push(entity.toJSON())
    )
    return data
  }

  fromJSON(data) {
    this.entities.nextEntityId = data.nextEntityId
    data.entities.forEach(entity => {
      this.entities.create(entity.name, entity.id).fromJSON(entity).activate()
    })
  }
}
