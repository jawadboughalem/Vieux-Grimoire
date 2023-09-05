const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

//Import des routes
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

//Création app express
const app = express();

//Import MongoDB
mongoose.connect('mongodb+srv://user1:aqwzsx123@cluster0.vhogioq.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//Accède au cœur de la requête. Intercepte les requêtes qui ont un type de contenu json et rend le contenu accessible à l'aide de req.body
app.use(express.json());

//CORS...
app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
   next();
 });


// Route d'accueil pour obtenir la liste des livres
app.use('/api/auth', userRoutes)

module.exports = app;