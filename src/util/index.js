import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import cornerstone from 'cornerstone-core'

export const addDicomFile = file => {
  const dcmID = cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
  // console.log("dcmID: ", dcmID)
  return cornerstone.loadImage(dcmID).then(function (image) {
    // console.log(image);
    return image
  })
}
export const showDicomImage = file => {
  const dcmID = cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
  console.log('dcmID: ', dcmID)
  const element = document.querySelector('.viewport-element')
  cornerstone.enable(element, { colormap: '' })

  return cornerstone.loadImage(dcmID).then(function (image) {
    console.log(image)
    const viewport = cornerstone.getDefaultViewportForImage(element, image)
    cornerstone.displayImage(element, image, viewport)
    return image
  })
}

export function dicomDateTimeToLocale(dateTime) {
  const date = new Date(dateTime.substring(0, 4) + '-' + dateTime.substring(4, 6) + '-' + dateTime.substring(6, 8))
  const time = dateTime.substring(9, 11) + ':' + dateTime.substring(11, 13) + ':' + dateTime.substring(13, 15)
  const localeDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  return `${localeDate} - ${time}`
}

export const formatFile = async fileList => {
  fileList = fileList.split(',')
  const imagesIDConfig = []
  for (let i = 0; i < fileList.length; i++) {
    const data = window.fs.readFileSync(fileList[i])
    const fileName = fileList[i].split('\\').pop()
    const file = new window.File([data], fileName, { type: 'application/dicom' })
    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
    imagesIDConfig.push(imageId)
  }
  return imagesIDConfig
}
