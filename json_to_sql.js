import fs from "fs";

// baca JSON
const books = JSON.parse(fs.readFileSync("./backend/public/json/books_mysql_ready.json"));

// buka file SQL output
let sql = "";

// tambahkan header INSERT
books.forEach(book => {
  sql += `
INSERT INTO books (isbn, title, author, genre_id, synopsis, cover_img, penerbit)
SELECT
  '${book.isbn}',
  ${JSON.stringify(book.title)},
  ${JSON.stringify(book.author)},
  (SELECT id FROM genres WHERE name = ${JSON.stringify(book.category)}),
  ${JSON.stringify(book.description)},
  ${JSON.stringify(book.imageUrl)},
  ${JSON.stringify(book.specifications?.Penerbit)}
WHERE EXISTS (SELECT id FROM genres WHERE name = ${JSON.stringify(book.category)});
`;
});

// simpan hasil SQL
fs.writeFileSync("./init/03_import_books.sql", sql);

console.log("SQL export ready → init/03_import_books.sql");
