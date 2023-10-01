/** Database setup for BizTime. */

const { Client } = require("pg");

const db = new Client({
  connectionString: process.env.DATABASE_URL
});

db.connect();

module.exports = db;