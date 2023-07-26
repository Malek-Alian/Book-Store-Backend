const mongoose = require('mongoose')

const Schema = mongoose.Schema

const bookSchema = new Schema({
    bookName: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    releaseDate: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true })

const Book = mongoose.model('books', bookSchema)
module.exports = {
    Book,
    bookSchema,
}