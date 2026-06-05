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
    // Détecte si c'est un PDF par mimetype OU par extension (mobile peut envoyer octet-stream)
    const isPDF = file.mimetype === 'application/pdf'
      || /\.pdf$/i.test(file.originalname || '');

    const timestamp = Date.now();
    const originalName = (file.originalname || 'file').split('.')[0];
    const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
    const publicId = `file_${cleanName}_${timestamp}`;

    const folder = process.env.NODE_ENV === 'production'
      ? 'anciens_examens'
      : 'anciens_examens_test';

    console.log('[Cloudinary upload]', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      isPDF
    });

    if (isPDF) {
      return {
        folder,
        resource_type: 'image',
        format: 'pdf',
        public_id: publicId,
        transformation: []
      };
    }

    return {
      folder,
      resource_type: 'image',
      public_id: publicId,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }]
    };
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf'
  ];
  const allowedExtensions = /\.(jpe?g|png|gif|pdf)$/i;

  // Certains navigateurs mobiles envoient 'application/octet-stream' pour les PDF
  // On accepte aussi en regardant l'extension du nom de fichier
  const mimeOk = allowedMimes.includes(file.mimetype);
  const extOk = allowedExtensions.test(file.originalname || '');
  const octetStreamPdf = file.mimetype === 'application/octet-stream' && /\.pdf$/i.test(file.originalname || '');

  console.log('[Multer fileFilter]', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    mimeOk,
    extOk,
    octetStreamPdf
  });

  if (mimeOk || octetStreamPdf || (file.mimetype === 'application/octet-stream' && extOk)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non supporté (${file.mimetype} / ${file.originalname}). Seuls JPG, PNG, GIF et PDF sont acceptés.`), false);
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