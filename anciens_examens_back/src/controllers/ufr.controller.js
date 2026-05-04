const ufrData = require('../data/ufrData');

// Obtenir toutes les UFR
const getAllUfrs = (req, res) => {
  try {
    const ufrs = Object.keys(ufrData).map(ufr => ({
      name: ufr,
      code: ufrData[ufr].code
    }));
    
    res.status(200).json({
      success: true,
      data: ufrs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des UFR',
      error: error.message
    });
  }
};

// Obtenir les filières d'une UFR spécifique
const getFilieresByUfr = (req, res) => {
  try {
    const { ufr } = req.params;
    
    if (!ufr || !ufrData[ufr]) {
      return res.status(404).json({
        success: false,
        message: 'UFR non trouvée'
      });
    }
    
    const filieres = Object.keys(ufrData[ufr].filieres).map(filiere => ({
      name: filiere,
      code: ufrData[ufr].filieres[filiere].code,
      niveaux: ufrData[ufr].filieres[filiere].niveaux
    }));
    
    res.status(200).json({
      success: true,
      data: filieres
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des filières',
      error: error.message
    });
  }
};

// Obtenir les niveaux d'une filière spécifique
const getNiveauxByFiliere = (req, res) => {
  try {
    const { ufr, filiere } = req.params;
    
    if (!ufr || !ufrData[ufr]) {
      return res.status(404).json({
        success: false,
        message: 'UFR non trouvée'
      });
    }
    
    if (!filiere || !ufrData[ufr].filieres[filiere]) {
      return res.status(404).json({
        success: false,
        message: 'Filière non trouvée'
      });
    }
    
    const niveaux = ufrData[ufr].filieres[filiere].niveaux.map(niveau => ({
      name: niveau,
      semestres: getSemestresForNiveau(niveau)
    }));
    
    res.status(200).json({
      success: true,
      data: niveaux
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des niveaux',
      error: error.message
    });
  }
};

// Fonction utilitaire pour générer les semestres selon le niveau
const getSemestresForNiveau = (niveau) => {
  const niveauToSemestres = {
    // Licence
    'L1': ['S1', 'S2'],
    'L2': ['S3', 'S4'],
    'L3': ['S5', 'S6'],
    // Master
    'M1': ['S1', 'S2'],
    'M2': ['S3', 'S4'],
    // DUT
    'DUT1': ['S1', 'S2'],
    'DUT2': ['S3', 'S4'],
    // Ingénieur
    'ING1': ['S1', 'S2'],
    'ING2': ['S3', 'S4'],
    'ING3': ['S5', 'S6'],
    // Médecine
    'PCEM1': ['S1', 'S2'],
    'PCEM2': ['S3', 'S4'],
    'DCEM1': ['S5', 'S6'],
    'DCEM2': ['S7', 'S8'],
    'DCEM3': ['S9', 'S10'],
    'DCEM4': ['S11', 'S12'],
    // Pharmacie
    'D1': ['S1', 'S2'],
    'D2': ['S3', 'S4'],
    'D3': ['S5', 'S6'],
    'D4': ['S7', 'S8'],
    'D5': ['S9', 'S10'],
    'D6': ['S11', 'S12'],
    // Sciences Infirmières
    'L4': ['S7', 'S8'],
    // Licence Professionnelle
    'LP': ['S9', 'S10']
  };
  
  return niveauToSemestres[niveau] || ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];
};

module.exports = {
  getAllUfrs,
  getFilieresByUfr,
  getNiveauxByFiliere
};
