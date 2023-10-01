const express = require("express");
const db = require("../db"); 
const ExpressError = require("../expressError");
const router = new express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, comp_code FROM invoices");
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});


router.get("/:id", async (req, res, next) => {
  try {
    const invoiceRes = await db.query("SELECT * FROM invoices WHERE id = $1", [req.params.id]);
    const companyRes = await db.query("SELECT * FROM companies WHERE code = $1", [invoiceRes.rows[0].comp_code]);

    if (invoiceRes.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }

    const invoice = invoiceRes.rows[0];
    invoice.company = companyRes.rows[0];

    return res.json({ invoice });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { amt } = req.body;
    const result = await db.query(
      "UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [amt, req.params.id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }

    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});


router.delete("/:id", async (req, res, next) => {
  try {
    const result = await db.query("DELETE FROM invoices WHERE id = $1 RETURNING id", [req.params.id]);

    if (result.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }

    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});




module.exports = router;
