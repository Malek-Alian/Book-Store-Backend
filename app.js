const express = require('express')
const mongoose = require('mongoose')
const User = require('./models/User')
const { Book } = require('./models/Book')
const Order = require('./models/Order')
const multer = require('multer')
const cors = require("cors")
const fs = require('fs');
const { Documents } = require('./models/Documents')
var bodyParser = require('body-parser')

const corsOptions = {
    origin: "http://localhost:3001",
};

const app = express()
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cors(corsOptions))
app.use(express.json())

const dbURI = 'mongodb+srv://Malek_Alian:Malek-2002@bookstore.a2sgpdf.mongodb.net/BookStore?retryWrites=true&w=majority'
mongoose.connect(dbURI)
    .then(() => console.log('Connected to database'))
    .catch((err) => console.log(err))

app.listen(3000)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(`./DocsData/${req.params.id}`, { recursive: true })
        cb(null, `./DocsData/${req.params.id}`)
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.replace(/\s+/g, '-')
        cb(null, fileName)
    }
})
const upload = multer({ storage }).single('bookImage')
app.post('/upload/:id', upload, (req, res) => {
    console.log('reqfile', req.file);
    if (!req.file) {
        return res.status(400).send({ error: "No file uploaded." });
    }

    const document = new Document({
        path: `./DocsData/${req.params.id}`
    })

    res.send({ file: req.file });
})
app.post('/add-user', (req, res) => {
    const user = new User(req.body)
    user.save()
        .then(result => res.send(result))
        .catch(err => res.send(err))
})
app.get('/books', (req, res) => {
    Book.find()
        .then(result => res.send(result))
        .catch(err => res.send(err))
})
app.post('/books/add-book', (req, res) => {
    const book = new Book(req.body)
    book.save()
        .then(result => res.send(result))
        .catch(err => res.send(err))
})
app.post('/login', (req, res) => {
    User.find({ email: req.body.email })
        .then(result => {
            if (result.length > 0) {
                if (result[0].password === req.body.password) {
                    res.send({ status: true, data: result[0], statusCode: 200 })
                } else {
                    res.send({ status: false, data: {}, statusCode: 400, errorMessage: 'Password does not match' });
                }
            } else {
                res.send({ status: false, data: {}, statusCode: 400, errorMessage: 'User does not exist' });
            }
        })
        .catch(err => console.log(err))
})