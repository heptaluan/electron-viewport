
const RockeyArm = require('./RockeyArm')

const initDongle = () => {
  const dongle = new RockeyArm('./dongle.dll')
  const ret = dongle.Enum()
  console.log(ret)
}

module.exports = initDongle