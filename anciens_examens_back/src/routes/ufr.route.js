const express = require('express');
const router = express.Router();
const { getAllUfrs, getFilieresByUfr, getNiveauxByFiliere } = require('../controllers/ufr.controller');

// Routes pour les UFR, filières et niveaux
router.get('/', getAllUfrs);
router.get('/:ufr/filieres', getFilieresByUfr);
router.get('/:ufr/filieres/:filiere/niveaux', getNiveauxByFiliere);

module.exports = router;
