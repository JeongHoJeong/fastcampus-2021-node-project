// @ts-check

require('dotenv').config()

const app = require('./app')

const PORT = 5000

app.listen(PORT, () => {
  console.log(`The Express server is listening at port: ${PORT}`)
})
