const express = require('express')
const mongoose = require('mongoose')
const User = require('./models/User')
const { Book } = require('./models/Book')
const Order = require('./models/Order')

const cors = require("cors");

const corsOptions = {
    origin: "http://localhost:3001",
};

const app = express()
app.use(cors(corsOptions));
app.use(express.json())

const dbURI = 'mongodb+srv://Malek_Alian:Malek-2002@bookstore.a2sgpdf.mongodb.net/BookStore?retryWrites=true&w=majority'
mongoose.connect(dbURI)
    .then(() => console.log('Connected to database'))
    .catch((err) => console.log(err))

app.listen(3000)

app.post('/add-user', (req, res) => {
    const user = new User(req.body)
    user.save()
        .then(result => res.send(result))
        .catch(err => res.send(err))
})
app.get('/users', (req, res) => {
    User.find()
        .then(result => res.send(result))
        .catch(err => res.send(err))
})
app.post('/add-book', (req, res) => {
    const book = new Book(req.body)
    book.save()
        .then(result => res.send(result))
        .catch(err => res.send(err))
})
app.get('/books', (req, res) => {
    Book.find()
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
                    res.send({ status: false, data: {}, statusCode: 400, errooMessage: 'Password doesnt match' });
                }
            } else {
                res.send('User does not exist');
            }
            res.send('---------------------------------------------');
        })
        .catch(err => console.log(err))
})