import express from 'express'
import mongoose from 'mongoose'
import eventRouter from './routes/eventRouter'
import cors from 'cors'
import { DbUrl, Port } from './config/appConfing'

const app = express()
app.use(express.json())
app.use(cors())
app.use('/event', eventRouter)

app
  .listen(Port, () => {
    console.log(`Server running on port ${Port}`)
  })
  .on('error', (err) => {
    console.log(err)
  })
mongoose
  .connect(DbUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err))
