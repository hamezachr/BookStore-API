const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = 'demo-secret';

// --- Données en mémoire (démo) ---
const books = {
  '9780001': {
    isbn: '9780001',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    reviews: {} // { username: "avis ..."}
  },
  '9780002': {
    isbn: '9780002',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    reviews: {}
  },
  '9780003': {
    isbn: '9780003',
    title: 'Deep Learning',
    author: 'Ian Goodfellow',
    reviews: {}
  }
};

const users = {}; // { username: password }

// --- Middleware d’auth ---
function auth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Token manquant' });
  jwt.verify(token, SECRET, (err, payload) => {
    if (err) return res.status(401).json({ msg: 'Token invalide' });
    req.user = payload; // { username }
    next();
  });
}

// ===== Tâche 1 : Obtenir la liste des livres =====
app.get('/books', (req, res) => {
  res.json(Object.values(books));
});

// ===== Tâche 2 : Détails par ISBN =====
app.get('/books/isbn/:isbn', (req, res) => {
  const b = books[req.params.isbn];
  if (!b) return res.status(404).json({ msg: 'ISBN introuvable' });
  res.json(b);
});

// ===== Tâche 3 : Livres par auteur =====
app.get('/books/author/:author', (req, res) => {
  const q = req.params.author.toLowerCase();
  const list = Object.values(books).filter(b => b.author.toLowerCase() === q);
  res.json(list);
});

// ===== Tâche 4 : Livres par titre (match partiel, insensible casse) =====
app.get('/books/title/:title', (req, res) => {
  const q = req.params.title.toLowerCase();
  const list = Object.values(books).filter(b => b.title.toLowerCase().includes(q));
  res.json(list);
});

// ===== Tâche 5 : Avis par ISBN =====
app.get('/review/:isbn', (req, res) => {
  const b = books[req.params.isbn];
  if (!b) return res.status(404).json({ msg: 'ISBN introuvable' });
  res.json(b.reviews);
});

// ===== Tâche 6 : Register =====
app.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ msg: 'username et password requis' });
  if (users[username]) return res.status(400).json({ msg: 'Utilisateur existe déjà' });
  users[username] = password; // (démo: pas de hash)
  res.json({ msg: 'Inscription réussie', username });
});

// ===== Tâche 7 : Login =====
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ msg: 'username et password requis' });
  if (users[username] !== password) return res.status(401).json({ msg: 'Identifiants invalides' });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '2h' });
  res.json({ msg: 'Connecté', token });
});

// ===== Tâche 8 : Ajouter/Modifier avis (auth) =====
app.post('/auth/review/:isbn', auth, (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body || {};
  const b = books[isbn];
  if (!b) return res.status(404).json({ msg: 'ISBN introuvable' });
  if (!review) return res.status(400).json({ msg: 'review requise' });
  b.reviews[req.user.username] = review;
  res.json({ msg: 'Avis ajouté/modifié', reviews: b.reviews });
});

// ===== Tâche 9 : Supprimer son avis (auth) =====
app.delete('/auth/review/:isbn', auth, (req, res) => {
  const b = books[req.params.isbn];
  if (!b) return res.status(404).json({ msg: 'ISBN introuvable' });
  delete b.reviews[req.user.username];
  res.json({ msg: 'Avis supprimé', reviews: b.reviews });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API démarrée sur http://localhost:${PORT}`));
