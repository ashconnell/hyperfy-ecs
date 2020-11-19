import { createPlugin } from 'hecs'
import CorePlugin from 'hecs-plugin-core'

import * as Components from './components'
import * as Systems from './systems'
import { Presentation } from './Presentation'
import { IS_BROWSER } from './utils'

export * from './types'
export * from './components'

export { Components }

// convert Components into an array
const components = []
for (const key in Components) {
  components.push(Components[key])
}

// convert Systems into an array
const systems = []
for (const key in Systems) {
  systems.push(Systems[key])
}

export default createPlugin({
  name: 'hecs-plugin-three',
  plugins: [CorePlugin],
  systems,
  components,
  decorate(world, options) {
    if (IS_BROWSER) {
      world.presentation = new Presentation(world, options)
    }
  },
})
