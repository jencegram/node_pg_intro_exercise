const express = require("express");
const db = require("../db");
const router = new express.Router();
const ExpressError = require("../expressError");


router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("SELECT code, name FROM companies");
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const companyRes = await db.query("SELECT * FROM companies WHERE code = $1", [req.params.code]);
    const invoicesRes = await db.query("SELECT id FROM invoices WHERE comp_code = $1", [req.params.code]);

    if (companyRes.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }

    const company = companyRes.rows[0];
    company.invoices = invoicesRes.rows;

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});


router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query("INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description", [code, name, description]);

    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query("UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description", [name, description, code]);

    if (results.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }

    return res.json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query("DELETE FROM companies WHERE code = $1 RETURNING code", [code]);

    if (results.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }

    return res.json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});


module.exports = router;
