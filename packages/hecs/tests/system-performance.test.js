import { World, System } from '../src'
import { performance } from 'perf_hooks'

describe('system performance', () => {
  test('measure system elapsed time', () => {
    class SystemA extends System {}
    class SystemB extends System {}
    class SystemC extends System {}

    const world = new World({
      systems: [SystemA, SystemB, SystemC],
      getTime: performance.now,
    })

    world.update(0)

    const timeA = world.systems.get(SystemA).elapsedTime
    const timeB = world.systems.get(SystemA).elapsedTime
    const timeC = world.systems.get(SystemA).elapsedTime

    expect(timeA).toBeGreaterThanOrEqual(0)
    expect(timeB).toBeGreaterThanOrEqual(0)
    expect(timeC).toBeGreaterThanOrEqual(0)
  })
})
