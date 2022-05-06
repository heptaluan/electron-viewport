import csTools from 'cornerstone-tools'
import toolColors from './toolColors.js'
import { getToolState, getNewContext, draw, drawRect } from './util'

const BaseAnnotationTool = csTools.importInternal('base/BaseAnnotationTool')

export default class MarkNoduleTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'MarkNodule',
      supportedInteractionTypes: ['Mouse'],
      configuration: {
        drawHandles: false,
        drawHandlesOnHover: false,
        hideHandlesIfMoving: true,
        renderDashed: false,
      },
    }

    super(props, defaultProps)
  }

  handleSelectedCallback(e) {
    // 覆盖父类方法，禁止工具选中
  }

  createNewMeasurement(eventData) {
    return {
      visible: true,
      active: false,
      color: undefined,
      invalidated: true,
      handles: {
        start: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: false,
          active: false,
        },
        end: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: false,
          active: false,
        },
      },
    }
  }

  pointNearTool(element, data, coords, interactionType) {
    return false
  }

  updateCachedStats(image, element, data) {
    // const seriesModule = cornerstone.metaData.get('generalSeriesModule', image.imageId) || {}
    // const modality = seriesModule.modality
    // const pixelSpacing = getPixelSpacing(image)
    // const stats = _calculateStats(image, element, data.handles, modality, pixelSpacing)
    // data.cachedStats = stats
    // data.invalidated = false
  }

  renderToolData(evt) {
    const toolData = getToolState(evt.currentTarget, this.name)
    localStorage.setItem('active', 'false')

    if (!toolData) {
      return
    }

    if (toolData.data[0]) {
      localStorage.setItem('active', 'true')
    } else {
      localStorage.setItem('active', 'false')
    }

    const eventData = evt.detail
    const { element } = eventData
    const context = getNewContext(eventData.canvasContext.canvas)

    draw(context, context => {
      // If we have tool data for this element - iterate over each set and draw it
      for (let i = 0; i < toolData.data.length; i++) {
        const data = toolData.data[i]

        if (data.visible === false) {
          continue
        }

        // Configure
        const color = toolColors.getColorIfActive(data)

        const rectOptions = { color }

        // Draw
        drawRect(
          context,
          element,
          data.handles.start,
          data.handles.end,
          rectOptions,
          'pixel',
          data.handles.initialRotation
        )
      }
    })
  }
}
