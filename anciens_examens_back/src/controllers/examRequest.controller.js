const ExamRequest = require('../models/ExamRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { createLog } = require('../utils/logger');

const ALLOWED_STATUS = ['pending', 'in_progress', 'fulfilled', 'rejected'];

const buildFilters = (query) => {
  const filters = {};

  if (query.status && ALLOWED_STATUS.includes(query.status)) {
    filters.status = query.status;
  }

  if (query.ufr) {
    filters.ufr = query.ufr;
  }

  if (query.filiere) {
    filters.filiere = query.filiere;
  }

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filters.$or = [
      { matiere: regex },
      { description: regex },
      { requesterName: regex },
      { requesterEmail: regex }
    ];
  }

  return filters;
};

const ensureWatcher = (examRequest, userId) => {
  if (!examRequest.watchers.some((watcherId) => watcherId.toString() === userId.toString())) {
    examRequest.watchers.push(userId);
  }
};

const notifyWatchers = async ({ examRequest, actorId, title, message, metadata = {} }) => {
  const notifications = examRequest.watchers
    .filter((watcherId) => watcherId.toString() !== actorId.toString())
    .map((recipient) => Notification.create({
      recipient,
      type: 'exam',
      title,
      message,
      metadata: {
        requestId: examRequest._id,
        slug: examRequest.slug,
        ...metadata
      },
      read: false
    }));

  await Promise.all(notifications);
};


// @desc    Créer une nouvelle demande d'examen
// @route   POST /api/exam-requests
// @access  Private
const createExamRequest = async (req, res) => {
  try {
    const {
      ufr,
      filiere,
      niveau,
      semestre,
      matiere,
      typeExamen,
      anneeExamen,
      description
    } = req.body;

    if (!ufr || !filiere || !niveau || !semestre || !matiere) {
      return res.status(400).json({
        message: 'Les champs UFR, filière, niveau, semestre et matière sont requis'
      });
    }

    const requesterName = `${req.user.firstName} ${req.user.lastName}`.trim();

    const examRequest = await ExamRequest.create({
      requester: req.user._id,
      requesterName,
      requesterEmail: req.user.email,
      ufr,
      filiere,
      niveau,
      semestre,
      matiere,
      typeExamen,
      anneeExamen,
      description,
      watchers: [req.user._id]
    });

    const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');
    await Promise.all(admins.map((admin) => (
      Notification.create({
        recipient: admin._id,
        type: 'exam',
        title: 'Nouvelle demande d\'examen',
        message: `${requesterName} a demandé un examen pour ${matiere} (${niveau} - ${semestre}).`,
        metadata: {
          requestId: examRequest._id,
          requester: requesterName
        },
        read: false
      })
    )));

    await createLog({
      level: 'info',
      action: 'EXAM_REQUEST_CREATED',
      message: `${requesterName} a soumis une demande d'examen pour ${matiere}`,
      req,
      user: req.user,
      metadata: { requestId: examRequest._id }
    });

    res.status(201).json({
      message: 'Demande enregistrée avec succès',
      request: examRequest
    });
  } catch (error) {
    console.error('[createExamRequest] Error:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la création de la demande',
      error: error.message
    });
  }
};

// @desc    Récupérer les demandes d'examen de l'utilisateur connecté
// @route   GET /api/exam-requests/my
// @access  Private
const getMyExamRequests = async (req, res) => {
  try {
    const requests = await ExamRequest.find({ requester: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Demandes récupérées avec succès',
      requests
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des demandes',
      error: error.message
    });
  }
};

// @desc    Récupérer toutes les demandes d'examen avec pagination et filtres
// @route   GET /api/exam-requests
// @access  Private/Admin
const getAllExamRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filters = buildFilters(req.query);

    const [requests, total] = await Promise.all([
      ExamRequest.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('requester', 'firstName lastName email filiere ufr'),
      ExamRequest.countDocuments(filters)
    ]);

    res.status(200).json({
      message: 'Demandes récupérées avec succès',
      requests,
      pagination: {
        currentPage: page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des demandes',
      error: error.message
    });
  }
};

// @desc    Récupérer une demande d'examen par ID
// @route   GET /api/exam-requests/:id
// @access  Private
const getExamRequestById = async (req, res) => {
  try {
    const examRequest = await ExamRequest.findById(req.params.id)
      .populate('requester', 'firstName lastName email filiere ufr')
      .populate('messages.author', 'firstName lastName email');

    if (!examRequest) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    res.status(200).json({
      message: 'Demande récupérée avec succès',
      request: examRequest
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération de la demande',
      error: error.message
    });
  }
};

// @desc    Mettre à jour le statut d'une demande d'examen
// @route   PUT /api/exam-requests/:id/status
// @access  Private/Admin
const updateExamRequestStatus = async (req, res) => {
  try {
    const { status, adminMessage } = req.body;

    if (!status || !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({
        message: 'Statut invalide'
      });
    }

    const examRequest = await ExamRequest.findById(req.params.id);

    if (!examRequest) {
      return res.status(404).json({
        message: 'Demande non trouvée'
      });
    }

    examRequest.status = status;
    examRequest.adminMessage = adminMessage || '';
    examRequest.respondedBy = req.user?._id || null;
    examRequest.respondedAt = ['fulfilled', 'rejected'].includes(status) ? new Date() : null;

    await examRequest.save();

    ensureWatcher(examRequest, examRequest.requester);
    await notifyWatchers({
      examRequest,
      actorId: req.user._id,
      title: 'Mise à jour de la demande',
      message: `La demande pour ${examRequest.matiere} est maintenant ${status}.`,
      metadata: { status, adminMessage: examRequest.adminMessage }
    });

    await createLog({
      level: 'info',
      action: 'EXAM_REQUEST_UPDATED',
      message: `Demande ${examRequest._id} mise à jour (${status})`,
      req,
      user: req.user,
      metadata: { requestId: examRequest._id, status }
    });

    res.status(200).json({
      message: 'Demande mise à jour avec succès',
      request: examRequest
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur lors de la mise à jour de la demande',
      error: error.message
    });
  }
};

// @desc    Ajouter un message à une demande d'examen
// @route   POST /api/exam-requests/:id/messages
// @access  Private
const addExamRequestMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le message ne peut pas être vide' });
    }

    const examRequest = await ExamRequest.findById(req.params.id);
    if (!examRequest) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    ensureWatcher(examRequest, req.user._id);

    const messageEntry = {
      author: req.user._id,
      authorName: `${req.user.firstName} ${req.user.lastName}`.trim(),
      content: content.trim(),
      createdAt: new Date()
    };

    examRequest.messages.push(messageEntry);
    await examRequest.save();

    await notifyWatchers({
      examRequest,
      actorId: req.user._id,
      title: `Nouveau message - ${examRequest.matiere}`,
      message: `${messageEntry.authorName} a répondu sur la demande « ${examRequest.matiere} »`,
      metadata: { messagePreview: messageEntry.content.slice(0, 120) }
    });

    res.status(201).json({
      message: 'Message ajouté',
      entry: messageEntry
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur lors de l\'ajout du message',
      error: error.message
    });
  }
};

// @desc    S'abonner à une demande d'examen
// @route   POST /api/exam-requests/:id/watch
// @access  Private
const watchExamRequest = async (req, res) => {
  try {
    const examRequest = await ExamRequest.findById(req.params.id);
    if (!examRequest) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    ensureWatcher(examRequest, req.user._id);
    await examRequest.save();

    res.status(200).json({ message: 'Vous suivrez désormais cette demande.' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur lors de l\'abonnement à la demande',
      error: error.message
    });
  }
};

module.exports = {
  createExamRequest,
  getMyExamRequests,
  getAllExamRequests,
  getExamRequestById,
  updateExamRequestStatus,
  addExamRequestMessage,
  watchExamRequest
};
