console.clear()

require('dotenv').config()

const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const path = require('path')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.resolve(__dirname, './public')))
app.use(cookieParser())

app.set('views', path.resolve(__dirname, './src/commons/views'))
app.set('view engine', 'ejs')

app.use('/', expressLayouts)
app.set('layout', 'site/layout', 'app/layout')

// Projeto API
app.use('/api', require('./src/api'))

// Projeto App
app.use('/app', require('./src/app'))

// Projeto Site
app.use('/', require('./src/site'))

const { PORT = 3000 } = process.env

app.listen(PORT, async () => {
  console.log(`Servidor rodando no host http://localhost:${PORT}/`)
})
