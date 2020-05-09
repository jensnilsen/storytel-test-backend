import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/storytellchat'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const Message = mongoose.model('Message', {
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  client: {
    type: String,
  },
})

const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(bodyParser.json())

// Start defining your routes here
app.get('/', async (req, res) => {
  const post = await Message.find().sort({ createdAt: 'desc' }).limit(20)
  res.json(post)
})

app.post('/', async (req, res) => {
  const { message, client } = req.body
  const post = new Message({ message, client })

  try {
    const savedPost = await post.save()
    res.status(200).json(savedPost)
  } catch (err) {
    res
      .status(400)
      .json({ message: 'could not save thought', errors: err.errors })
  }
})

app.put('/:id/', async (req, res) => {
  const { message } = req.body
  try {
    const post = await Message.findOneAndUpdate(
      { _id: req.params.id },
      { message }
    )
    res.status(200).json(post)
  } catch (err) {
    res
      .status(400)
      .json({ message: 'could not update post', errors: err.errors })
  }
})

app.delete('/:id/', async (req, res) => {
  try {
    const post = await Message.findOneAndDelete({ _id: req.params.id })
    res.status(200).json(post)
  } catch (err) {
    res
      .status(400)
      .json({ message: 'could not delete post', errors: err.errors })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
