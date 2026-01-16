import fs from "fs";
import path from "path";

// lokasi JSON input
const inputPath = "./backend/public/json/books_mysql_ready.json";

// baca JSON
let books = JSON.parse(fs.readFileSync(inputPath, "utf8"));

// proses update setiap buku
books = books.map(book => {
  const filename = path.basename(book.imageUrl); // ambil nama file saja
  return {
    ...book,
    imageUrl: `${filename}`
  };
});

// simpan kembali
fs.writeFileSync(inputPath, JSON.stringify(books, null, 2), "utf8");

console.log("Image paths updated!");
