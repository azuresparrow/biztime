const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");

let router = new express.Router();

/* GET /invoices
Return info on invoices: like {invoices: [{id, comp_code}, ...]}*/
router.get('/', async (req, res, next) => {
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

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`SELECT invoices.id, invoices.amt, invoices.paid, invoices.add_date, 
                                        companies.name, companies.description 
                                        FROM invoices JOIN companies 
                                        ON (invoices.comp_code = companies.code) 
                                        WHERE id = $1`, [ id ]);
        if(results.rows[0].length === 0)
            throw new ExpressError(`Invoice with id ${ req.params.id } was not found`, 404);
        const result = results.rows[0];
        const invoice = {
            id: result.id,
            company: {
                code: result.comp_code,
                name: result.name,
                description: result.description,
            },
            amt: result.amt,
            paid: result.paid,
            add_date: result.add_date,
            paid_date: result.paid_date,
        };
        return res.json({"invoice": invoice});
    } catch(err) {
        return next(err);
    }
});

/* POST /invoices
Adds an invoice.

Needs to be passed in JSON body of: {comp_code, amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}*/


router.post('/', async (req, res, next) => {
    try {
        const {comp_code, amt} = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) 
                                        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        return res.status(201).json({"invoice": results.rows[0]});
    } catch(err) {
        return next(err);
    }
});

/* PUT /invoices/[id]
Updates an invoice.

If invoice cannot be found, returns a 404.

Needs to be passed in a JSON body of {amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}*/

router.put('/:id', async (req, res, next) => {
    try {
        let { amt, paid } = req.bodyl
        let { id } = req.params;

        const result = await db.query(`SELECT paid_date FROM invoices WHERE id = $1`, [ id ]);
        if(result.rows[0].length === 0)
            throw new ExpressError(`Invoice with id ${id} was not found`, 404);

        const curPaidDate = result.row[0].paid_date;
        
        let pd = null;
        if(paid) 
            pd = currPaidDate ? curPaidDate : new Date();
            
        const updatedResult = await db.query(`UPDATE invoices SET amt=$2, paid=$3, paid_date=$4 WHERE id=$1 
        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [id, amt, paid, pd]);
        return res.json({"invoice": updatedResult.rows[0]});
    } catch (err){
        return next (err);
    }
});

/* DELETE /invoices/[id]
Deletes an invoice.

If invoice cannot be found, returns a 404.

Returns: {status: "deleted"}*/

router.delete('/:id', async (req, res, next)=> {
    try {
        let { id } = req.params;
        const result = await db.query(`DELETE FROM invoices WHERE id = $1 RETURNING id`, [id]);

        if (result.rows[0].length === 0)
            throw new ExpressError(`No invoice matching id: ${id}`, 404);
        
        return res.json({'status': 'deleted'});

    } catch(err) {
        return next(err);
    }
});

module.exports =  router;