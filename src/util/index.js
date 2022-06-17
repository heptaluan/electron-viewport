import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import cornerstone from 'cornerstone-core'
import dcmjs from 'dcmjs'
import * as XLSX from 'xlsx'

export const readFileInfo = file => {
  const arrayBuffer = window.fs.readFileSync(file.path).buffer
  const dicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer)
  return dicomDict
}
export const readFileRaw  = (file) => {
  const arrayBuffer = window.fs.readFileSync(file.path).buffer;
  return arrayBuffer
}

export const addDicomFile = file => {
  const dcmID = cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
  return cornerstone.loadImage(dcmID).then(function (image) {
    return image
  })
}

export const showImageByDCMID = dcmID => {
  return cornerstone.loadImage(dcmID).then(function (image) {
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

// ====================================================
// ====================================================

// 下载文件
export const downloadFile = (data, fileName) => {
  const sheet = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, fileName)
  const workbookBlob = workbook2blob(wb)
  openDownload(workbookBlob, `${fileName}.csv`)
}

// 创建 blobUrl，通过 createObjectURL 实现下载
export const openDownload = (blob, fileName) => {
  if (typeof blob === 'object' && blob instanceof Blob) {
    blob = URL.createObjectURL(blob)
  }
  const aLink = document.createElement('a')
  aLink.href = blob
  aLink.download = fileName || ''
  let event
  if (window.MouseEvent) event = new MouseEvent('click')
  else {
    event = document.createEvent('MouseEvents')
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  }
  aLink.dispatchEvent(event)
}

// 将 workbook 转化为 blob 对象
export const workbook2blob = workbook => {
  const wopts = {
    bookType: 'csv',
    bookSST: false,
    type: 'binary',
  }
  const wbout = XLSX.write(workbook, wopts)
  const blob = new Blob([s2ab(wbout)], {
    type: 'application/octet-stream',
  })
  return blob
}

// 将字符串转ArrayBuffer
export const s2ab = s => {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
  return buf
}
