import { World, System, Component, StateComponent, Not, Modified } from '../src'

class Model extends Component {}

class ModelSystem extends System {
  static queries = {
    none: [Not(Model)],
    active: [Model],
  }

  update() {
    this.counts = { none: 0, active: 0 }
    this.queries.none.forEach(() => this.counts.none++)
    this.queries.active.forEach(() => this.counts.active++)
  }
}

describe('components', () => {
  const world = new World({
    systems: [ModelSystem],
    components: [Model],
  })

  const system = world.systems.get(ModelSystem)
  let block = world.entities.create().activate()

  test('initial update', () => {
    world.update()
    expect(system.counts.none).toBe(1)
    expect(system.counts.active).toBe(0)
  })

  test('add component', () => {
    block.add(Model)
    world.update()
    expect(system.counts.none).toBe(0)
    expect(system.counts.active).toBe(1)
  })

  test('get component by name', () => {
    block.add(Model)
    const model = block.getByName('Model')
    expect(model).toEqual(block.get(Model))
  })

  test('deactivate entity', () => {
    /**
     * Because the entity has no StateComponents, the entity
     * is immediately made inactive and removed from all queries
     */
    expect(block.active).toBe(true)
    block.deactivate()
    expect(block.active).toBe(false)
    world.update()
    expect(system.counts.none).toBe(0)
    expect(system.counts.active).toBe(0)
  })

  test('re-activate entity', () => {
    block.activate()
    expect(block.active).toBe(true)
    world.update()
    expect(system.counts.none).toBe(0)
    expect(system.counts.active).toBe(1)
  })
})
