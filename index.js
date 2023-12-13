import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'library',
    password: 'MMELPBDM12',
    port: 5432, // PostgreSQL default port
  };
  
  // Create a new PostgreSQL client
  const db = new pg.Client(config);
  
  // Connect to the PostgreSQL server
  db.connect()

  app.get("/", async (req, res) => {






    try {
        const result = await db.query("SELECT * FROM books");
        const books = result.rows || [];
        res.render("index.ejs", {
          books: books
        });
      } catch (error) {
        console.error("Error querying the database:", error);
        res.status(500).send("Internal Server Error");
      }

  });

  app.get("/infos", async (req, res) => {
    res.render("addpage.ejs");
  });

  
  app.post("/add", async (req, res) => {

   const title = req.body.title;
   const author = req.body.author;
   const isbn = req.body.isbn;
   const rating = req.body.rating;
   const review = req.body.review;

   try {
    
    const result = await db.query(
      'INSERT INTO books (title, author, rating, review, isbn) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, author, rating, review, isbn]
    );
    res.redirect('/');
  } catch (error) {
    console.error("Error inserting into the database:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }

    res.redirect('/');

  });

  app.post('/delete/:bookId', async (req, res) => {
    const bookId = req.params.bookId;
  
    try {
     
      const result = await db.query('DELETE FROM books WHERE book_id = $1', [bookId]);
      res.redirect('/');
  
      } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).send('Internal Server Error');
    }
    
  });

  app.post('/update/:bookId', (req, res) => {

    const bookId = req.params.bookId;
    res.render('update.ejs', {bookId});

  });

  app.post('/change/:bookId', async (req, res) => {
    const bookId = req.params.bookId;
    const rating = req.body.rating;
    const review = req.body.review;
  
    try {
      // Assuming rating and review are expected to be numeric and text types respectively
      const result = await db.query(
        'UPDATE books SET rating = $1, review = $2 WHERE book_id = $3',
        [rating, review, parseInt(bookId, 10)]
      );
  
      // Check if any rows were affected
      if (result.rowCount > 0) {
        res.redirect('/');
      } else {
        res.status(404).send('Book not found');
      }
    } catch (error) {
      console.error('Error updating book: ', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  