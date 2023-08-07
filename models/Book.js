const mongoose = require('mongoose')
const { documentsSchema } = require('./Documents')
const Schema = mongoose.Schema

const bookSchema = new Schema({
    name: {
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
    image: {
        type: String,
        required: true
    },
    PDF: {
        type: String,
        required: true
    },
    description: {
        type: String,
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