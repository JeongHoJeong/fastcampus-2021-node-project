// @ts-check

require('dotenv').config()

const app = require('./app')
const { PORT } = require('./common')

app.listen(PORT, () => {
  console.log(`The Express server is listening at port: ${PORT}`)
})
