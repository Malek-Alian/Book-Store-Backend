const mongoose = require('mongoose')
const { bookSchema } = require('./Book')

const Schema = mongoose.Schema

const orderSchema = new Schema({
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    books: {
        type: [bookSchema],
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    }
}, { timestamps: true })

const Order = mongoose.model('orders', orderSchema)
module.exports = Order