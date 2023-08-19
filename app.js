const express = require('express')
const mongoose = require('mongoose')
const User = require('./models/User')
const { Book } = require('./models/Book')
const Order = require('./models/Order')
const multer = require('multer')
const cors = require("cors")
const fs = require('fs');
const { Documents } = require('./models/Documents')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

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
        if (req.body.folder === 'Profile Picture') {
            fs.mkdirSync(`./DocsData/${req.params.id}/Profile Picture`, { recursive: true })
            cb(null, `./DocsData/${req.params.id}/Profile Picture`)
        } else {
            fs.mkdirSync(`./DocsData/${req.params.id}/Books`, { recursive: true })
            cb(null, `./DocsData/${req.params.id}/Books`)
        }
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.replace(/\s+/g, '-')
        cb(null, fileName)
    }
})
const upload = multer({ storage }).single('bookImage')
app.post('/upload/:id', upload, (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: "No file uploaded." });
    }
    const documents = new Documents({
        path: req.body.folder === 'Profile Picture' ? `./DocsData/${req.params.id}/Profile Picture/${req.file.originalname}` : `./DocsData/${req.params.id}/Books/${req.file.originalname}`,
        userID: req.params.id,
    })
    documents.save()
        .then(result => res.send({ status: 200, success: true, data: result }))
        .catch(err => res.send(err))
})
app.get('/download/:id', (req, res) => {
    Documents.findById(req.params.id)
        .then((result) => result?.path ? res.download(result?.path) : res.send('error'))
        .catch((err) => console.log(err))
})
app.get('/users', (req, res) => {
    User.find()
        .then(result => res.send(result))
        .catch(err => res.send(err))
})
app.post('/add-user', (req, res) => {
    User.find({ email: req.body.email })
        .then(async (result) => {
            if (result.length) {
                res.send({ status: 407, success: false, errorMessage: 'Email already used' })
            } else {
                req.body.password = await bcrypt.hash(req.body.password, 12)
                const user = new User(req.body)
                user.save()
                    .then(result => {
                        const id = result.id
                        const email = result.email
                        const token = jwt.sign({ id, email }, 'jwtSecret', {
                            expiresIn: 3600,
                        })
                        res.send({ status: 200, success: true, data: result, token: token })
                    })
                    .catch(err => res.send(err))
            }
        })
        .catch((err) => console.log(err))
})
app.put('/update-user', (req, res) => {
    User.findByIdAndUpdate(req.body._id, req.body, { new: true })
        .then((result) => res.send(result))
        .catch((err) => console.log(err))
})
app.get('/books', (req, res) => {
    Book.find()
        .then(result => res.send(result))
        .catch(err => res.send(err))
})
app.post('/books-category', (req, res) => {
    Book.find({ category: req.body.category })
        .then(result => res.send(result))
        .catch(err => res.send(err))
})
app.post('/add-book', (req, res) => {
    const book = new Book(req.body)
    book.save()
        .then(result => res.send(result))
        .catch(err => res.send(err))
})
app.put('/update-book', (req, res) => {
    Book.findByIdAndUpdate(req.body._id, req.body)
        .then((result) => res.send(result))
        .catch((err) => console.log(err))
})
app.delete('/delete-book/:id', async (req, res) => {
    const deletedBook = await Book.findByIdAndDelete(req.params.id)
        .then((result) => result)
        .catch((err) => console.log(err))
    Documents.findByIdAndDelete(deletedBook.image)
        .then((result) => {
            fs.unlink(`C:/Users/inspire/Desktop/Book Store${result.path.slice(1)}`, () => { })
            res.send({ status: 200, success: true, data: result })
        })
        .catch((err) => console.log(err))
})
app.delete('/delete-document/:id', (req, res) => {
    Documents.findByIdAndDelete(req.params.id)
        .then((result) => {
            fs.unlink(`C:/Users/inspire/Desktop/Book Store${result.path.slice(1)}`, () => { })
            res.send({ status: 200, success: true, data: result })
        })
        .catch((err) => console.log(err))
})
app.post('/login', (req, res) => {
    User.find({ email: req.body.email })
        .then(async (result) => {
            if (result.length > 0) {
                if (await bcrypt.compare(req.body.password, result[0].password)) {
                    const id = result[0].id
                    const email = result[0].email
                    const token = jwt.sign({ id, email }, 'jwtSecret', {
                        expiresIn: 3600,
                    })
                    res.send({ status: true, data: result[0], statusCode: 200, token: token })
                } else {
                    res.send({ status: false, data: {}, statusCode: 400, errorMessage: 'Password does not match' });
                }
            } else {
                res.send({ status: false, data: {}, statusCode: 400, errorMessage: 'User does not exist' });
            }
        })
        .catch(err => console.log(err))
})
app.post('/sign-out', (req, res) => {
    const id = req.body.id
    const email = req.body.email
    const token = jwt.sign({ id, email }, 'jwtSecret', {
        expiresIn: 1,
    })
    res.send({ status: 200, success: true, token: token })
})
const verifyJWT = (req, res, next) => {
    const token = req.body.token
    if (token) {
        jwt.verify(token, 'jwtSecret', (err, decoded) => {
            if (!err) {
                req.user = decoded
                next()
            } else {
                res.send({ status: 409, success: false, errorMessage: 'Your session has been expired' })
            }
        })
    } else {
        res.send({ status: 408, success: false, errorMessage: 'You are not logged in' })
    }
}
app.post('/checkUser', verifyJWT, (req, res) => {
    User.findById(req.user.id)
        .then(result => res.send({ status: 200, success: true, data: result }))
        .catch(err => res.send(err))
})
app.post('/make-order', (req, res) => {
    const order = new Order(req.body)
    order.save()
        .then((result) => res.send({ status: 200, success: true, data: result }))
        .catch((err) => console.log(err))
})
app.put('/update-order', (req, res) => {
    Order.findByIdAndUpdate(req.body._id, req.body, { new: true })
        .then((result) => res.send({ status: 200, success: true, data: result }))
        .catch((err) => console.log(err))
})
app.get('/get-orders', (req, res) => {
    Order.find()
        .populate(['createdBy', 'books'])
        .then((result) => res.send({ status: 200, success: true, data: result }))
        .catch((err) => console.log(err))
})
app.get('/number-of-users', (req, res) => {
    User.countDocuments()
        .then((result) => res.send({ data: result }))
        .catch((err) => console.log(err))
})
app.get('/number-of-orders', (req, res) => {
    Order.countDocuments()
        .then((result) => res.send({ data: result }))
        .catch((err) => console.log(err))
})
app.get('/number-of-books', (req, res) => {
    Book.countDocuments()
        .then((result) => res.send({ data: result }))
        .catch((err) => console.log(err))
})
app.get('/get-income', (req, res) => {
    Order.find({ status: 'Accepted' })
        .then((result) => {
            let income = result.reduce((sum, item) => sum + item.totalPrice, 0)
            res.send({ data: income })
        })
        .catch((err) => console.log(err))
})