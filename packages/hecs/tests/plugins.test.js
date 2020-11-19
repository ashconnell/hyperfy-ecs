import { createPlugin, World } from '../src'

const FooPlugin = createPlugin({
  name: 'hecs-plugin-foo',
  decorate(world) {
    world.hasFooPlugin = true
  },
})

const BarPlugin = createPlugin({
  name: 'hecs-plugin-bar',
  plugins: [FooPlugin],
  decorate(world) {
    world.hasBarPlugin = true
  },
})

const ConfigurablePlugin = options => {
  return createPlugin({
    name: 'hecs-plugin-configurable',
    plugins: [FooPlugin],
    decorate(world) {
      world.hasConfigurablePlugin = true
      world.configurablePluginOptions = options
    },
  })
}

describe('plugins', () => {
  test('plugins dependent plugins are automatically installed', () => {
    const world = new World({
      plugins: [BarPlugin],
    })
    expect(world.hasFooPlugin).toBe(true)
    expect(world.hasBarPlugin).toBe(true)
  })

  test('plugins can include captured options', () => {
    const world = new World({
      plugins: [ConfigurablePlugin({ option: true })],
    })
    expect(world.hasFooPlugin).toBe(true)
    expect(world.hasConfigurablePlugin).toBe(true)
    expect(world.configurablePluginOptions.option).toBe(true)
  })

  test('a function passed in as a plugin is called', () => {
    const world = new World({
      plugins: [ConfigurablePlugin],
    })
    expect(world.hasFooPlugin).toBe(true)
    expect(world.hasConfigurablePlugin).toBe(true)
    expect(world.configurablePluginOptions).toBe(undefined)
  })
})
