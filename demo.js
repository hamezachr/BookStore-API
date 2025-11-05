const PORT = process.env.PORT || 3000;
const BASE = process.env.BASE || `http://localhost:${PORT}`;

// ===== Tâche 10 : callback asynchrone =====
function getAllBooksCallback(cb) {
  fetch(`${BASE}/books`)
    .then(r => r.json())
    .then(data => cb(null, data))
    .catch(err => cb(err));
}

// ===== Tâche 11 : Promesse – recherche par ISBN =====
function getByISBN(isbn) {
  return fetch(`${BASE}/books/isbn/${isbn}`).then(r => r.json());
}

// ===== Tâche 12 : Promesse – recherche par auteur =====
function getByAuthor(author) {
  return fetch(`${BASE}/books/author/${encodeURIComponent(author)}`).then(r => r.json());
}

// ===== Tâche 13 : Promesse – recherche par titre =====
function getByTitle(title) {
  return fetch(`${BASE}/books/title/${encodeURIComponent(title)}`).then(r => r.json());
}

// --- Démo console (pour tes captures si tu veux) ---
getAllBooksCallback((err, data) => {
  if (err) return console.error('Erreur T10:', err);
  console.log('Tâche 10 (callback) - Tous les livres:\n', data);
  getByISBN('9780002').then(d => console.log('T11 (ISBN):\n', d));
  getByAuthor('Robert C. Martin').then(d => console.log('T12 (Auteur):\n', d));
  getByTitle('clean').then(d => console.log('T13 (Titre "clean"):\n', d));
});
