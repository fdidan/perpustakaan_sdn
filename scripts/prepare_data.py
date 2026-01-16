import json
import os

INPUT = "data/json/books_raw.json"
GENRE_SQL = "init/02-genres.sql"
BOOKS_SQL = "init/03-books.sql"


def slugify(text):
    return text.strip().lower()


# Load JSON
with open(INPUT, "r", encoding="utf-8") as f:
    raw_books = json.load(f)

# === 1. Ambil semua kategori unik dari JSON ===
categories = set()
for book in raw_books:
    cat = book.get("category", "").strip()
    if cat:
        categories.add(cat)

print("Kategori ditemukan dalam JSON:")
for c in categories:
    print(" -", c)

# === 2. Generate SQL untuk genres ===
genre_insert_sql = ["-- AUTO GENERATED GENRE DATA"]

genre_id_map = {}  # name → id
current_id = 1

for cat in sorted(categories):
    name = cat.strip()
    genre_id_map[name.lower()] = current_id

    genre_insert_sql.append(
        f"INSERT INTO genres (id, name) VALUES ({current_id}, '{name}');"
    )
    current_id += 1

# Simpan file SQL genre
with open(GENRE_SQL, "w", encoding="utf-8") as f:
    f.write("\n".join(genre_insert_sql))

print("\nGenerated:", GENRE_SQL)

# === 3. Generate SQL untuk books ===
books_insert_sql = ["-- AUTO GENERATED BOOK DATA"]

for b in raw_books:
    title = b.get("title", "").replace("'", "''")
    author = b.get("author", "").replace("'", "''")
    isbn = b.get("isbn", "")
    penerbit = b.get("specifications", {}).get("Penerbit", "").replace("'", "''")
    desc = b.get("description", "").replace("'", "''")
    cover = b.get("imageUrl", "").replace("'", "''")

    category = slugify(b.get("category", ""))
    genre_id = genre_id_map.get(category, 1)

    sql = f"""
INSERT INTO books (isbn, title, author, genre_id, synopsis, cover_img, penerbit)
VALUES ('{isbn}', '{title}', '{author}', {genre_id}, '{desc}', '{cover}', '{penerbit}');
"""
    books_insert_sql.append(sql)

# Simpan file SQL books
with open(BOOKS_SQL, "w", encoding="utf-8") as f:
    f.write("\n".join(books_insert_sql))

print("Generated:", BOOKS_SQL)
