process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app");
const db = require("../db");



let testComp;
beforeEach(async function() {
    const result = await db.query(`
    INSERT INTO companies
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.') RETURNING *`);
    testComp = result.rows[0];
});

afterEach(async function() {
    await db.query(`DELETE FROM companies`);
});

afterAll(async function() {
    await db.end();
})

describe("GET companies", () => {
    test("Get all companies", async() => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ companies: [testComp] })
    })
})

// describe("GET /items/:name", () => {
//     test("Get item by name", async() => {
//         const res = await request(app).get(`/items/${bacon.name}`);
//         expect(res.statusCode).toBe(200)
//         expect(res.body).toEqual({ item: bacon })
//     })
//     test("Responds with 404 for invalid item", async() => {
//         const res = await request(app).get(`/items/icecube`);
//         expect(res.statusCode).toBe(404)
//     })
// })

// describe("POST /items", () => {
//     test("Creating an item", async() => {
//         const res = await request(app).post("/items").send({ name: "beef", price: 3.99 });
//         expect(res.statusCode).toBe(201);
//         expect(res.body).toEqual({ item: { name: "beef", price: 3.99 } });
//     })
//     test("Responds with 400 if name is missing", async() => {
//         const res = await request(app).post("/items").send({});
//         expect(res.statusCode).toBe(400);
//     })
// })

// describe("/PATCH /items/:name", () => {
//     test("Updating an item", async() => {
//         const res = await request(app).patch(`/items/${bacon.name}`).send({ name: "chili", price: 2.99 });
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({ updated: { name: "chili", price: 2.99 } });
//     })
//     test("Responds with 404 for invalid name", async() => {
//         const res = await request(app).patch(`/items/Piggles`).send({ name: "chili", price: 2.99 });
//         expect(res.statusCode).toBe(404);
//     })
// })

// describe("/DELETE /items/:name", () => {
//     test("Deleting an item", async() => {
//         const res = await request(app).delete(`/items/${bacon.name}`);
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual({ message: 'Deleted' })
//     })
//     test("Responds with 404 for deleting invalid item", async() => {
//         const res = await request(app).delete(`/items/hamface`);
//         expect(res.statusCode).toBe(404);
//     })
// })