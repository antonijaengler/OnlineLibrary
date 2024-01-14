const supertest = require('supertest');
const session = require('supertest-session');
const app = require('../server.js');

const request = supertest(app);
const testSession = session(app);
const adminTestSession = session(app);

describe("GET /api", function() {
    it("OK, showing home page", (done) => {
        request.get('/api').expect(200, done);
    });
});

describe("GET /api/books", function() {
    it("Unauthorized, doesn't show books if there is no user signed in", (done) => {
        request.get('/api/books').expect(401, done);
    });

    it("OK, shows books with user johndoe1", async() => {
        await testSession.post('/api/login')
                    .set('Content-Type', 'application/json')
                    .send({username: "johndoe1", password1: "12345678"})
                    .expect(200)
                    .redirects(1);
        await testSession.get('/api/books').expect(200);
    });
});

describe("POST /api/books", function() {
    it("Unauthorized, doesn't add books if there is no user signed in", (done) => {
        request.post('/api/books')
                .send({isbn: "1234567893", title: "Test title", author: "Test author",
                        yearofpublication: "2021", publisher: "Test publisher",
                        imageurls: "", imageurlm: "", imageurll: ""})
                .expect(401, done);
    });

    it("Created, adds books for user johndoe1", async() => {
        await testSession.post('/api/books')
                        .send({isbn: "1234567893", title: "Test title", author: "Test author",
                        yearofpublication: "2021", publisher: "Test publisher",
                        imageurls: "", imageurlm: "", imageurll: ""})
                        .expect(201);
    });
});

describe("GET /api/books/add", function() {
    it("Unauthorized, doesn't show form for adding books if there is no user signed in", (done) => {
        request.get('/api/books/add')
                .expect(401, done);
    });

    it("OK, shows form for adding books", async() => {
        await testSession.get('/api/books/add')
                        .expect(200);
    });
});

describe("GET /api/books/edit/{isbn}", function() {
    it("Unauthorized, doesn't show form for editing books if there is no user signed in", (done) => {
        request.get('/api/books/edit/1234567893')
                .expect(401, done);
    });

    it("OK, shows form for editing books", async() => {
        let isbn = '1234567893'
        await testSession.get(`/api/books/edit/${isbn}`).expect(200);
    });
});

describe("GET /api/books/{isbn}", function() {
    it("Unauthorized, doesn't show book if there is no user signed in", (done) => {
        request.get('/api/books/1234567893')
                .expect(401, done);
    });

    it("OK, shows book", async() => {
        let isbn = '1234567893'
        await testSession.get(`/api/books/${isbn}`)
                        .expect(200);
    });
});

describe("PUT /api/books/{isbn}", function() {
    it("Unauthorized, doesn't update book if there is no user signed in", (done) => {
        request.put('/api/books/1234567893')
                .expect(401, done);
    });

    it("No Content, updates book", async() => {
        let isbn = '1234567893'
        await testSession.put(`/api/books/${isbn}`)
                        .send({isbn: '1234567893', title: "Titanic", author: "Leo Marriott",
                                yearofpublication: "1997", publisher: "Smithmark Publishers",
                                imageurls: "http://images.amazon.com/images/P/0765106477.01.THUMBZZZ.jpg", 
                                imageurlm: "http://images.amazon.com/images/P/0765106477.01.MZZZZZZZ.jpg", 
                                imageurll: "http://images.amazon.com/images/P/0765106477.01.LZZZZZZZ.jpg",
                                rating: "8"})
                        .expect(200);
    });
});

describe("GET /api/books/{isbn}", function() {
    it("Unauthorized, doesn't show book if there is no user signed in", (done) => {
        request.get('/api/books/1234567893')
                .expect(401, done);
    });

    it("OK, shows book", async() => {
        let isbn = '1234567893'
        await testSession.get(`/api/books/${isbn}`)
                        .expect(200);
    });
});

describe("DELETE /api/books/{isbn}", function() {
    it("Unauthorized, doesn't delete book if there is no user signed in", (done) => {
        request.delete('/api/books/1234567893')
                .expect(401, done);
    });

    it("No Content, deletes book", async() => {
        let isbn = '1234567893'
        await testSession.delete(`/api/books/${isbn}`)
                        .expect(200).redirects(1);
    });
});

describe("GET /api/users", function() {
    it("Unauthorized, doesn't show users if there is no user signed in", (done) => {
        request.get('/api/users').expect(401, done);
    });

    it("OK, shows users with user johndoe1", async() => {
        await testSession.get('/api/users').expect(200);
    });
});

describe("GET /api/users/{userid}", function() {
    it("Unauthorized, doesn't show specific user if there is no user signed in", (done) => {
        request.get('/api/users/277427').expect(401, done);
    });

    it("OK, shows specific user with signed user johndoe1", async() => {
        await testSession.get('/api/users/277427').expect(200);
    });
});

describe("GET /api/users/{userid}/books", function() {
    it("Unauthorized, doesn't show specific user's books if there is no user signed in", (done) => {
        request.get('/api/users/277427/books').expect(401, done);
    });

    it("OK, shows specific user's books with signed user johndoe1", async() => {
        await testSession.get('/api/users/277427/books').expect(200);
    });
});

describe("GET /api/users/add", function() {
    it("Unauthorized, don't show form for adding user unless admin is signed in", async() => {
        await testSession.get('/api/users/add').expect(302);
    });

    it("OK, show form for adding users with signed in admin", async() => {
        await adminTestSession.post('/api/login')
                    .set('Content-Type', 'application/json')
                    .send({username: "zeljko", password1: "zeljko277"})
                    .expect(200)
                    .redirects(1);
        await adminTestSession.get('/api/users/add').expect(200);
    });
});

describe("POST /api/users", function() {
    it("Unauthorized, don't show form for adding user unless admin is signed in", async() => {
        await testSession.post('/api/users').expect(302);
    });

    it("OK, add user with signed in admin", async() => {
        await adminTestSession.post('/api/users')
                            .send({username: "petar", password: "petar123", 
                                    location: "Sveti Petar u Sumi", age: 20,
                                    email: "petar@sveti", role: "user"})
                            .expect(201);
    });
});

describe("GET /api/users/edit/{userid}", function() {
    it("Unauthorized, don't show form for editing user unless admin is signed in", async() => {
        await testSession.get('/api/users/edit/278870').expect(302);
    });

    it("OK, show form for editing user with signed in admin", async() => {
        await adminTestSession.get('/api/users/edit/278870').expect(200);
    });
});

describe("PUT /api/users/{userid}", function() {
    it("Unauthorized, doesn't update specific user unless admin is signed in", async() => {
        await testSession.put('/api/users/278870').expect(302);
    });

    it("OK, updates specific user with signed in admin", async() => {
        await adminTestSession.put('/api/users/278870')
                            .send({username: "petar", password: "petar123", 
                                    location: "Sveti Petar u Sumi", age: 22,
                                    email: "petar@sveti", role: "user"})
                            .expect(302);
    });
});

describe("DELETE /api/users/{userid}", function() {
    it("Unauthorized, don't delete user unless admin is signed in", async() => {
        await testSession.delete('/api/users/278870').expect(302);
    });

    it("OK, delete user with signed in admin", async() => {
        await adminTestSession.delete('/api/users/278870')
                            .expect(302);
    });
});