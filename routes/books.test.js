process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db');
const Book = require('../models/book');


const dataBook1 = {
    isbn: "0691161518",
    amazon_url: "http://a.co/eobPtX2",
    author: "test One",
    language: "english",
    pages: 264,
    publisher: "test company",
    title: "this is test one",
    year: 2017
  }

const dataBook2 = {
    isbn: "0691161520",
    amazon_url: "http://a.co/eobPtX2",
    author: "test Two",
    pages: 265,
    language: "english",
    publisher: "test company",
    title: "this is test two something one information missing",
    year: 2017
}

// dataBook3 is missing page information
const dataBook3 = {
    isbn: "0691161520",
    amazon_url: "http://a.co/eobPtX2",
    author: "test Two",
    language: "english",
    publisher: "test company",
    title: "this is test two something one information missing",
    year: 2017
  }


let b1;
let b2;

beforeEach(async function () {
    await db.query("DELETE FROM books");
    b1 = await Book.create(dataBook1);
});

afterAll(async function () {
    await db.end();
});

describe("GET Routes Test", function () {

    //  get all books
    test("/books => can get all books", async () => {
        let res = await request(app).get('/books');
        expect(res.statusCode).toEqual(200);
        expect(res.body.books).toEqual(expect.any(Array));
    })

    // get a book
    test("/books/:id => can get a book", async () => {
        let res = await request(app).get('/books/0691161518');
        expect(res.statusCode).toEqual(200);
        expect(res.body.book).toEqual(expect.objectContaining( {author: "test One"}));
    })

});

describe("POST route test", function(){

    test('POST/books => can post a new book', async () => {
        const res = await request(app).post('/books').send(dataBook2);
        expect(res.statusCode).toBe(201);
        expect(res.body.book).toEqual(expect.objectContaining({isbn: "0691161520"})) 
    })

    test('POST/books => validate data before adding a new book', async () => {
        const res = await request(app).post('/books').send(dataBook3);
        expect(res.statusCode).toBe(400);
    })

})

describe("PUT route test", function(){

    test('PUT/books/isbn => can update a book info', async () => {
        const res = await request(app)
            .put('/books/0691161518')
            .send(
                {
                    amazon_url: "http://a.co/eobPtX2",
                    author: "updated test One",
                    language: "english",
                    pages: 264,
                    publisher: "test company",
                    title: "this is test one",
                    year: 2017
                  }
            );
        expect(res.statusCode).toBe(200);
        expect(res.body.book).toEqual(expect.objectContaining({author: "updated test One"})) 
    })

    test('PUT/books/isbn => validate data updating', async () => {
        const res = await request(app)
        .put('/books/0691161518')
        .send(
            {
                amazon_url: "http://a.co/eobPtX2",
                pages: 264,
                publisher: "test company",
                title: "this is test one",
                year: 2017
              }
        );
        console.log(res);
        expect(res.statusCode).toBe(400);
    })

})

describe("DELETE route test", function(){

    test('DELETE/books/isbn => can update a book info', async () => {
        const res = await request(app)
            .delete('/books/0691161518');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Book deleted" })
    })

})


// sp solution
// __tests__/books.test.js
// /** Integration tests for books route */


// process.env.NODE_ENV = "test"

// const request = require("supertest");


// const app = require("../app");
// const db = require("../db");


// // isbn of sample book
// let book_isbn;


// beforeEach(async () => {
//   let result = await db.query(`
//     INSERT INTO
//       books (isbn, amazon_url,author,language,pages,publisher,title,year)
//       VALUES(
//         '123432122',
//         'https://amazon.com/taco',
//         'Elie',
//         'English',
//         100,
//         'Nothing publishers',
//         'my first book', 2008)
//       RETURNING isbn`);

//   book_isbn = result.rows[0].isbn
// });


// describe("POST /books", function () {
//   test("Creates a new book", async function () {
//     const response = await request(app)
//         .post(`/books`)
//         .send({
//           isbn: '32794782',
//           amazon_url: "https://taco.com",
//           author: "mctest",
//           language: "english",
//           pages: 1000,
//           publisher: "yeah right",
//           title: "amazing times",
//           year: 2000
//         });
//     expect(response.statusCode).toBe(201);
//     expect(response.body.book).toHaveProperty("isbn");
//   });

//   test("Prevents creating book without required title", async function () {
//     const response = await request(app)
//         .post(`/books`)
//         .send({year: 2000});
//     expect(response.statusCode).toBe(400);
//   });
// });


// describe("GET /books", function () {
//   test("Gets a list of 1 book", async function () {
//     const response = await request(app).get(`/books`);
//     const books = response.body.books;
//     expect(books).toHaveLength(1);
//     expect(books[0]).toHaveProperty("isbn");
//     expect(books[0]).toHaveProperty("amazon_url");
//   });
// });


// describe("GET /books/:isbn", function () {
//   test("Gets a single book", async function () {
//     const response = await request(app)
//         .get(`/books/${book_isbn}`)
//     expect(response.body.book).toHaveProperty("isbn");
//     expect(response.body.book.isbn).toBe(book_isbn);
//   });

//   test("Responds with 404 if can't find book in question", async function () {
//     const response = await request(app)
//         .get(`/books/999`)
//     expect(response.statusCode).toBe(404);
//   });
// });


// describe("PUT /books/:id", function () {
//   test("Updates a single book", async function () {
//     const response = await request(app)
//         .put(`/books/${book_isbn}`)
//         .send({
//           amazon_url: "https://taco.com",
//           author: "mctest",
//           language: "english",
//           pages: 1000,
//           publisher: "yeah right",
//           title: "UPDATED BOOK",
//           year: 2000
//         });
//     expect(response.body.book).toHaveProperty("isbn");
//     expect(response.body.book.title).toBe("UPDATED BOOK");
//   });

//   test("Prevents a bad book update", async function () {
//     const response = await request(app)
//         .put(`/books/${book_isbn}`)
//         .send({
//           isbn: "32794782",
//           badField: "DO NOT ADD ME!",
//           amazon_url: "https://taco.com",
//           author: "mctest",
//           language: "english",
//           pages: 1000,
//           publisher: "yeah right",
//           title: "UPDATED BOOK",
//           year: 2000
//         });
//     expect(response.statusCode).toBe(400);
//   });

//   test("Responds 404 if can't find book in question", async function () {
//     // delete book first
//     await request(app)
//         .delete(`/books/${book_isbn}`)
//     const response = await request(app).delete(`/books/${book_isbn}`);
//     expect(response.statusCode).toBe(404);
//   });
// });


// describe("DELETE /books/:id", function () {
//   test("Deletes a single a book", async function () {
//     const response = await request(app)
//         .delete(`/books/${book_isbn}`)
//     expect(response.body).toEqual({message: "Book deleted"});
//   });
// });


// afterEach(async function () {
//   await db.query("DELETE FROM BOOKS");
// });


// afterAll(async function () {
//   await db.end()
// });