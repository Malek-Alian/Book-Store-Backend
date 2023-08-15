const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')

const Schema = mongoose.Schema

const orderSchema = new Schema({
    createdBy: {
        type: ObjectId,
        ref: 'users',
        required: true
    },
    books: {
        type: [ObjectId],
        ref: 'books',
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    }
}, { timestamps: true })

const Order = mongoose.model('orders', orderSchema)
module.exports = Order