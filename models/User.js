const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
})

// Package utilisé pour s'assurer qu'une adresse mail n'est utilisé qu'une fois
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);