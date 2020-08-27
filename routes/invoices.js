const express = require("express")
const router = new express.Router()
const ExpressError = require("../expressError")
const db = require("../db");

router.get("/", async function(req, res, next) {
    try {
        const result = await db.query(`SELECT * FROM invoices`);
        return res.json({ invoices: result.rows });
    } catch (e) {
        return next(e);
    }
})

router.post("/", async function(req, res, next) {
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date `, [comp_code, amt]);

        return res.status(201).json({ invoice: result.rows[0] });
    } catch (e) {
        return next(e)
    }
})

router.get("/:id", async function(req, res, next) {
    try {
        const id = req.params.id
        const result = await db.query(`SELECT id, amt, paid, add_date, paid_date, code, name, description FROM invoices JOIN companies ON invoices.comp_code=companies.code WHERE id=$1`, [id]);
        if (result.rows.length == 0) {
            throw new ExpressError("Invoice not found", 404);
        }
        const data = result.rows[0];
        const dataFormat = {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date
        }
        return res.json({ invoice: dataFormat });
    } catch (e) {
        return next(e)
    }
})

router.put("/:id", async function(req, res, next) {
    try {
        const id = req.params.id;
        const { amt, paid } = req.body;
        let result;
        if (paid) {
            result = await db.query(`UPDATE invoices SET amt=$2, paid=$3, paid_date=CURRENT_DATE WHERE id=$1 RETURNING *`, [id, amt, paid]);
        } else {
            result = await db.query(`UPDATE invoices SET amt=$2, paid=$3, paid_date=null WHERE id=$1 RETURNING *`, [id, amt, paid]);
        }
        if (result.rows.length == 0) {
            throw new ExpressError("Invoice not found", 404);
        }
        return res.json({ invoice: result.rows[0] });
    } catch (e) {
        return next(e)
    }
})

router.delete("/:id", async function(req, res, next) {
    try {
        const id = req.params.id;
        const result = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
        if (result.rowCount == 0) {
            throw new ExpressError("Company not found", 404);
        }
        return res.json({ status: 'Deleted' });
    } catch (e) {
        return next(e)
    }
})

module.exports = router;