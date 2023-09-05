const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        // Nouvel utilisateur avec le modèle
        const user = new User({
          email: req.body.email,
          password: hash
        });
        // save in DB
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

  exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // MDP incorrect
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    // MDP correcte
                    res.status(200).json({
                        userId: user._id,
                        // create token with methode sign. Create object with data to encode (user id) and secret key for encoding, expiration time)
                        token: jwt.sign(
                            { userId: user._id },
                            'BOOKS_ARE_AWESOME',
                            { expiresIn: '24h' },
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };