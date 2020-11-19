import { System, Groups } from 'hecs'
import { IS_BROWSER } from '../utils'

export class RenderSystem extends System {
  active = IS_BROWSER
  order = Groups.Presentation + 100

  init({ presentation }) {
    this.presentation = presentation
  }

  update() {
    if (!this.presentation.viewport) return
    this.presentation.render()
  }
}
