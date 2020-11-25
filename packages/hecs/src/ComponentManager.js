export class ComponentManager {
  constructor(world) {
    this.world = world
    this.count = 0
    this.lastComponentId = 0
    this.componentsByName = {}
  }

  register(Component) {
    const name = Component.className || Component.name
    if (this.componentsByName[name]) {
      throw new Error(`hecs: component already registered '${name}'`)
    }
    Component.id = this.lastComponentId++
    this.componentsByName[name] = Component
    this.count++
    return this
  }

  getByName(name) {
    return this.componentsByName[name]
  }
}
