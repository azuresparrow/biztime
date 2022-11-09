const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");

let router = new express.Router();

/* GET /invoices
Return info on invoices: like {invoices: [{id, comp_code}, ...]}*/
router.get('/invoices', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json(results.rows);
    } catch(err) {
        return next(err);
    }
});


/* GET /invoices/[id]
Returns obj on given invoice.

If invoice cannot be found, returns 404.

Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}*/

router.get('/invoices/:id', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, amt, paid, add_date FROM companies WHERE code = $1`, [param.code]);
        return res.json(results.rows[0]);
    } catch(err) {
        return next(new ExpressError(`Company with code ${param.code} was not found`, 404));
    }
});

/* POST /invoices
Adds an invoice.

Needs to be passed in JSON body of: {comp_code, amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}*/

/* PUT /invoices/[id]
Updates an invoice.

If invoice cannot be found, returns a 404.

Needs to be passed in a JSON body of {amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}*/

/* DELETE /invoices/[id]
Deletes an invoice.

If invoice cannot be found, returns a 404.

Returns: {status: "deleted"}*/



/*
GET /companies/[code]
Return obj of company: {company: {code, name, description, invoices: [id, ...]}}

If the company given cannot be found, this should return a 404 status response. */

module.exports =  router;