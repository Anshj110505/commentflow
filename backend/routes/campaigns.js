const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getCampaigns,
  createCampaign,
  updateCampaign,
  toggleCampaign,
  deleteCampaign,
  getCampaignLogs
} = require('../controllers/campaignController');

router.get('/', auth, getCampaigns);
router.post('/', auth, createCampaign);
router.put('/:id', auth, updateCampaign);
router.patch('/:id/toggle', auth, toggleCampaign);
router.delete('/:id', auth, deleteCampaign);
router.get('/logs', auth, getCampaignLogs);

module.exports = router;