console.clear()

require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('./public'))
app.use(cookieParser())
app.set('views', './src/views')
app.set('view engine', 'ejs')

// Rotas do Site
app.use('/', require('./src/routes/site'))

// Rotas do App
app.use('/app', require('./src/routes/app'))

// Erros 404 e 500
app.use(require('./src/middlewares/site/error-404'))
app.use(require('./src/middlewares/site/error-500'))

const { PORT = 3000 } = process.env

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
