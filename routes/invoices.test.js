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
    const invoice = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date)
    VALUES ('apple', 100, false, null) RETURNING *`);
    testInvoice = invoice.rows[0]
});

afterEach(async function() {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
});

afterAll(async function() {
    await db.end();
})

describe("GET invoices", () => {
    test("Get all invoices", async() => {
        const res = await request(app).get("/invoices");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoices: [{
                "add_date": expect.any(String),
                "amt": 100,
                "comp_code": "apple",
                "id": expect.any(Number),
                "paid": false,
                "paid_date": null
            }]
        });
    });
})

describe("GET /invoices/:id", () => {
    test("Get invoice by id", async() => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: {
                "add_date": expect.any(String),
                "amt": 100,
                "company": expect.any(Object),
                "id": expect.any(Number),
                "paid": false,
                "paid_date": null
            }
        });
    });
    test("Responds with 404 for invalid item", async() => {
        const res = await request(app).get(`/invoices/0`);
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /invoices", () => {
    test("Creating a new invoice", async() => {
        const res = await request(app).post("/invoices").send({ comp_code: "apple", amt: 800 });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: "apple",
                amt: 800,
                add_date: expect.any(String),
                paid: false,
                paid_date: null
            }
        });
    });
});

describe("/PATCH /invoices/:id", () => {
    test("Updating an existing invoice", async() => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt: 800, paid: true });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: "apple",
                amt: 800,
                add_date: expect.any(String),
                paid: true,
                paid_date: expect.any(String)
            }
        });
    });
    test("Update an existing invoice to not paid", async() => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt: 800, paid: false });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: "apple",
                amt: 800,
                add_date: expect.any(String),
                paid: false,
                paid_date: null
            }
        });
    })
    test("Responds with 404 for invalid name", async() => {
        const res = await request(app).put(`/invoices/0`).send({ name: "new name", description: "new description" });
        expect(res.statusCode).toBe(404);
    });
});

describe("/DELETE /invoices/:id", () => {
    test("Deleting an invoice", async() => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'Deleted' });
    });
    test("Responds with 404 for deleting invalid item", async() => {
        const res = await request(app).delete(`/invoices/0`);
        expect(res.statusCode).toBe(404);
    });
});