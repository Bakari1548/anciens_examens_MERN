const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration Cloudinary
console.log('Configuration Cloudinary:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Configuré' : 'Manquant',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Configuré' : 'Manquant',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Configuré' : 'Manquant'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du stockage pour multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'anciens_examens', // Dossier dans Cloudinary
    resource_type: 'auto',     // Accepter images et PDF
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    // Transformation pour optimiser les fichiers
    transformation: [
      { width: 1200, crop: 'limit' }, // Limiter la largeur pour les images
      { quality: 'auto' }              // Qualité automatique
    ],
    // Nom de fichier personnalisé
    public_id: (req, file) => {
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
      return `${cleanName}_${timestamp}`;
    }
  }
});

// Middleware pour le filtrage des fichiers
const fileFilter = (req, file, cb) => {
  // console.log('Fichier reçu par fileFilter:', {
  //   originalname: file.originalname,
  //   mimetype: file.mimetype,
  //   size: file.size
  // });
  
  // Types MIME acceptés
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('Type de fichier accepté:', file.mimetype);
    cb(null, true);
  } else {
    console.log('Type de fichier rejeté:', file.mimetype);
    cb(new Error('Type de fichier non supporté. Seuls les images (JPG, PNG, GIF) et les PDF sont acceptés.'), false);
  }
};

// Configuration Multer
const multer = require('multer');
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1 // Un seul fichier par requête
  }
});

module.exports = {
  cloudinary,
  storage,
  upload,
  fileFilter
};
