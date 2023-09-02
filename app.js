const express = require('express');

const app = express();

app.use(express.json());

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://user1:aqwzsx123@cluster0.vhogioq.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
   next();
 });


// Route d'accueil pour obtenir la liste des livres
app.get('/api/books', (req, res) => {
   // Pour le moment, je renvoie simplement un message.
   // Plus tard, cela devrait renvoyer la liste réelle des livres depuis ma base de données.
   res.json({ message: 'Liste des livres!' }); 
});

// Route pour l'authentification
app.post('/api/auth/signin', (req, res) => {
   res.json({ message: 'Authentification réussie!' }); 
});

module.exports = app;