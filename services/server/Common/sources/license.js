const constants = require("./constants")

const buildDate = "6/29/2016"
const oBuildDate = new Date(buildDate)

exports.readLicense = async () => {
  const c_LR = constants.LICENSE_RESULT
  const now = new Date()
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)) //first day of current month
  return [
    {
      count: 1,
      type: c_LR.Success,
      packageType: constants.PACKAGE_TYPE_OS,
      mode: constants.LICENSE_MODE.None,
      branding: false,
      connections: constants.LICENSE_CONNECTIONS,
      connectionsView: constants.LICENSE_CONNECTIONS,
      customization: false,
      advancedApi: false,
      usersCount: 0,
      usersViewCount: 0,
      usersExpire: constants.LICENSE_EXPIRE_USERS_ONE_DAY,
      hasLicense: false,
      buildDate: oBuildDate,
      startDate,
      endDate: null,
      customerId: "",
      alias: "",
      multitenancy: false,
    },
    null,
  ]
}

exports.packageType = constants.PACKAGE_TYPE_OS
