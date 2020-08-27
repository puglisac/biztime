const express = require("express")
const router = new express.Router()
const ExpressError = require("../expressError")
const db = require("../db");

router.get("/", async function(req, res, next) {
    try {
        const result = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: result.rows });
    } catch (e) {
        return next(e);
    }
})

router.post("/", async function(req, res, next) {
    try {
        const { code, name, description } = req.body;
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);

        return res.status(201).json({ company: result.rows[0] });
    } catch (e) {
        return next(e)
    }
})

router.get("/:code", async function(req, res, next) {
    try {
        const code = req.params.code
        const result = await db.query(`SELECT * FROM companies JOIN invoices ON invoices.comp_code=companies.code WHERE code=$1`, [code]);
        if (result.rows.length == 0) {
            throw new ExpressError("Company not found", 404);
        }
        const data = result.rows;
        const company = { "code": result.rows[0].code, "name": result.rows[0].name, "description": result.rows[0].description };
        const invoices = [];
        for (invoice of data) {
            const iObj = { "id": invoice.id, "amt": invoice.amt, "paid": invoice.paid, "add_date": invoice.add_date, "paid_date": invoice.paid_date }
            invoices.push(iObj)
        }
        company["invoices"] = invoices;
        return res.json({ "company": company });
    } catch (e) {
        return next(e)
    }
})

router.put("/:code", async function(req, res, next) {
    try {
        const code = req.params.code;
        const { name, description } = req.body;
        const result = await db.query(`UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description`, [code, name, description]);
        if (result.rows.length == 0) {
            throw new ExpressError("Company not found", 404);
        }
        return res.json({ company: result.rows[0] });
    } catch (e) {
        return next(e)
    }
})

router.delete("/:code", async function(req, res, next) {
    try {
        const code = req.params.code;
        const result = await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        if (result.rowCount == 0) {
            throw new ExpressError("Company not found", 404);
        }
        return res.json({ message: 'Deleted' });
    } catch (e) {
        return next(e)
    }
})

module.exports = router;