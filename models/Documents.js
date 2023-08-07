const mongoose = require('mongoose')

const Schema = mongoose.Schema

const documentsSchema = new Schema({
    path: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Documents = mongoose.model('documents', documentsSchema)
module.exports = {
    Documents,
    documentsSchema,
}