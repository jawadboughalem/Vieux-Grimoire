const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    // Je parse la requete reçu au format string
    const bookObject = JSON.parse(req.body.book);
    // Suppression du id qui sera géré par la BDD 
    delete bookObject._id;
    // Suppression du userId car on récupèrera celui du token 
    delete bookObject._userId;
    // Je créé une nouvelle instance de mon modèle Book
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        // on génère l'url de l'image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.path}`
    });
    // sauvgarde du nouveau livre dans la base de données 
    book.save()
    .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
    .catch(error => {res.status(400).json({ error })})
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        //Création URL image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,

    } : { ...req.body };
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message : 'Unauthorized request'});
            } else {
                const update = () => {
                    Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                    .then(() => res.status(200).json({message : 'Objet modifié!'}))
                    .catch(error => res.status(401).json({ error }));
                };
                if(req.file) {
                let oldImageName = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${oldImageName}`, update);
                } else {
                    update();
                    }
                }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({message: 'Unauthorized request'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                console.log("DELETED FILE NAME " + filename);
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

exports.getOneBook = (req, res, next) => {
    // Je récupère un livre avec l'id passé dans l'url
    Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => {
            res.status(200).json(books);
            console.log(books);
        })
        .catch(error => res.status(400).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
    Book.find()
    .then((books) => {
        books.sort((a,b) => b.averageRating - a.averageRating)
        const BestRatedBooks = books.slice(0, 3)
        res.status(200).json(BestRatedBooks);
    })
    .catch(error => res.status(400).json({ error }));
};

exports.rateBook = (req, res, next) => {
    const rating = {
        userId: req.auth.userId,
        grade: req.body.rating
    };
    Book.findOne({_id: req.params.id})
    .then((book) => {
        const existingRatings = book.ratings.map(({userId}) => userId)

        const checkUserId = existingRatings.includes(req.auth.userId);

        if (checkUserId == "true") {
            res.status(403).json({ message : 'A dèja noté ce livre'});
            console.log('A dèja noté ce livre');
        } else {
            book.ratings.push(rating);

            let sumOfRatings = 0;
            let grades = book.ratings.map(({grade}) => grade);

            for (i=0; i < grades.length; i++){
                sumOfRatings += grades[i];
            }
            book.averageRating = sumOfRatings / grades.length;

            book.save()
            .then((book) => {
                res.status(200).json(book);
                console.log('Book saved', book);
            })
            .catch(error => res.status(500).json({ error }));

        }
    })
    .catch((error) => {
        res.status(400).json({ error });
    });
};