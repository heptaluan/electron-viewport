
const RockeyArm = require('../RockeyArm')

const initDongle = () => {
  const dongle = new RockeyArm('../dongle.dll')
  let ret = dongle.Enum()
  // console.log('ret Info: ',ret)
  let i = 0
  let item
  let index = null
  let pid = 'E1A43972'
  if(ret.param === null){
    console.log('failed')
    return ret
  }
  for (i=0; i<ret.param.length; i++){
    item = JSON.parse(ret.param[i])
    if(item.productId === pid){
      index = i
      break
    }
  }
  if (index === null){
    console.log('Do not find ROCKEY-ARM Product ID:%s', pid)
  }
  ret = dongle.Open(0)
  // console.log('Open ret:',ret)

  ret = dongle.VerifyPIN(0, 'Jmb1p43%cy2')
  console.log('VerifyPIN ret:',ret)
  const isPinVerified = ret
  // ret = dongle.ReadFile(0x1111, 1, 128)
  // console.log('read public file:', toBuffer(ret.param.data))
  // ret = dongle.ReadFile(0x1111, 1, 128)
  // const publicKey = toBuffer(ret.param.data)
  //
  // console.log('read random ret:', toBuffer(ret.param.data))
  // // console.log(publicKey, privateKey)
  // function toBuffer(bufferString) {
  //   return Buffer.from(bufferString).toString('hex')
  // }
  //
  // ret = dongle.RsaPri(0x1111, 0, '010203040506', 6)
  // console.log('RsaPri ret:', ret)
  // let cipher = ret.param.result
  // let cipherLen = ret.param.len
  //
  // ret = dongle.RsaPub(1, publicKey, cipher, cipherLen)
  // console.log('RsaPub ret:', ret)
  ret = dongle.Close(isPinVerified)
  return ret
}



module.exports = initDongle