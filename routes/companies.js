const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

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
        let { code } = req.params;
        const c_results = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [code]);
        const i_results = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code]);
        const ind_results = await db.query(`SELECT i.name FROM industries AS i LEFT JOIN companies_industries AS ic ON i.code = ic.industries_code LEFT JOIN companies as c ON c.code = ic.companies_code WHERE c.code = $1`, [code]);
        
        if(c_results.rows[0].length === 0)
            throw new ExpressError(`Company with code ${code} was not found`, 404);

        const company = c_results.rows[0];
        company.invoices = i_results.rows.map(i => i.id);
        company.industries = ind_results.rows.map(i => i.name);
        return res.json({"company": company});
    } catch(err) {
        return next(err);
    }
});

/** POST /companies
Adds a company.
Needs to be given JSON like: {code, name, description}
Returns obj of new company: {company: {code, name, description}}*/
router.post('/', async (req, res, next) => {
    try {
        const {name, description} = req.body;
        const code = slugify(name, {lower:true});
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
router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const {name, description} = req.body;
        const results = await db.query(`UPDATE companies SET name=$2 description=$3 WHERE code=$1 
                                        RETURNING code, name, description`, [code, name, description]);
        if(results.rows[0].length === 0)
            throw new ExpressError(`Company with code ${code} was not found`, 404);
        else 
            return res.json(results.rows[0]);
    } catch(err) {
        return next(err);
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
        return next(err);
    }
});

module.exports = router;