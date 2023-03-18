process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db');
const Book = require('../models/book');
const jsonschema = require('jsonschema');
const bookSchema = require('../schema/bookschema.json');

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


