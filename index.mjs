import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

import express from 'express'
import { errorHandler } from './error.mjs'
const app = express()

app.get('/', (req, res) => {
  throw Error('error')
})

app.all(/^.*$/, (req, res) => {
  res.status(400).json({ msg: 'route dosen\'t exists' })
})

app.use(errorHandler)

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err)
  }
  console.log(`Server started on port ${process.env.PORT}`)
})