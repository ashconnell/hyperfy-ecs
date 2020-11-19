# Hecs

A high performance lightweight ECS with a plugin ecosystem.

See [TECHNICAL.md](TECHNICAL.md) for details on performance and the internals of this library.

## Install

Install via npm/yarn:

```
yarn add hecs
```

## Quickstart

```js
import {
  World, System,
  Component, StateComponent,
  Not, Modified
  StringType, RefType
} from 'hecs'

const exampleMeshes = {
  // These would normally be objects in memory that have whatever
  // data is needed for the Mesh to be rendered by an engine like
  // three.js, babylon.js, etc.
  basketball: {
    description: "a ball and its pretend mesh data",
    dispose: () => {
      console.log("basketball mesh disposed");
    },
  } 
}

class Model extends Component {
  static props = {
    type: StringType,
  }
}

class Mesh extends StateComponent {
  static props = {
    value: RefType,
  }
}

class ModelSystem extends System {
  static queries = {
    added: [Model, Not(Mesh)],
    modified: [Modified(Model), Mesh],
    removed: [Not(Model), Mesh],
  }

  update() {
    this.queries.added.forEach(entity => {
      const model = entity.get(Model)
      const object3d = exampleMeshes[model.type]
      entity.add(Mesh, { value: object3d })
    })
    this.queries.modified.forEach(entity => {
      entity.remove(Mesh)
      const model = entity.get(Model)
      const object3d = exampleMeshes[model.type]
      entity.add(Mesh, { value: object3d })
    })
    this.queries.removed.forEach(entity => {
      const object3d = entity.get(Mesh).value
      object3d.dispose()
      entity.remove(Mesh)
    })
  }
}

const world = new World({
  systems: [ModelSystem],
  components: [Model, Mesh]
})

// Create an entity
const entity = world.entities.create();

// Add our custom `Model` component with its required `type` property
entity.add(Model, { type: "basketball" }).activate();

// ... then, to demonstrate queries in ModelSystem, destroy the entity 3 seconds later
setTimeout(() => {
  entity.destroy();
}, 3000);


function update() {
  world.update()
  requestAnimationFrame(update)
}

update()
```

## Worlds

### Creating a world

```js
import { World } from 'hecs'
import CorePlugin from 'hecs-plugin-core'
import MySystem from './MySystem'
import MyComponent from './MyComponent'

const world = new World({
  plugins: [CorePlugin],
  systems: [MySystem],
  components: [MyComponent]
})
```

### Updating the world

```js
world.update()
```

## Entities

### Creating an entity

```js
const basketball = world.entities.create()
```

### Entity Hierarchy

```js
const parent = world.entities.create()
const child = world.entities.create()

child.setParent(parent) // use `null` to unset
parent.traverse(entity => {
  // called for this and all descendants
})
child.traverseAscendants(entity => {
  // called for all ascendants
})
parent.getChildren() // [child]
child.getParent() // parent
```

### Adding components

```js
basketball.add(Model, { path: 'basketball.glb' })
```

### Retrieving components

```js
const model = basketball.get(Model)
```

### Marking a component as modified

If you use queries that need to know when components are modified you will
need to mark them as modified.

```js
const model = basketball.get(Model)
model.path = 'basketball-2.glb'
model.modified()
```

### Removing components

```js
basketball.remove(Model)
```

### Activating an entity

Entities are inactive by default and are not simulated in world queries until they are activated:

```js
basketball.activate()
```

### Deactivating an entity

If you want to remove an entity from the world but still keep it around, use deactivate.
When deactivated, all Components are temporarily removed except StateComponents, so that
System queries can still process and deallocate any resources. Once all StateComponents are
removed the enitity is completely removed from all queries.

```js
basketball.deactivate()
```

### Destroying an entity

If you want to completely remove an entity, use destroy. All Components are removed except
StateComponents so that System queries can still process and deallocate resources. Once all
StateComponents are removed the entity is completely destroyed.

```js
basketball.destroy()
```

## Components

### Defining components

```js
import { Component, Types } from 'hecs'

export class Model extends Component {
  static props = {
    path: Types.Text
  }
}
```

## LocalComponents

LocalComponents work exactly the same as Components except they are ignored when calling
`world.toJSON()` or `entity.toJSON()`. LocalComponents should be used in a network 
environment when the data doesn't need to be synced between other servers or clients.

```js
import { LocalComponent } from 'hecs'
import { Axis } from './types'

export class Input extends LocalComponent {
  static props = {
    axis: Types.Axis2D
  }
}
```

## StateComponents

StateComponents work the same as regular Components but are kept around after
an entity is deactivated or destroyed, so that Systems can process or deallocate 
resources.

```js
import { StateComponent } from 'hecs'
import { Object3D } from './types'

export class Mesh extends StateComponent {
  static props = {
    value: Types.Object3D
  }
}
```

## Systems

### Creating systems

```js
import { System, Not, Changed } from 'hecs'
import { Mesh } from './components'

export class ModelSystem extends System {
  static queries = {
    added: [Model, Not(Mesh)],
    modified: [Modified(Model), Mesh],
    removed: [Not(Model), Mesh],
  }

  update() {
    this.queries.added.forEach(entity => {
      const model = entity.get(Model)
      const object3d = getModel(model.type)
      entity.add(Mesh, { value: object3d })
    })
    this.queries.modified.forEach(entity => {
      entity.remove(Mesh)
      const model = entity.get(Model)
      const object3d = getModel(model.type)
      entity.add(Mesh, { value: object3d })
    })
    this.queries.removed.forEach(entity => {
      const object3d = entity.get(Mesh).value
      object3d.dispose()
      entity.remove(Mesh)
    })
  }
}
```

## Plugins

### Creating a plugin

Plugins are a collection of things such as Systems and Components that you can use in your world, or compose with other plugins.

The Plugin options are exactly the same as when instantiating a new World:

```js
import { createPlugin } from 'hecs'

export default createPlugin({
  name: 'my-plugin',
  plugins: [],
  systems: [],
  components: [],
  decorate(world) {}
})
```

**name:** The name of your plugin, used for debugging purposes.

**plugins:** A plugin can depend on other plugins. If two plugins depend on the same plugin it will only be registered once.

**systems:** An array of Systems to add to the world.

**components:** An array of Components to register.

**decorate:** A function that provides the world instance. Useful for constructing shared services, eg scenes.