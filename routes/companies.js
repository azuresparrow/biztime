const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");

let router = new express.Router();

/** GET /companies
Returns list of companies, like {companies: [{code, name}, ...]}*/
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json(results.rows);
    } catch(err) {
        return next(err);
    }
});

/** GET /companies/[code]
Return obj of company: {company: {code, name, description}}
If the company given cannot be found, this should return a 404 status response.*/
router.get('/:code', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [req.params.code]);
        return res.json(results.rows[0]);
    } catch(err) {
        return next(new ExpressError(`Company with code ${req.params.code} was not found`, 404));
    }
});

/** POST /companies
Adds a company.
Needs to be given JSON like: {code, name, description}
Returns obj of new company: {company: {code, name, description}}*/
router.post('/', async (req, res, next) => {
    try {
        const {code, name, description} = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) 
                                        RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json(results.rows[0]);
    } catch(err) {
        return next(err);
    }
});

/** PUT /companies/[code]
Edit existing company.
Should return 404 if company cannot be found.
Needs to be given JSON like: {name, description}
Returns update company object: {company: {code, name, description}}*/
router.patch('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const {name, description} = req.body;
        const results = await db.query(`UPDATE companies SET name=$2 description=$3 WHERE code=$1 
                                        RETURNING code, name, description`, [code, name, description]);
        return res.json(results.rows[0]);
    } catch(err) {
        return next(next(new ExpressError(`Company with code ${code} was not found`, 404)));
    }
});


/** DELETE /companies/[code]
Deletes company.
Should return 404 if company cannot be found.
Returns {status: "deleted"} */
router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        return res.json({status: `deleted`});
    } catch(err) {
        return next(next(new ExpressError(`Company with code ${code} was not found`, 404)));
    }
});

module.exports = router;