const express = require('express');
const { DEPARTMENTS, STATUSES, PAGE_SIZES } = require('../constants');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ departments: DEPARTMENTS, statuses: STATUSES, pageSizes: PAGE_SIZES });
});

module.exports = router;
