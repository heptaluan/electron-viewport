import { domReady } from "./utils";
import { useLoading } from "./loading";
// import sqlite3 from 'sqlite3'
import { join } from "path";
import dicomParser from "dicom-parser";

import * as cornerstone from "cornerstone-core";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as cornerstoneTools from "cornerstone-tools";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstoneMath = cornerstoneMath;

cornerstoneTools.init();

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.webWorkerManager.initialize({
  maxWebWorkers: navigator.hardwareConcurrency || 1,
  startWebWorkersOnDemand: true,
  taskConfiguration: {
    decodeTask: {
      initializeCodecsOnStartup: false,
      usePDFJS: false,
      strict: false,
    },
  },
});

(window as any).cornerstone = cornerstone;
(window as any).cornerstoneTools = cornerstoneTools;

const { appendLoading, removeLoading } = useLoading();
window.removeLoading = removeLoading;

domReady().then(appendLoading);
// @ts-ignore
// window.sqlite = sqlite3;
// window.initSqlJs = initSqlJs

const rootPath = join(__dirname, "..");
// const dbPath = join(rootPath, 'static', 'dicom.db');
const dbPath = join("D:\\vs2019\\DicomViewer\\bin\\Debug", "dicom.db");
window.dbPath = dbPath;
window.dicomParser = dicomParser;
