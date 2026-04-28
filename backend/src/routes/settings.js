const express = require('express');
const router = express.Router();
const { protect, superAdminOnly } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { Settings } = require('../models/index');

// GET /api/settings  (some public, some admin)
router.get('/', asyncHandler(async (req, res) => {
  const publicGroups = ['general', 'seo', 'social'];
  const settings = await Settings.find({ group: { $in: publicGroups } });
  const result = {};
  settings.forEach(s => { result[s.key] = s.value; });
  res.json({ success: true, data: result });
}));

// GET /api/settings/all  (admin)
router.get('/all', protect, superAdminOnly, asyncHandler(async (req, res) => {
  const settings = await Settings.find().sort('group key');
  res.json({ success: true, data: settings });
}));

// PUT /api/settings  (admin)
router.put('/', protect, superAdminOnly, asyncHandler(async (req, res) => {
  const updates = req.body; // { key: value, ... }
  const results = [];

  for (const [key, value] of Object.entries(updates)) {
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value, key },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    results.push(setting);
  }

  res.json({ success: true, message: 'Settings updated', data: results });
}));

// DELETE /api/settings/:key  (admin)
router.delete('/:key', protect, superAdminOnly, asyncHandler(async (req, res) => {
  await Settings.findOneAndDelete({ key: req.params.key });
  res.json({ success: true, message: 'Setting deleted' });
}));

module.exports = router;
