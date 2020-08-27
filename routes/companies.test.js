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
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [testComp] });
    });
})

describe("GET /companies/:code", () => {
    test("Get company by code", async() => {
        const res = await request(app).get(`/companies/apple`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {
                code: 'apple',
                name: 'Apple Computer',
                description: 'Maker of OSX.',
                invoices: [expect.any(Object)]
            }
        });
    });
    test("Responds with 404 for invalid item", async() => {
        const res = await request(app).get(`/companies/carlscomputers`);
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /companies", () => {
    test("Creating a company", async() => {
        const res = await request(app).post("/companies").send({ code: "newComp", name: "My Company", description: "The best company ever!!" });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ company: { code: "newComp", name: "My Company", description: "The best company ever!!" } });
    });
});

describe("/PATCH /companies/:code", () => {
    test("Updating an existing company", async() => {
        const res = await request(app).put(`/companies/apple`).send({ name: "new name", description: "new description" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: { code: "apple", name: "new name", description: "new description" } });
    })
    test("Responds with 404 for invalid name", async() => {
        const res = await request(app).put(`/companies/bobsburgers`).send({ name: "new name", description: "new description" });
        expect(res.statusCode).toBe(404);
    });
});

describe("/DELETE /companies/:code", () => {
    test("Deleting an item", async() => {
        const res = await request(app).delete(`/companies/apple`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'Deleted' });
    })
    test("Responds with 404 for deleting invalid item", async() => {
        const res = await request(app).delete(`/companies/toysrus`);
        expect(res.statusCode).toBe(404);
    });
});