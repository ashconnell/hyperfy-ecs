export class Component {
  static props = {}
  static isComponent = true

  constructor(world, values = {}) {
    this.world = world
    this.name = this.constructor.className || this.constructor.name
    this.props = []
    this.modifiedUntilSystemTick = 0

    for (const key in this.constructor.props) {
      let prop = this.constructor.props[key]
      const value = values[key]

      // rewrite shorthand to expanded first time
      if (!prop.type) {
        prop = { type: prop }
        this.constructor.props[key] = prop
      }

      const initialValue =
        value === undefined
          ? prop.defaultFn
            ? prop.defaultFn()
            : prop.default
          : value

      this[key] = prop.type.initial(initialValue)
      this.props.push(prop)
    }
  }

  toJSON() {
    const data = {}
    for (const key in this.constructor.props) {
      const prop = this.constructor.props[key]
      const type = prop.type || prop
      data[key] = type.toJSON(this[key])
    }
    return data
  }

  fromJSON(data) {
    for (const key in this.constructor.props) {
      const prop = this.constructor.props[key]
      const type = prop.type || prop
      if (data[key] !== undefined) {
        this[key] = type.fromJSON(data[key], this[key])
      }
    }
    return this
  }

  modified() {
    /**
     * When a component is marked as changed it will show up
     * in Modified() queries for one cycle starting from the current
     * system it was changed in and ending in the system that runs
     * before it. See `Query.js` for how change detection is checked
     **/
    this.modifiedUntilSystemTick =
      this.world.systems.tick + this.world.systems.systems.length
  }
}
