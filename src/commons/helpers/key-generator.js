const openssl = require('openssl-nodejs')
const ObjectID = require('bson-objectid')
const secretKey = require('secret-key')

function generateRandomOpensslBase64 () {
  return new Promise((resolve, reject) => {
    const length = process.env.OPENSSL_BASE64_LENGTH || 8

    openssl(`openssl rand -base64 ${length}`, (err, buffer) => {
      const errorMessage = err.toString().trim()
      if (errorMessage) return reject(errorMessage)

      const password = buffer.toString().trim()
      return resolve(password)
    })
  })
}

function generateRandomObjectID () {
  return String(ObjectID())
}

async function generateRandomSecret (key = null) {
  if (!key) key = await generateRandomOpensslBase64()

  const oauth2Key = process.env.AUTH_OAUTH2_KEY || '76BPxScXkHiVIsaqN0fSASpiOzriQgzKJQKmAG3peF0='

  return secretKey.create(oauth2Key, key).secret
}

module.exports = {
  generateRandomObjectID,
  generateRandomSecret
}
