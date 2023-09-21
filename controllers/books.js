const Book = require("../models/Book");
const fs = require("fs");

// Créer un nouveau livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Modifier un livre existant
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Unauthorized request" });
      } else {
        const update = () => {
          Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Objet modifié!" }))
            .catch((error) => res.status(401).json({ error }));
        };
        if (req.file) {
          let oldImageName = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${oldImageName}`, update);
        } else {
          update();
        }
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Unauthorized request" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre supprimé !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Récupérer un livre par son ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Récupérer les 3 livres les mieux notés
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      books.sort((a, b) => b.averageRating - a.averageRating);
      const BestRatedBooks = books.slice(0, 3);
      res.status(200).json(BestRatedBooks);
    })
    .catch((error) => res.status(400).json({ error }));
};

// Noter un livre
exports.rateBook = (req, res, next) => {
  const rating = {
    userId: req.auth.userId,
    grade: req.body.rating,
  };
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const existingRatings = book.ratings.map(({ userId }) => userId);

      const checkUserId = existingRatings.includes(req.auth.userId);

      if (checkUserId) {
        // <-- Correction ici
        res.status(403).json({ message: "A dèja noté ce livre" });
      } else {
        book.ratings.push(rating);

        let sumOfRatings = 0;
        let grades = book.ratings.map(({ grade }) => grade);

        for (i = 0; i < grades.length; i++) {
          sumOfRatings += grades[i];
        }
        book.averageRating = sumOfRatings / grades.length;

        book
          .save()
          .then((book) => {
            res.status(200).json(book);
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};