import express from 'express'
import mongoose from 'mongoose'
import eventRouter from './routes/eventRouter'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())
app.use('/event', eventRouter)
const port = 3000

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

mongoose
  .connect(
    'mongodb+srv://rostislav7333:Ul6DHYsqX0ewkSkP@clusterfortest.z0ufh3m.mongodb.net/?retryWrites=true&w=majority'
  )
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err))
