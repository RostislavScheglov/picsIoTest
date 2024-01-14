import express from 'express'
import mongoose from 'mongoose'
import eventRouter from './routes/eventRouter'
import cors from 'cors'
import { DbUrl } from './config/appConfing'

const app = express()
app.use(express.json())
app.use(cors())
app.use('/event', eventRouter)
const port = 3000

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

mongoose
  .connect(DbUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err))
