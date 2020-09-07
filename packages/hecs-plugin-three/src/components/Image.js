import { Component, StringType, NumberType } from 'hecs'
import { AssetType } from 'hecs-plugin-core'

export class Image extends Component {
  static props = {
    asset: {
      type: AssetType,
      editor: {
        label: 'Asset',
        accept: '.png,.jpg,.jpeg',
      },
    },
    width: {
      type: NumberType,
      default: 1,
      editor: {
        label: 'Width',
      },
    },
    height: {
      type: NumberType,
      default: 1,
      editor: {
        label: 'Height',
      },
    },
    fit: {
      type: StringType,
      default: 'CONTAIN',
      editor: {
        label: 'Fit',
        input: 'Select',
        options: [
          { label: 'Contain', value: 'CONTAIN' },
          { label: 'Cover', value: 'COVER' },
        ],
      },
    },
  }
  static editor = {
    label: 'Image',
  }
}
