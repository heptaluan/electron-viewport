const { platform, arch } = require('process')
const ffi_Library = require('ffi-napi')
// const { createRequire } = require('module')
// const require = createRequire(import.meta.url)
const ref = require('ref-napi')
const refArray = require('ref-array-napi')
const StructType = require('ref-struct-napi')

function genResult(retcode, info, msg, returnParam) {
  return { errorCode: retcode, result: info, message: msg, param: returnParam }
}

function genDongleInfoItem(versionL, versionR, type, userId, hardwareIdL, hardwareIdR, productId, isMother, devType) {
  var typeList = { 0: 'ROCKEY-ARM TIME', 2: 'StoreROCKEY-ARM', 255: 'ROCKEY-ARM' }
  var motherTypeList = { 0: 'New Dongle', 1: 'Master Dongle', 2: 'User Dongle' }
  var devTypeList = { 0: 'HID Device', 1: 'Smart Card Device' }
  return {
    version: versionR.toString() + '.' + versionL.toString(),
    type: typeList[type],
    birthday: '',
    userId: userId.toString(16).toUpperCase(),
    hardwareId: hardwareIdR.toString(16).toUpperCase() + hardwareIdL.toString(16).toUpperCase(),
    productId: productId.toString(16).toUpperCase(),
    isMother: motherTypeList[isMother],
    devType: devTypeList[devType],
  }
}

function structToByteArray(struct) {
  var i = 0
  var buffer = struct.ref()
  var byteArray = new ptrByte(buffer.length)
  for (i = 0; i < buffer.length; i++) {
    byteArray[i] = buffer[i]
  }
  return byteArray
}

function getByteFromByteArray(buffer) {
  var i = 0
  var str = ''
  var s = ''
  for (i = 0; i < buffer.length; i++) {
    s = buffer[i].toString(16).toUpperCase()
    if (s.length === 1) {
      //转成16进制后补零
      s = '0' + s
    }
    str = str + s
  }
  return str
}

function getByteArrayFromString(str, flag) {
  var i = 0
  var len
  var byte = stringToByte(str)
  if (flag === undefined) {
    len = byte.length
  } else {
    len = byte.length + 1
  }
  var byteArray = new ptrByte(len)
  byteArray[len - 1] = 0
  for (i = 0; i < len; i++) {
    byteArray[i] = byte[i]
  }
  return byteArray
}

function getByteArrayFromBytes(bytes) {
  var byteArray = new ptrByte(bytes.length)
  for (var i = 0; i < bytes.length; i++) {
    byteArray[i] = bytes[i]
  }
  return byteArray
}

function getFileAttr(fileType, fileAttr) {
  var dataAttr = new dataFileAttr(1)
  if (fileType === 1) {
    dataAttr.m_Size = fileAttr.size
    dataAttr.m_Read_Priv = fileAttr.readPriv
    dataAttr.m_Write_Priv = fileAttr.writePriv
    return dataAttr
  }
}

var RockeyArm = /** @class */ (function () {
  //-class start
  var ret = 0
  function RockeyArm() {
    console.log(__dirname)
    this.productId = 'FFFFFFFF'
    this.handle = 0
    this.result = 0
    this.handle = null
    this.libRockey = new ffi_Library.Library('./dongle.dll', rockeyInterface)
  }

  RockeyArm.prototype.Enum = function () {
    var piCount = new ptrInt(1)
    ret = this.libRockey.Dongle_Enum(null, piCount)
    if (ret !== 0 || piCount[0] < 1) {
      return genResult(ret, 'failed', 'Found 0 ROCKEY-ARM dongle.', null)
    }

    var DongleList = new ptrDongleInfo(piCount[0])
    ret = this.libRockey.Dongle_Enum(DongleList, piCount)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Found 0 ROCKEY-ARM dongle.', null)
    }
    var i
    var list = []
    var item
    for (i = 0; i < piCount[0]; i++) {
      item = genDongleInfoItem(
        DongleList[i].m_VerL,
        DongleList[i].m_VerR,
        DongleList[i].m_Type,
        DongleList[i].m_UserID,
        DongleList[i].m_HIDL,
        DongleList[i].m_HIDR,
        DongleList[i].m_PID,
        DongleList[i].m_IsMother,
        DongleList[i].m_DevType
      )
      list.push(JSON.stringify(item))
    }
    return genResult(ret, 'success', 'Enum ROCKEY-ARM.', list)
  }

  RockeyArm.prototype.Open = function (index) {
    var pHandle = new ptrHandle(1)
    ret = this.libRockey.Dongle_Open(pHandle, index)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Open ROCKEY-ARM dongle.', null)
    }
    this.handle = pHandle[0]
    return genResult(ret, 'success', 'Open ROCKEY-ARM dongle.', null)
  }

  RockeyArm.prototype.ResetState = function () {
    ret = this.libRockey.Dongle_ResetState(this.handle)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Reset state.', null)
    }
    return genResult(ret, 'success', 'Reset state.', null)
  }

  RockeyArm.prototype.Close = function () {
    ret = this.libRockey.Dongle_Close(this.handle)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Close ROCKEY-ARM dongle.', null)
    }
    this.handle = null
    return genResult(ret, 'success', 'Close ROCKEY-ARM', null)
  }

  RockeyArm.prototype.GenRandom = function (len) {
    var buffer = new ptrByte(len)
    ret = this.libRockey.Dongle_GenRandom(this.handle, len, buffer)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Generate random.', null)
    }
    return genResult(ret, 'success', 'Generate random', { random: getByteFromByteArray(buffer) })
  }

  RockeyArm.prototype.LEDControl = function (flag) {
    ret = this.libRockey.Dongle_LEDControl(this.handle, flag)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Control LED', null)
    }
    return genResult(ret, 'success', 'Control LED', null)
  }

  RockeyArm.prototype.SwitchProtocol = function (flag) {
    ret = this.libRockey.Dongle_SwitchProtocol(this.handle, flag)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Switch device transmit protocol', null)
    }
    return genResult(ret, 'success', 'Switch device transmit protocol', null)
  }

  RockeyArm.prototype.RFS = function () {
    ret = this.libRockey.Dongle_RFS(this.handle)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Restore factory setting', null)
    }
    return genResult(ret, 'success', 'Restore factory setting', null)
  }

  RockeyArm.prototype.CreateFile = function (fileType, fileId, fileAttr) {
    var attr = getFileAttr(fileType, fileAttr)
    var bufAttr = structToByteArray(attr)
    ret = this.libRockey.Dongle_CreateFile(this.handle, fileType, fileId, bufAttr)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Create file.', null)
    }
    return genResult(ret, 'success', 'Create file', null)
  }

  RockeyArm.prototype.WriteFile = function (fileType, fileId, offset, inData, dataLen) {
    var buffer = getByteArrayFromString(inData)
    ret = this.libRockey.Dongle_WriteFile(this.handle, fileType, fileId, offset, buffer, dataLen)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Write file.', null)
    }
    return genResult(ret, 'success', 'Write file', null)
  }

  RockeyArm.prototype.ReadFile = function (fileId, offset, dataLen) {
    var buffer = new ptrByte(dataLen)
    ret = this.libRockey.Dongle_ReadFile(this.handle, fileId, offset, buffer, dataLen)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Read file.', null)
    }
    return genResult(ret, 'success', 'Read file', {data: buffer})
  }

  RockeyArm.prototype.DownloadExeFile = function () {}

  RockeyArm.prototype.RunExeFile = function (fileId, inBuffer, inOutLen) {
    var temp = inBuffer
    if (inOutLen * 2 > inBuffer.length) {
      for (var i = inBuffer.length; i < inOutLen * 2; i++) {
        temp = temp + '0'
      }
    }
    var buffer = getByteArrayFromString(temp)
    var mainRet = new ptrInt(1)
    ret = this.libRockey.Dongle_RunExeFile(this.handle, fileId, buffer, inOutLen, mainRet)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Run execute file.', null)
    }
    return genResult(ret, 'success', 'Run execute file', {
      retCode: mainRet[0],
      outBuffer: getByteFromByteArray(buffer),
    })
  }

  RockeyArm.prototype.DeleteFile = function (fileType, fileId) {
    var ret = this.libRockey.Dongle_DeleteFile(this.handle, fileType, fileId)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Delete file.', null)
    }
    return genResult(ret, 'success', 'Delete file', null)
  }

  RockeyArm.prototype.ListFile = function (fileType, len) {
    //var dataFileListSize = 12
    var dataLen = new ptrInt(1)
    dataLen[0] = 1 //小于等于0回报参数错误
    if (len === undefined) {
      ret = this.libRockey.Dongle_ListFile(this.handle, fileType, null, dataLen)
      if (ret !== 0) {
        return genResult(ret, 'failed', 'Enum file.', null)
      }
      return genResult(ret, 'success', 'Enum file', { dataLen: dataLen[0] })
    }
    dataLen[0] = len
    //var dataList = new ptrDataFileList(1)
    var dataList = new ptrByte(len)
    ret = this.libRockey.Dongle_ListFile(this.handle, fileType, dataList, dataLen)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Enum file.', null)
    }
    return genResult(ret, 'success', 'Enum file', { dataLen: getByteFromByteArray(dataList) }) //这个地方应该解析一下返回的结构体成json
  }

  RockeyArm.prototype.GenUniqueKey = function (seedLen, seed) {
    var byteSeed = getByteArrayFromBytes(seed)
    var bytePid = new ptrByte(8)
    var byteAdminPin = new ptrByte(16)
    ret = this.libRockey.Dongle_GenUniqueKey(this.handle, seedLen, byteSeed, bytePid, byteAdminPin)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Generate unique key.', null)
    }
    return genResult(ret, 'success', 'Generate unique key', {
      productId: bytesToString(bytePid.buffer),
      adminPIN: bytesToString(byteAdminPin.buffer),
    })
  }

  RockeyArm.prototype.VerifyPIN = function (flag, Pin) {
    var arrayPin = getByteArrayFromString(Pin, 'endmark')
    var remainCount = new ptrInt(1)
    ret = this.libRockey.Dongle_VerifyPIN(this.handle, flag, arrayPin, remainCount)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Verify PIN.', { retryTimes: remainCount[0] })
    }
    return genResult(ret, 'success', 'Verify PIN.', { retryTimes: remainCount[0] })
  }

  RockeyArm.prototype.ChangePIN = function (flag, oldPin, newPin, tryCount) {
    var byteOldPin = getByteArrayFromString(oldPin, 'endmark')
    var byteNewPin = getByteArrayFromString(newPin, 'endmark')
    ret = this.libRockey.Dongle_ChangePIN(this.handle, byteOldPin, byteNewPin, tryCount)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Change PIN.', null)
    }
    return genResult(ret, 'success', 'Change PIN.', null)
  }

  RockeyArm.prototype.ResetUserPIN = function (adminPin) {
    var byteAdminPin = getByteArrayFromString(adminPin, 'endmark')
    ret = this.libRockey.Dongle_ResetUserPIN(this.handle, byteAdminPin)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Reset user PIN.', null)
    }
    return genResult(ret, 'success', 'Reset user PIN.', null)
  }

  RockeyArm.prototype.SetUserID = function (userId) {
    ret = this.libRockey.Dongle_SetUserID(userId)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Set user ID.', null)
    }
    return genResult(ret, 'success', 'Set user ID.', null)
  }

  RockeyArm.prototype.GetDeadline = function () {
    var intTime = new ptrUint(1)
    ret = this.libRockey.Dongle_GetDeadline(this.handle, intTime)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Get deadline.', null)
    }
    var strType = ''
    var strTime = ''
    if (intTime[0] === 0xffffffff) {
      strType = 'NoLimit'
    } else if ((intTime[0] & 0xffff0000) === 0) {
      strType = 'RemainHour'
      strTime = intTime[0].toString(10)
    } else {
      strType = 'ExpirationDate'
      var date = new Date(intTime[0] * 1000)
      strTime = date.toUTCString()
    }
    return genResult(ret, 'success', 'Get deadline.', { type: strType, deadline: strTime, rawTimestamp: intTime[0] })
  }

  RockeyArm.prototype.SetDeadline = function (deadline) {
    var intTime
    if (deadline.type === 'hours') {
      intTime = deadline.time
    } else if (deadline.type === 'timestamp') {
      intTime = deadline.time / 1000
    } else if (deadline.type === 'nolimit') {
      intTime = 0
    }
    ret = this.libRockey.Dongle_SetDeadline(this.handle, intTime)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Get deadline.', null)
    }
    return genResult(ret, 'success', 'Get deadline.', null)
  }

  RockeyArm.prototype.GetUTCTime = function () {
    var intTime = new ptrUint(1)
    ret = this.libRockey.Dongle_GetUTCTime(this.handle, intTime)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Get UTC time in dongle.', null)
    }
    var date = new Date(intTime[0] * 1000)
    var strTime = date.toUTCString()
    return genResult(ret, 'success', 'Get UTC time in dongle.', { utctime: strTime })
  }

  RockeyArm.prototype.ReadData = function (offset, dataLen) {
    var buffer = new ptrByte(dataLen)
    ret = this.libRockey.Dongle_ReadData(this.handle, offset, buffer, dataLen)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Read data zone.', null)
    }
    return genResult(ret, 'success', 'Read data zone.', { data: getByteFromByteArray(buffer) })
  }

  RockeyArm.prototype.WriteData = function (offset, data, dataLen) {
    var byteBuffer = getByteArrayFromBytes(hexToBytes(data))
    ret = this.libRockey.Dongle_WriteData(this.handle, offset, byteBuffer, dataLen)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Write data zone.', null)
    }
    return genResult(ret, 'success', 'Write data zone.', null)
  }

  RockeyArm.prototype.ReadShareMemory = function () {
    var buffer = new ptrByte(32)
    ret = this.libRockey.Dongle_ReadShareMemory(this.handle, buffer)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Read share memory.', null)
    }
    return genResult(ret, 'success', 'Read share memory.', { data: getByteFromByteArray(buffer) })
  }

  RockeyArm.prototype.WriteShareMemory = function (data) {
    var byteBuffer = getByteArrayFromBytes(hexToBytes(data))
    ret = this.libRockey.Dongle_WriteShareMemory(this.handle, byteBuffer, 32) //写入数据长度必须固定32，文档中说小于32，其实只能等于32
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Write share memory.', null)
    }
    return genResult(ret, 'success', 'Write share memory.', null)
  }

  RockeyArm.prototype.RsaGenPubPriKey = function (priFileId) {
    var byteRsaPubKey = new ptrByte(264)
    var byteRsaPriKey = new ptrByte(520)
    ret = this.libRockey.Dongle_RsaGenPubPriKey(this.handle, priFileId, byteRsaPubKey, byteRsaPriKey)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Generate RSA key pairs.', null)
    }
    return genResult(ret, 'success', 'Generate RSA key pairs.', {
      publicKey: getByteFromByteArray(byteRsaPubKey),
      privateKey: getByteFromByteArray(byteRsaPriKey),
    })
  }

  RockeyArm.prototype.RsaPri = function (priFileId, flag, inData, inDataLen) {
    var byteInData = getByteArrayFromBytes(hexToBytes(inData))
    var byteOutData = new ptrByte(256)
    var ptrIntOutDataLen = new ptrInt(1)
    ptrIntOutDataLen[0] = 256
    ret = this.libRockey.Dongle_RsaPri(
      this.handle,
      priFileId,
      flag,
      byteInData,
      inDataLen,
      byteOutData,
      ptrIntOutDataLen
    )
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Calculate RSA private key.', null)
    }
    return genResult(ret, 'success', 'Calculate RSA private key.', {
      result: getByteFromByteArray(byteOutData),
      len: ptrIntOutDataLen[0],
    })
  }

  RockeyArm.prototype.RsaPub = function (flag, pubKey, inData, inDataLen) {
    var byteInData = getByteArrayFromBytes(hexToBytes(inData))
    var bytePubKey = getByteArrayFromBytes(hexToBytes(pubKey))
    var byteOutData = new ptrByte(256)
    var ptrIntOutDataLen = new ptrInt(1)
    ptrIntOutDataLen[0] = 256
    ret = this.libRockey.Dongle_RsaPub(
      this.handle,
      flag,
      bytePubKey,
      byteInData,
      inDataLen,
      byteOutData,
      ptrIntOutDataLen
    )
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Calculate RSA public key.', null)
    }
    return genResult(ret, 'success', 'Calculate RSA public key.', {
      result: getByteFromByteArray(byteOutData),
      len: ptrIntOutDataLen[0],
    })
  }

  RockeyArm.prototype.EccGenPubPriKey = function (priFileId) {
    var byteEccPubKey = new ptrByte(68)
    var byteEccPriKey = new ptrByte(36)
    ret = this.libRockey.Dongle_EccGenPubPriKey(this.handle, priFileId, byteEccPubKey, byteEccPriKey)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Generate ECC key pairs.', null)
    }
    return genResult(ret, 'success', 'Generate ECC key pairs.', {
      publicKey: getByteFromByteArray(byteEccPubKey),
      privateKey: getByteFromByteArray(byteEccPriKey),
    })
  }

  RockeyArm.prototype.EccSign = function (priFileId, hashData, hashDataLen) {
    var byteHashData = getByteArrayFromBytes(hexToBytes(hashData))
    var byteOutData = new ptrByte(64)
    ret = this.libRockey.Dongle_EccSign(this.handle, priFileId, byteHashData, hashDataLen, byteOutData)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'ECC sign.', null)
    }
    return genResult(ret, 'success', 'ECC sign.', { signature: getByteFromByteArray(byteOutData) })
  }

  RockeyArm.prototype.EccVerify = function (pubKey, hashData, hashDataLen, sign) {
    var bytePubKey = getByteArrayFromBytes(hexToBytes(pubKey))
    var byteHashData = getByteArrayFromBytes(hexToBytes(hashData))
    var byteSign = getByteArrayFromBytes(hexToBytes(sign))
    ret = this.libRockey.Dongle_EccVerify(this.handle, bytePubKey, byteHashData, hashDataLen, byteSign)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Verify ECC signature.', null)
    }
    return genResult(ret, 'success', 'Verify ECC signature.', null)
  }

  RockeyArm.prototype.SM2GenPubPriKey = function (priFileId) {
    var byteEccPubKey = new ptrByte(68)
    var byteEccPriKey = new ptrByte(36)
    ret = this.libRockey.Dongle_SM2GenPubPriKey(this.handle, priFileId, byteEccPubKey, byteEccPriKey)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Generate Chinese Guomi SM2 key pairs.', null)
    }
    return genResult(ret, 'success', 'Generate Chinese Guomi SM2 key pairs.', {
      publicKey: getByteFromByteArray(byteEccPubKey),
      privateKey: getByteFromByteArray(byteEccPriKey),
    })
  }

  RockeyArm.prototype.SM2Sign = function (priFileId, hashData, hashDataLen) {
    var byteHashData = getByteArrayFromBytes(hexToBytes(hashData))
    var byteOutData = new ptrByte(64)
    ret = this.libRockey.Dongle_SM2Sign(this.handle, priFileId, byteHashData, hashDataLen, byteOutData)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'SM2 sign.', null)
    }
    return genResult(ret, 'success', 'SM2 sign.', { signature: getByteFromByteArray(byteOutData) })
  }

  RockeyArm.prototype.SM2Verify = function (pubKey, hashData, hashDataLen, sign) {
    var bytePubKey = getByteArrayFromBytes(hexToBytes(pubKey))
    var byteHashData = getByteArrayFromBytes(hexToBytes(hashData))
    var byteSign = getByteArrayFromBytes(hexToBytes(sign))
    ret = this.libRockey.Dongle_SM2Verify(this.handle, bytePubKey, byteHashData, hashDataLen, byteSign)
    if (ret !== 0) {
      return genResult(ret, 'failed', 'Verify SM2 signature.', null)
    }
    return genResult(ret, 'success', 'Verify SM2 signature.', null)
  }

  RockeyArm.prototype.TDES = function (keyFileId, flag, inData, dataLen) {
    var byteInData = getByteArrayFromBytes(hexToBytes(inData))
    var byteOutData = new ptrByte(dataLen)
    ret = this.libRockey.Dongle_TDES(this.handle, keyFileId, flag, byteInData, byteOutData, dataLen)
    if (ret != 0) {
      return genResult(ret, 'failed', 'Calculate Triple DES.', null)
    }
    return genResult(ret, 'success', 'Calculate Triple DES.', { result: getByteFromByteArray(byteOutData) })
  }

  RockeyArm.prototype.SM4 = function (keyFileId, flag, inData, dataLen) {
    var byteInData = getByteArrayFromBytes(hexToBytes(inData))
    var byteOutData = new ptrByte(dataLen)
    ret = this.libRockey.Dongle_SM4(this.handle, keyFileId, flag, byteInData, byteOutData, dataLen)
    if (ret != 0) {
      return genResult(ret, 'failed', 'Calculate SM4.', null)
    }
    return genResult(ret, 'success', 'Calculate SM4.', { result: getByteFromByteArray(byteOutData) })
  }

  RockeyArm.prototype.HASH = function (flag, inData, dataLen) {
    var byteInData = getByteArrayFromBytes(hexToBytes(inData))
    var len = 0
    if (flag === 0) {
      len = 16
    } else if (flag === 1) {
      len = 20
    } else {
      len = 32
    }
    var byteHashData = new ptrByte(len)
    ret = this.libRockey.Dongle_HASH(this.handle, flag, byteInData, dataLen, byteHashData)
    if (ret != 0) {
      return genResult(ret, 'failed', 'Calculate hash.', null)
    }
    return genResult(ret, 'success', 'Calculate hash.', { result: getByteFromByteArray(byteHashData) })
  }

  RockeyArm.prototype.Seed = function (seed, seedLen) {
    var byteSeed = getByteArrayFromBytes(hexToBytes(seed))
    var byteOutData = new ptrByte(16)
    ret = this.libRockey.Dongle_Seed(this.handle, byteSeed, seedLen, byteOutData)
    if (ret != 0) {
      return genResult(ret, 'failed', 'Calculate seed.', null)
    }
    return genResult(ret, 'success', 'Calculate seed.', { result: getByteFromByteArray(byteOutData) })
  }

  RockeyArm.prototype.LimitSeedCount = function (count) {
    ret = this.libRockey.Dongle_LimitSeedCount(this.handle, count)
    if (ret != 0) {
      return genResult(ret, 'failed', 'Set seed limit count', null)
    }
    return genResult(ret, 'success', 'Set seed limit count', null)
  }

  RockeyArm.prototype.GenMotherKey = function (motherData) {}

  RockeyArm.prototype.RequestInit = function () {}

  RockeyArm.prototype.GetInitDataFromMother = function (request, dataLen) {}

  RockeyArm.prototype.InitSon = function (initData, dataLen) {}

  RockeyArm.prototype.SetUpdatePriKey = function (priKey) {}

  RockeyArm.prototype.MakeUpdatePacket = function (inData) {}

  RockeyArm.prototype.MakeUpdatePacketFromMother = function (inData) {}

  RockeyArm.prototype.Update = function (updateData, dataLen) {}

  return RockeyArm
})() //-class end

// [0x31,0x32,0x33,0x34,0x35,0x36]转'313233343536'
function byteToHexString(arr) {
  if (typeof arr === 'string') {
    return arr
  }
  var str = '',
    _arr = arr
  for (var i = 0; i < _arr.length; i++) {
    var one = _arr[i].toString(2),
      v = one.match(/^1+?(?=0)/)
    if (v && one.length == 8) {
      var bytesLength = v[0].length
      var store = _arr[i].toString(2).slice(7 - bytesLength)
      for (var st = 1; st < bytesLength; st++) {
        store += _arr[st + i].toString(2).slice(2)
      }
      str += String.fromCharCode(parseInt(store, 2))
      i += bytesLength - 1
    } else {
      str += String.fromCharCode(_arr[i])
    }
  }
  return str
}

function stringToByte(str) {
  var bytes = new Array()
  var len, c
  len = str.length
  for (var i = 0; i < len; i++) {
    c = str.charCodeAt(i)
    if (c >= 0x010000 && c <= 0x10ffff) {
      bytes.push(((c >> 18) & 0x07) | 0xf0)
      bytes.push(((c >> 12) & 0x3f) | 0x80)
      bytes.push(((c >> 6) & 0x3f) | 0x80)
      bytes.push((c & 0x3f) | 0x80)
    } else if (c >= 0x000800 && c <= 0x00ffff) {
      bytes.push(((c >> 12) & 0x0f) | 0xe0)
      bytes.push(((c >> 6) & 0x3f) | 0x80)
      bytes.push((c & 0x3f) | 0x80)
    } else if (c >= 0x000080 && c <= 0x0007ff) {
      bytes.push(((c >> 6) & 0x1f) | 0xc0)
      bytes.push((c & 0x3f) | 0x80)
    } else {
      bytes.push(c & 0xff)
    }
  }
  return bytes
}

//string表示的16进制转换为byte数组
//'313233343536'转为[0x31,0x32,0x33,0x34,0x35,0x36]
function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16))
  return bytes
}

//字符串转换成对应的用string表示的16进制
//'123456'转为'313233343536'
function stringToHex(str) {
  return str
    .split('')
    .map(function (c) {
      return ('0' + c.charCodeAt(0).toString(16)).slice(-2)
    })
    .join('')
}

//字符串表示的16进制string转换成字节数组
//'123456'转换为[0x31,0x32,0x33,0x34,0x35,0x36]
function hexStringToBytes(hex) {
  var str = stringToHex(hex)
  return hexToBytes(str)
}

function bytesToHex(bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16))
    hex.push((bytes[i] & 0xf).toString(16))
  }
  return hex.join('')
}

function hexToString(hexStr) {
  var hex = hexStr.toString() //force conversion
  var str = ''
  for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
  return str
}

//[49,50,51,52,53,54]转为'123456'
function bytesToString(bytes) {
  var hex = bytesToHex(bytes)
  return hexToString(hex)
}

// '01020304' 转为 [0x30,0x31,x030,0x32,0x30,0x33,0x30,0x34]
function stringToBytes(str) {
  return hexToBytes(stringToHex(str))
}

//define ROCKEY-ARM sturcts

var dongleInfo = StructType({
  m_VerL: ref.types.uchar,
  m_VerR: ref.types.uchar,
  m_Type: ref.types.ushort,
  m_BirthdayL: ref.types.uint32, //c里定义的是一个8字节数组，本来用一个uint64就可以了，但是没找到如何解决在js里按字节对齐的问题，所以把所有的8字节结构拆成左右两个4字节结构
  m_BirthdayR: ref.types.uint32,
  m_Agent: ref.types.uint32,
  m_PID: ref.types.uint32,
  m_UserID: ref.types.uint32,
  m_HIDL: ref.types.uint32,
  m_HIDR: ref.types.uint32,
  m_IsMother: ref.types.uint32,
  m_DevType: ref.types.uint32,
})

var dataFileAttr = StructType({
  m_Size: ref.types.uint32,
  m_Read_Priv: ref.types.ushort,
  m_Write_Priv: ref.types.ushort,
})

var dataFileList = StructType({
  m_FileId: ref.types.ushort,
  m_Reserve: ref.types.ushort,
  m_Size: ref.types.uint32,
  m_Read_Priv: ref.types.ushort,
  m_Write_Priv: ref.types.ushort,
})

var ptrInt = refArray(ref.types.int)
var ryHandle = refArray(ref.types.uint) //ROCKEY的句柄是void*，但是ref-array-napi不能创建void类型的数组
var ptrHandle = refArray(ryHandle) //如果是32位系统，句柄用uint应该也是ok的。
var ptrDongleInfo = refArray(dongleInfo)
var ptrByte = refArray(ref.types.uchar)
var ptrUint = refArray(ref.types.uint)
var ptrDataFileList = refArray(dataFileList)

const rockeyInterface = {
  Dongle_Enum: ['int', [ptrDongleInfo, ptrInt]],
  Dongle_Open: ['int', [ptrHandle, 'int']],
  Dongle_ResetState: ['int', [ryHandle]],
  Dongle_Close: ['int', [ryHandle]],
  Dongle_GenRandom: ['int', [ryHandle, 'int', ptrByte]],
  Dongle_LEDControl: ['int', [ryHandle, 'int']],
  Dongle_SwitchProtocol: ['int', [ryHandle, 'int']],
  Dongle_RFS: ['int', [ryHandle]],
  Dongle_CreateFile: ['int', [ryHandle, 'int', 'ushort', ptrByte]],
  Dongle_WriteFile: ['int', [ryHandle, 'int', 'ushort', 'ushort', ptrByte, 'int']],
  Dongle_ReadFile: ['int', [ryHandle, 'ushort', 'ushort', ptrByte, 'int']],
  Dongle_DownloadExeFile: ['int', [ryHandle, ptrByte, 'int']],
  Dongle_RunExeFile: ['int', [ryHandle, 'ushort', ptrByte, 'ushort', ptrInt]],
  Dongle_DeleteFile: ['int', [ryHandle, 'int', 'ushort']],
  Dongle_ListFile: ['int', [ryHandle, 'int', ptrByte, ptrInt]],
  Dongle_GenUniqueKey: ['int', [ryHandle, 'int', ptrByte, ptrByte, ptrByte]],
  Dongle_VerifyPIN: ['int', [ryHandle, 'int', ptrByte, ptrInt]],
  Dongle_ChangePIN: ['int', [ryHandle, 'int', ptrByte, ptrByte, 'int']],
  Dongle_ResetUserPIN: ['int', [ryHandle, ptrByte]],
  Dongle_SetUserID: ['int', [ryHandle, 'uint32']],
  Dongle_GetDeadline: ['int', [ryHandle, ptrUint]],
  Dongle_SetDeadline: ['int', [ryHandle, 'uint32']],
  Dongle_GetUTCTime: ['int', [ryHandle, ptrUint]],
  Dongle_ReadData: ['int', [ryHandle, 'int', ptrByte, 'int']],
  Dongle_WriteData: ['int', [ryHandle, 'int', ptrByte, 'int']],
  Dongle_ReadShareMemory: ['int', [ryHandle, ptrByte]],
  Dongle_WriteShareMemory: ['int', [ryHandle, ptrByte, 'int']],
  Dongle_RsaGenPubPriKey: ['int', [ryHandle, 'ushort', ptrByte, ptrByte]],
  Dongle_RsaPri: ['int', [ryHandle, 'ushort', 'int', ptrByte, 'int', ptrByte, ptrInt]],
  Dongle_RsaPub: ['int', [ryHandle, 'int', ptrByte, ptrByte, 'int', ptrByte, ptrInt]],
  Dongle_EccGenPubPriKey: ['int', [ryHandle, 'ushort', ptrByte, ptrByte]],
  Dongle_EccSign: ['int', [ryHandle, 'ushort', ptrByte, 'int', ptrByte]],
  Dongle_EccVerify: ['int', [ryHandle, ptrByte, ptrByte, 'int', ptrByte]],
  Dongle_SM2GenPubPriKey: ['int', [ryHandle, 'ushort', ptrByte, ptrByte]],
  Dongle_SM2Sign: ['int', [ryHandle, 'ushort', ptrByte, 'int', ptrByte]],
  Dongle_SM2Verify: ['int', [ryHandle, ptrByte, ptrByte, 'int', ptrByte]],
  Dongle_TDES: ['int', [ryHandle, 'ushort', 'int', ptrByte, ptrByte, 'int']],
  Dongle_SM4: ['int', [ryHandle, 'ushort', 'int', ptrByte, ptrByte, 'int']],
  Dongle_HASH: ['int', [ryHandle, 'int', ptrByte, 'int', ptrByte]],
  Dongle_Seed: ['int', [ryHandle, ptrByte, 'int', ptrByte]],
  Dongle_LimitSeedCount: ['int', [ryHandle, 'int']],
  Dongle_GenMotherKey: ['int', [ryHandle, ptrByte]],
  Dongle_RequestInit: ['int', [ryHandle, ptrByte]],
  Dongle_GetInitDataFromMother: ['int', [ryHandle, ptrByte, ptrByte, ptrInt]],
  Dongle_InitSon: ['int', [ryHandle, ptrByte, 'int']],
  Dongle_SetUpdatePriKey: ['int', [ryHandle, ptrByte]],
  Dongle_MakeUpdatePacket: [
    'int',
    [ryHandle, ptrByte, 'int', 'int', 'ushort', 'int', ptrByte, 'int', ptrByte, ptrByte, ptrInt],
  ],
  Dongle_MakeUpdatePacketFromMother: [
    'int',
    [ryHandle, ptrByte, 'int', 'int', 'ushort', 'int', ptrByte, 'int', ptrByte, ptrInt],
  ],
  Dongle_Update: ['int', [ryHandle, ptrByte, 'int']],
}

module.exports = RockeyArm
