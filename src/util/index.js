import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import cornerstone from 'cornerstone-core'
import dcmjs from 'dcmjs'
import * as XLSX from 'xlsx'
import axios from "axios";

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
  if (dateTime) {
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
  } else {
    return 'Unknown'
  }

}

export function dicomTimeToLocale(dateTime) {
  if (dateTime) {
    const time = dateTime.substring(0, 2) + ':' + dateTime.substring(2, 4) + ':' + dateTime.substring(4, 6)
    return `${time}`
  } else {
    return 'Unknown'
  }

}

export const formatFile = async fileList => {
  // fileList = fileList.split(',')
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


// APIs
export const queryPatientAPI = () => {
  return axios.get(' http://localhost:56565/api/queryPatientData')
}
export const createSeriesAPI = () => {
  return axios.post(' http://localhost:56565/api/createSeriesTable')
}
export const updateSuggestAPI = (params) => {
  return axios.post(' http://localhost:56565/api/updateNode', params)
}
export const deleteNodeAPI = (params) => {
  return axios.post(' http://localhost:56565/api/deleteNode', params)
}

export const getDicomType = () => {
  return {
  '1.2.840.10008.1.3.10': {name: 'Media Storage Directory Storage', ciod: 'Basic Directory'},
  '1.2.840.10008.5.1.4.1.1.1': {name: 'Computed Radiography Image Storage', ciod: 'CR Image'},
  '1.2.840.10008.5.1.4.1.1.1.1': {name: 'Digital X-Ray Image Storage - For Presentation', ciod: 'Digital X-Ray Image'},
  '1.2.840.10008.5.1.4.1.1.1.1.1': {name: 'Digital X-Ray Image Storage - For Processing', ciod: 'Digital X-Ray Image'},
  '1.2.840.10008.5.1.4.1.1.1.2': {name: 'Digital Mammography X-Ray Image Storage - For Presentation', ciod: 'Digital Mammography X-Ray Image'},
  '1.2.840.10008.5.1.4.1.1.1.2.1': {name: 'Digital Mammography X-Ray Image Storage - For Processing', ciod: 'Digital Mammography X-Ray Image'},
  '1.2.840.10008.5.1.4.1.1.1.3': {name: 'Digital Intra-Oral X-Ray Image Storage - For Presentation', ciod: 'Digital Intra-Oral X-Ray Image'},
  '1.2.840.10008.5.1.4.1.1.1.3.1': {name: 'Digital Intra-Oral X-Ray Image Storage - For Processing', ciod: 'Digital Intra-Oral X-Ray Image'},
  '1.2.840.10008.5.1.4.1.1.2': {name: 'CT Image Storage', ciod: 'CT Image'},
  '1.2.840.10008.5.1.4.1.1.2.1': {name: 'Enhanced CT Image Storage', ciod: 'Enhanced CT Image'},
  '1.2.840.10008.5.1.4.1.1.2.2': {name: 'Legacy Converted Enhanced CT Image Storage', ciod: 'Legacy Converted Enhanced CT Image'},
  '1.2.840.10008.5.1.4.1.1.3.1': {name: 'Ultrasound Multi-frame Image Storage', ciod: 'US Multi-frame Image'},
  '1.2.840.10008.5.1.4.1.1.4': {name: 'MR Image Storage', ciod: 'MR Image'},
  '1.2.840.10008.5.1.4.1.1.4.1': {name: 'Enhanced MR Image Storage', ciod: 'Enhanced MR Image'},
  '1.2.840.10008.5.1.4.1.1.4.2': {name: 'MR Spectroscopy Storage', ciod: 'MR Spectroscopy'},
  '1.2.840.10008.5.1.4.1.1.4.3': {name: 'Enhanced MR Color Image Storage', ciod: 'Enhanced MR Color Image'},
  '1.2.840.10008.5.1.4.1.1.4.4': {name: 'Legacy Converted Enhanced MR Image Storage', ciod: 'Legacy Converted Enhanced MR Image'},
  '1.2.840.10008.5.1.4.1.1.6.1': {name: 'Ultrasound Image Storage', ciod: 'US Image'},
  '1.2.840.10008.5.1.4.1.1.6.2': {name: 'Enhanced US Volume Storage', ciod: 'Enhanced US Volume'},
  '1.2.840.10008.5.1.4.1.1.7': {name: 'Secondary Capture Image Storage', ciod: 'Secondary Capture Image'},
  '1.2.840.10008.5.1.4.1.1.7.1': {name: 'Multi-frame Single Bit Secondary Capture Image Storage', ciod: 'Multi-frame Single Bit SC Image'},
  '1.2.840.10008.5.1.4.1.1.7.2': {name: 'Multi-frame Grayscale Byte Secondary Capture Image Storage', ciod: 'Multi-frame Grayscale Byte SC Image'},
  '1.2.840.10008.5.1.4.1.1.7.3': {name: 'Multi-frame Grayscale Word Secondary Capture Image Storage', ciod: 'Multi-frame Grayscale Word SC Image'},
  '1.2.840.10008.5.1.4.1.1.7.4': {name: 'Multi-frame True Color Secondary Capture Image Storage', ciod: 'Multi-frame True Color SC Image'},
  '1.2.840.10008.5.1.4.1.1.9.1.1': {name: '12-lead ECG Waveform Storage', ciod: '12-Lead ECG'},
  '1.2.840.10008.5.1.4.1.1.9.1.2': {name: 'General ECG Waveform Storage', ciod: 'General ECG'},
  '1.2.840.10008.5.1.4.1.1.9.1.3': {name: 'Ambulatory ECG Waveform Storage', ciod: 'Ambulatory ECG'},
  '1.2.840.10008.5.1.4.1.1.9.2.1': {name: 'Hemodynamic Waveform Storage', ciod: 'Hemodynamic Waveform'},
  '1.2.840.10008.5.1.4.1.1.9.3.1': {name: 'Cardiac Electrophysiology Waveform Storage', ciod: 'Basic Cardiac Electrophysiology Waveform'},
  '1.2.840.10008.5.1.4.1.1.9.4.1': {name: 'Basic Voice Audio Waveform Storage', ciod: 'Basic Voice Audio Waveform'},
  '1.2.840.10008.5.1.4.1.1.9.4.2': {name: 'General Audio Waveform Storage', ciod: 'General Audio Waveform'},
  '1.2.840.10008.5.1.4.1.1.9.5.1': {name: 'Arterial Pulse Waveform Storage', ciod: 'Arterial Pulse Waveform'},
  '1.2.840.10008.5.1.4.1.1.9.6.1': {name: 'Respiratory Waveform Storage', ciod: 'Respiratory Waveform'},
  '1.2.840.10008.5.1.4.1.1.11.1': {name: 'Grayscale Softcopy Presentation State Storage', ciod: 'Grayscale Softcopy Presentation State'},
  '1.2.840.10008.5.1.4.1.1.11.2': {name: 'Color Softcopy Presentation State Storage', ciod: 'Color Softcopy Presentation State'},
  '1.2.840.10008.5.1.4.1.1.11.3': {name: 'Pseudo-Color Softcopy Presentation State Storage', ciod: 'Pseudo-Color Softcopy Presentation State'},
  '1.2.840.10008.5.1.4.1.1.11.4': {name: 'Blending Softcopy Presentation State Storage', ciod: 'Blending Softcopy Presentation State'},
  '1.2.840.10008.5.1.4.1.1.11.5': {name: 'XA/XRF Grayscale Softcopy Presentation State Storage', ciod: 'XA/XRF Grayscale Softcopy Presentation State'},
  '1.2.840.10008.5.1.4.1.1.11.6': {name: 'Grayscale Planar MPR Volumetric Presentation State Storage', ciod: 'Planar MPR Volumetric Presentation State'},
  '1.2.840.10008.5.1.4.1.1.11.7': {name: 'Compositing Planar MPR Volumetric Presentation State Storage', ciod: 'Planar MPR Volumetric Presentation State'},
  '1.2.840.10008.5.1.4.1.1.11.8': {name: 'Advanced Blending Presentation State Storage', ciod: 'Advanced Blending Presentation State'},
  '1.2.840.10008.5.1.4.1.1.11.9': {name: 'Volume Rendering Volumetric Presentation State Storage', ciod: 'Volume Rendering Volumetric Presentation State'},
  '1.2.840.10008.5.1.4.1.1.11.10': {name: 'Segmented Volume Rendering Volumetric Presentation State Storage', ciod: 'Volume Rendering Volumetric Presentation State'},
  '1.2.840.10008.5.1.4.1.1.11.11': {name: 'Multiple Volume Rendering Volumetric Presentation State Storage', ciod: 'Volume Rendering Volumetric Presentation State'},
  '1.2.840.10008.5.1.4.1.1.12.1': {name: 'X-Ray Angiographic Image Storage', ciod: 'X-Ray Angiographic Image'},
  '1.2.840.10008.5.1.4.1.1.12.1.1': {name: 'Enhanced XA Image Storage', ciod: 'Enhanced XA Image'},
  '1.2.840.10008.5.1.4.1.1.12.2': {name: 'X-Ray Radiofluoroscopic Image Storage', ciod: 'X-Ray Radiofluoroscopic Image'},
  '1.2.840.10008.5.1.4.1.1.12.2.1': {name: 'Enhanced XRF Image Storage', ciod: 'Enhanced XRF Image'},
  '1.2.840.10008.5.1.4.1.1.13.1.1': {name: 'X-Ray 3D Angiographic Image Storage', ciod: 'X-Ray 3D Angiographic Image'},
  '1.2.840.10008.5.1.4.1.1.13.1.2': {name: 'X-Ray 3D Craniofacial Image Storage', ciod: 'X-Ray 3D Craniofacial Image'},
  '1.2.840.10008.5.1.4.1.1.13.1.3': {name: 'Breast Tomosynthesis Image Storage', ciod: 'Breast Tomosynthesis Image'},
  '1.2.840.10008.5.1.4.1.1.13.1.4': {name: 'Breast Projection X-Ray Image Storage - For Presentation', ciod: 'Breast Projection X-Ray Image'},
  '1.2.840.10008.5.1.4.1.1.13.1.5': {name: 'Breast Projection X-Ray Image Storage - For Processing', ciod: 'Breast Projection X-Ray Image'},
  '1.2.840.10008.5.1.4.1.1.14.1': {name: 'Intravascular Optical Coherence Tomography Image Storage - For Presentation', ciod: 'Intravascular Optical Coherence Tomography Image'},
  '1.2.840.10008.5.1.4.1.1.14.2': {name: 'Intravascular Optical Coherence Tomography Image Storage - For Processing', ciod: 'Intravascular Optical Coherence Tomography Image'},
  '1.2.840.10008.5.1.4.1.1.20': {name: 'Nuclear Medicine Image Storage', ciod: 'NM Image'},
  '1.2.840.10008.5.1.4.1.1.30': {name: 'Parametric Map Storage', ciod: 'Parametric Map'},
  '1.2.840.10008.5.1.4.1.1.66': {name: 'Raw Data Storage', ciod: 'Raw Data'},
  '1.2.840.10008.5.1.4.1.1.66.1': {name: 'Spatial Registration Storage', ciod: 'Spatial Registration'},
  '1.2.840.10008.5.1.4.1.1.66.2': {name: 'Spatial Fiducials Storage', ciod: 'Spatial Fiducials'},
  '1.2.840.10008.5.1.4.1.1.66.3': {name: 'Deformable Spatial Registration Storage', ciod: 'Deformable Spatial Registration'},
  '1.2.840.10008.5.1.4.1.1.66.4': {name: 'Segmentation Storage', ciod: 'Segmentation'},
  '1.2.840.10008.5.1.4.1.1.66.5': {name: 'Surface Segmentation Storage', ciod: 'Surface Segmentation'},
  '1.2.840.10008.5.1.4.1.1.66.6': {name: 'Tractography Results Storage', ciod: 'Tractography Results'},
  '1.2.840.10008.5.1.4.1.1.67': {name: 'Real World Value Mapping Storage', ciod: 'Real World Value Mapping'},
  '1.2.840.10008.5.1.4.1.1.68.1': {name: 'Surface Scan Mesh Storage', ciod: 'Surface Scan Mesh'},
  '1.2.840.10008.5.1.4.1.1.68.2': {name: 'Surface Scan Point Cloud Storage', ciod: 'Surface Scan Point Cloud'},
  '1.2.840.10008.5.1.4.1.1.77.1.1': {name: 'VL Endoscopic Image Storage', ciod: 'VL Endoscopic Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.1.1': {name: 'Video Endoscopic Image Storage', ciod: 'Video Endoscopic Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.2': {name: 'VL Microscopic Image Storage', ciod: 'VL Microscopic Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.2.1': {name: 'Video Microscopic Image Storage', ciod: 'Video Microscopic Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.3': {name: 'VL Slide-Coordinates Microscopic Image Storage', ciod: 'VL Slide-Coordinates Microscopic Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.4': {name: 'VL Photographic Image Storage', ciod: 'VL Photographic Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.4.1': {name: 'Video Photographic Image Storage', ciod: 'Video Photographic Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.5.1': {name: 'Ophthalmic Photography 8 Bit Image Storage', ciod: 'Ophthalmic Photography 8 Bit Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.5.2': {name: 'Ophthalmic Photography 16 Bit Image Storage', ciod: 'Ophthalmic Photography 16 Bit Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.5.3': {name: 'Stereometric Relationship Storage', ciod: 'Stereometric Relationship'},
  '1.2.840.10008.5.1.4.1.1.77.1.5.4': {name: 'Ophthalmic Tomography Image Storage', ciod: 'Ophthalmic Tomography Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.5.5': {name: 'Wide Field Ophthalmic Photography Stereographic Projection Image Storage', ciod: 'Wide Field Ophthalmic Photography Stereographic Projection Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.5.6': {name: 'Wide Field Ophthalmic Photography 3D Coordinates Image Storage', ciod: 'Wide Field Ophthalmic Photography 3D Coordinates Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.5.7': {name: 'Ophthalmic Optical Coherence Tomography En Face Image Storage', ciod: 'Ophthalmic Optical Coherence Tomography En Face Image'},
  '1.2.840.10008.5.1.4.1.1.77.1.5.8': {name: 'Ophthalmic Optical Coherence Tomography B-scan Volume Analysis Storage', ciod: 'Ophthalmic Optical Coherence Tomography B-scan Volume Analysis'},
  '1.2.840.10008.5.1.4.1.1.77.1.6': {name: 'VL Whole Slide Microscopy Image Storage', ciod: 'VL Whole Slide Microscopy Image'},
  '1.2.840.10008.5.1.4.1.1.78.1': {name: 'Lensometry Measurements Storage', ciod: 'Lensometry Measurements'},
  '1.2.840.10008.5.1.4.1.1.78.2': {name: 'Autorefraction Measurements Storage', ciod: 'Autorefraction Measurements'},
  '1.2.840.10008.5.1.4.1.1.78.3': {name: 'Keratometry Measurements Storage', ciod: 'Keratometry Measurements'},
  '1.2.840.10008.5.1.4.1.1.78.4': {name: 'Subjective Refraction Measurements Storage', ciod: 'Subjective Refraction Measurements'},
  '1.2.840.10008.5.1.4.1.1.78.5': {name: 'Visual Acuity Measurements Storage', ciod: 'Visual Acuity Measurements'},
  '1.2.840.10008.5.1.4.1.1.78.6': {name: 'Spectacle Prescription Report Storage', ciod: 'Spectacle Prescription Report'},
  '1.2.840.10008.5.1.4.1.1.78.7': {name: 'Ophthalmic Axial Measurements Storage', ciod: 'Ophthalmic Axial Measurements'},
  '1.2.840.10008.5.1.4.1.1.78.8': {name: 'Intraocular Lens Calculations Storage', ciod: 'Intraocular Lens Calculations'},
  '1.2.840.10008.5.1.4.1.1.79.1': {name: 'Macular Grid Thickness and Volume Report', ciod: 'Macular Grid Thickness and Volume Report'},
  '1.2.840.10008.5.1.4.1.1.80.1': {name: 'Ophthalmic Visual Field Static Perimetry Measurements Storage', ciod: 'Ophthalmic Visual Field Static Perimetry Measurements'},
  '1.2.840.10008.5.1.4.1.1.81.1': {name: 'Ophthalmic Thickness Map Storage', ciod: 'Ophthalmic Thickness Map'},
  '1.2.840.10008.5.1.4.1.1.82.1': {name: 'Corneal Topography Map Storage', ciod: 'Corneal Topography Map'},
  '1.2.840.10008.5.1.4.1.1.88.11': {name: 'Basic Text SR Storage', ciod: 'Basic Text SR'},
  '1.2.840.10008.5.1.4.1.1.88.22': {name: 'Enhanced SR Storage', ciod: 'Enhanced SR'},
  '1.2.840.10008.5.1.4.1.1.88.33': {name: 'Comprehensive SR Storage', ciod: 'Comprehensive SR'},
  '1.2.840.10008.5.1.4.1.1.88.34': {name: 'Comprehensive 3D SR Storage', ciod: 'Comprehensive 3D SR'},
  '1.2.840.10008.5.1.4.1.1.88.35': {name: 'Extensible SR Storage', ciod: 'Extensible SR'},
  '1.2.840.10008.5.1.4.1.1.88.40': {name: 'Procedure Log Storage', ciod: 'Procedure Log'},
  '1.2.840.10008.5.1.4.1.1.88.50': {name: 'Mammography CAD SR Storage', ciod: 'Mammography CAD SR'},
  '1.2.840.10008.5.1.4.1.1.88.59': {name: 'Key Object Selection Document Storage', ciod: 'Key Object Selection Document'},
  '1.2.840.10008.5.1.4.1.1.88.65': {name: 'Chest CAD SR Storage', ciod: 'Chest CAD SR'},
  '1.2.840.10008.5.1.4.1.1.88.67': {name: 'X-Ray Radiation Dose SR Storage', ciod: 'X-Ray Radiation Dose SR'},
  '1.2.840.10008.5.1.4.1.1.88.68': {name: 'Radiopharmaceutical Radiation Dose SR Storage', ciod: 'Radiopharmaceutical Radiation Dose SR'},
  '1.2.840.10008.5.1.4.1.1.88.69': {name: 'Colon CAD SR Storage', ciod: 'Colon CAD SR'},
  '1.2.840.10008.5.1.4.1.1.88.70': {name: 'Implantation Plan SR Document Storage', ciod: 'Implantation Plan SR Document'},
  '1.2.840.10008.5.1.4.1.1.88.71': {name: 'Acquisition Context SR Storage', ciod: 'Acquisition Context SR'},
  '1.2.840.10008.5.1.4.1.1.88.72': {name: 'Simplified Adult Echo SR Storage', ciod: 'Simplified Adult Echo SR'},
  '1.2.840.10008.5.1.4.1.1.88.73': {name: 'Patient Radiation Dose SR Storage', ciod: 'Patient Radiation Dose Structured Report'},
  '1.2.840.10008.5.1.4.1.1.88.74': {name: 'Planned Imaging Agent Administration SR Storage', ciod: 'Planned Imaging Agent Administration SR'},
  '1.2.840.10008.5.1.4.1.1.88.75': {name: 'Performed Imaging Agent Administration SR Storage', ciod: 'Performed Imaging Agent Administration SR'},
  '1.2.840.10008.5.1.4.1.1.90.1': {name: 'Content Assessment Results Storage', ciod: 'Content Assessment Results'},
  '1.2.840.10008.5.1.4.1.1.104.1': {name: 'Encapsulated PDF Storage', ciod: 'Encapsulated PDF'},
  '1.2.840.10008.5.1.4.1.1.104.2': {name: 'Encapsulated CDA Storage', ciod: 'Encapsulated CDA'},
  '1.2.840.10008.5.1.4.1.1.104.3': {name: 'Encapsulated STL Storage', ciod: 'Encapsulated STL'},
  '1.2.840.10008.5.1.4.1.1.104.4': {name: 'Encapsulated OBJ Storage', ciod: 'Encapsulated OBJ'},
  '1.2.840.10008.5.1.4.1.1.104.5': {name: 'Encapsulated MTL Storage', ciod: 'Encapsulated MTL'},
  '1.2.840.10008.5.1.4.1.1.128': {name: 'Positron Emission Tomography Image Storage', ciod: 'PET Image'},
  '1.2.840.10008.5.1.4.1.1.128.1': {name: 'Legacy Converted Enhanced PET Image Storage', ciod: 'Legacy Converted Enhanced PET Image'},
  '1.2.840.10008.5.1.4.1.1.130': {name: 'Enhanced PET Image Storage', ciod: 'Enhanced PET Image'},
  '1.2.840.10008.5.1.4.1.1.131': {name: 'Basic Structured Display Storage', ciod: 'Basic Structured Display'},
  '1.2.840.10008.5.1.4.1.1.200.1': {name: 'CT Defined Procedure Protocol Storage', ciod: 'CT Defined Procedure Protocol'},
  '1.2.840.10008.5.1.4.1.1.200.2': {name: 'CT Performed Procedure Protocol Storage', ciod: 'CT Performed Procedure Protocol'},
  '1.2.840.10008.5.1.4.1.1.200.3': {name: 'Protocol Approval Storage', ciod: 'Protocol Approval'},
  '1.2.840.10008.5.1.4.1.1.481.1': {name: 'RT Image Storage', ciod: 'RT Image'},
  '1.2.840.10008.5.1.4.1.1.481.2': {name: 'RT Dose Storage', ciod: 'RT Dose'},
  '1.2.840.10008.5.1.4.1.1.481.3': {name: 'RT Structure Set Storage', ciod: 'RT Structure Set'},
  '1.2.840.10008.5.1.4.1.1.481.4': {name: 'RT Beams Treatment Record Storage', ciod: 'RT Beams Treatment Record'},
  '1.2.840.10008.5.1.4.1.1.481.5': {name: 'RT Plan Storage', ciod: 'RT Plan'},
  '1.2.840.10008.5.1.4.1.1.481.6': {name: 'RT Brachy Treatment Record Storage', ciod: 'RT Brachy Treatment Record'},
  '1.2.840.10008.5.1.4.1.1.481.7': {name: 'RT Treatment Summary Record Storage', ciod: 'RT Treatment Summary Record'},
  '1.2.840.10008.5.1.4.1.1.481.8': {name: 'RT Ion Plan Storage', ciod: 'RT Ion Plan'},
  '1.2.840.10008.5.1.4.1.1.481.9': {name: 'RT Ion Beams Treatment Record Storage', ciod: 'RT Ion Beams Treatment Record'},
  '1.2.840.10008.5.1.4.1.1.481.10': {name: 'RT Physician Intent Storage', ciod: 'RT Physician Intent'},
  '1.2.840.10008.5.1.4.1.1.481.11': {name: 'RT Segment Annotation Storage', ciod: 'RT Segment Annotation'},
  '1.2.840.10008.5.1.4.1.1.481.12': {name: 'RT Radiation Set Storage', ciod: 'RT Radiation Set'},
  '1.2.840.10008.5.1.4.1.1.481.13': {name: 'C-Arm Photon-Electron Radiation Storage', ciod: 'C-Arm Photon-Electron Radiation'},
  '1.2.840.10008.5.1.4.1.1.481.14': {name: 'Tomotherapeutic Radiation Storage', ciod: 'Tomotherapeutic Radiation'},
  '1.2.840.10008.5.1.4.1.1.481.15': {name: 'Robotic-Arm Radiation Storage', ciod: 'Robotic-Arm Radiation'},
  '1.2.840.10008.5.1.4.34.7': {name: 'RT Beams Delivery Instruction Storage', ciod: 'RT Beams Delivery Instruction'},
  '1.2.840.10008.5.1.4.34.10': {name: 'RT Brachy Application Setup Delivery Instruction Storage', ciod: 'RT Brachy Application Setup Delivery Instruction'},
  '1.2.840.10008.5.1.4.38.1': {name: 'Hanging Protocol Storage', ciod: 'Hanging Protocol'},
  '1.2.840.10008.5.1.4.39.1': {name: 'Color Palette Storage', ciod: 'Color Palette'},
  '1.2.840.10008.5.1.4.43.1': {name: 'Generic Implant Template Storage', ciod: 'Generic Implant Template'},
  '1.2.840.10008.5.1.4.44.1': {name: 'Implant Assembly Template Storage', ciod: 'Implant Assembly Template'},
  '1.2.840.10008.5.1.4.45.1': {name: 'Implant Template Group Storage', ciod: 'Implant Template Group'},
  }
}