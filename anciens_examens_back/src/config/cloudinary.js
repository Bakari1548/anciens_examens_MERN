const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === 'application/pdf';
    
    const timestamp = Date.now();
    const originalName = file.originalname.split('.')[0];
    const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Garder l'extension dans le public_id pour les PDF
    // Cela aide Cloudinary à détecter le type
    const publicId = `file_${cleanName}_${timestamp}`;
    
    const folder = process.env.NODE_ENV === 'production' 
      ? 'anciens_examens' 
      : 'anciens_examens_test';

    return {
      folder: folder,
      
      // Cloudinary peut servir des PDF via /image/upload/ avec viewer inline
      resource_type: 'image',
      
      format: isPDF ? 'pdf' : undefined,  // undefined = Cloudinary détecte automatiquement pour images
      
      // On gérera l'affichage côté frontend avec l'URL
      public_id: publicId,
      
      // Optionnel : qualité auto pour les images
      transformation: isPDF ? [] : [{ quality: 'auto', fetch_format: 'auto' }]
    };
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Seuls JPG, PNG, GIF et PDF sont acceptés.'), false);
  }
};

const multer = require('multer');
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  }
});

module.exports = { cloudinary, storage, upload, fileFilter };