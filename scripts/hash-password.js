const bcrypt = require('bcryptjs')
const [,, plain] = process.argv
if (!plain) {
  console.error('Usage: node scripts\\hash-password.js <password>')
  process.exit(2)
}
const saltRounds = 10
bcrypt.hash(plain, saltRounds).then(hash => {
  console.log(hash)
}).catch(err => {
  console.error(err)
  process.exit(1)
})
