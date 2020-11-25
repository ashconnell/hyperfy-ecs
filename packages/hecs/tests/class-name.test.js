import { World, System, Component } from '../src'

class Fallback extends Component {}

class Model extends Component {
  static className = 'AltModel'
}

class FallbackSystem extends System {}

class ModelSystem extends System {
  static className = 'AltModelSystem'
}

describe('className', () => {
  const world = new World({
    systems: [ModelSystem, FallbackSystem],
    components: [Model, Fallback],
  })

  test('component uses name', () => {
    const entity = world.entities.create('e1').add(Fallback)
    const fallback = entity.get(Fallback)
    expect(fallback.name).toEqual('Fallback')
  })

  test('component prefers className if provided', () => {
    const entity = world.entities.create('e1').add(Model)
    const model = entity.get(Model)
    expect(model.name).toEqual('AltModel')
  })

  test('Component uses name', () => {
    const fallbackComponent = world.components.componentsByName['Fallback']
    expect(fallbackComponent).toEqual(Fallback)
  })

  test('Component prefers className if provided', () => {
    expect(world.components.componentsByName['Model']).toBeUndefined()

    const modelComponent = world.components.componentsByName['AltModel']
    expect(modelComponent).toEqual(Model)
  })

  test('System uses name', () => {
    const fallbackSystem = world.systems.getByName('FallbackSystem')
    expect(fallbackSystem.constructor).toEqual(FallbackSystem)
  })

  test('System prefers className if provided', () => {
    expect(world.systems.getByName('ModelSystem')).toBeUndefined()

    const modelSystem = world.systems.getByName('AltModelSystem')
    expect(modelSystem.constructor).toEqual(ModelSystem)
  })
})
