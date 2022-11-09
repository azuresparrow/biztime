const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");

let router = new express.Router();

/* LIST ALL INDUSTRIES */
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT i.name as industry, c.code as company FROM industries as i LEFT JOIN companies_industries AS ic ON i.code = ic.industries_code LEFT JOIN companies as c ON c.code = ic.companies_code ORDER BY i.name`);
        return res.json(results.rows);
    } catch(err) {
        return next(err);
    }
});


/* CREATE AN INDUSTRY */

router.post('/', async (req, res, next) => {
    try {
        const {name, code} = req.body;
        const results = await db.query(`INSERT INTO industries (code, name) VALUES ($1, $2) 
                                        RETURNING code, name`, [code, name]);
        return res.status(201).json(results.rows[0]);
    } catch(err) {
        return next(err);
    }
});

/* ADD COMPANY TO INDUSTRY */
router.post('/:code', async (req, res, next) => {
    try {
        const {company} = req.body;
        const {industry} = req.params;
        const results = await db.query(`INSERT INTO companies_industries (industries_code, companies_code) VALUES ($1, $2) 
                                        RETURNING code, name`, [industry, company]);
        return res.status(201).json(results.rows[0]);
    } catch(err) {
        return next(err);
    }
});

module.exports = router;