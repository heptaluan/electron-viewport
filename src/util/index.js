import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import cornerstone from 'cornerstone-core'
import dcmjs from "dcmjs";

export const readFileInfo  = (file) => {
  const arrayBuffer = window.fs.readFileSync(file.path).buffer;
  const dicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer)
  return dicomDict
}

export const addDicomFile = file => {
  const dcmID = cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
  // console.log("dcmID: ", dcmID)
  return cornerstone.loadImage(dcmID).then(function (image) {
    // console.log(image);
    return image
  })
}

export const showImageByDCMID= dcmID => {
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

export function dicomDateTimeToLocale(dateTime, divide) {
  const date = new Date(dateTime.substring(0, 4) + '-' + dateTime.substring(4, 6) + '-' + dateTime.substring(6, 8))
  const time = dateTime.substring(9, 11) + ':' + dateTime.substring(11, 13) + ':' + dateTime.substring(13, 15)
  const localeDate = date.toLocaleDateString()
  if (!divide) {
    return `${localeDate} ${time}`
  } else if (divide === 'date') {
    return `${localeDate}`
  } else if (divide === 'time') {
    return `${time}`
  }
}

export function dicomTimeToLocale(dateTime) {
  const time = dateTime.substring(0, 2) + ':' + dateTime.substring(2, 4) + ':' + dateTime.substring(4, 6)
    return `${time}`
}

export const formatFile = async fileList => {
  fileList = fileList.split(',')
  const imagesIDConfig = []
  for (let i = 0; i < fileList.length; i++) {
    if (window.fs.existsSync(fileList[i])) {
      const data = window.fs.readFileSync(fileList[i])
      const fileName = fileList[i].split('\\').pop()
      const file = new window.File([data], fileName, { type: 'application/dicom' })
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
      imagesIDConfig.push(imageId)
    } else {
      console.log(fileList[i], ' not exists!!!')
      return
    }
  }
  return imagesIDConfig
}

export const keyFormat = txt => {
  return txt.replace(/\/|\s/gi, '_')
}