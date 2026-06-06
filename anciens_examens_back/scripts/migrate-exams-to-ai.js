/**
 * Script de migration pour analyser rétroactivement les examens existants
 * et leur ajouter une extraction IA pour la détection de doublons.
 * 
 * Usage: node scripts/migrate-exams-to-ai.js
 * 
 * Ce script:
 * 1. Récupère tous les examens sans aiExtraction
 * 2. Pour chaque examen, télécharge le fichier depuis Cloudinary
 * 3. Envoie le fichier à l'API Gemini pour analyse
 * 4. Sauvegarde le résultat dans le champ aiExtraction
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('../src/models/Exam');
const { analyzeExam } = require('../src/utils/geminiClient');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

// Répertoire temporaire pour les fichiers téléchargés
const TEMP_DIR = path.join(__dirname, '../temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Télécharge un fichier depuis une URL
 */
async function downloadFile(url, localPath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(localPath);
        
        protocol.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Suivre les redirections
                downloadFile(response.headers.location, localPath)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(localPath, () => {}); // Supprimer le fichier partiel
            reject(err);
        });
    });
}

/**
 * Analyse un examen et ajoute l'extraction IA
 */
async function processExam(exam) {
    try {
        console.log(`\n📄 Analyse de l'examen: ${exam.title} (${exam.slug})`);
        
        if (!exam.files || exam.files.length === 0) {
            console.log(`⚠️  Pas de fichiers pour cet examen`);
            return null;
        }

        // Télécharger le premier fichier
        const fileUrl = exam.files[0].url;
        const fileExt = path.extname(fileUrl) || '.pdf';
        const localPath = path.join(TEMP_DIR, `${exam.slug}${fileExt}`);
        
        console.log(`📥 Téléchargement du fichier...`);
        await downloadFile(fileUrl, localPath);
        
        // Lire le fichier
        const fileBuffer = fs.readFileSync(localPath);
        const mimeType = fileExt === '.pdf' ? 'application/pdf' : 'image/jpeg';
        
        // Créer un objet File simulé
        const file = {
            buffer: fileBuffer,
            mimetype: mimeType,
            originalname: exam.files[0].originalName || `exam${fileExt}`
        };
        
        // Analyser avec Gemini
        console.log(`🤖 Analyse avec Gemini...`);
        const result = await analyzeExam(file);
        
        // Mettre à jour l'examen
        console.log(`💾 Mise à jour de l'examen...`);
        await Exam.findByIdAndUpdate(exam._id, {
            aiExtraction: result.aiExtraction
        });
        
        console.log(`✅ Examen analysé avec succès (${result.aiExtraction?.exercises?.length || 0} exercices)`);
        
        // Supprimer le fichier temporaire
        fs.unlinkSync(localPath);
        
        return result;
    } catch (error) {
        console.error(`❌ Erreur lors de l'analyse de l'examen ${exam.slug}:`, error.message);
        return null;
    }
}

/**
 * Fonction principale
 */
async function main() {
    try {
        console.log('🚀 Démarrage de la migration des examens vers IA...\n');
        
        // Connexion à MongoDB
        console.log('📡 Connexion à MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB\n');
        
        // Récupérer les examens sans aiExtraction
        console.log('🔍 Recherche des examens sans extraction IA...');
        const examsWithoutAI = await Exam.find({
            $or: [
                { aiExtraction: { $exists: false } },
                { aiExtraction: null },
                { 'aiExtraction.exercises': { $exists: false } },
                { 'aiExtraction.exercises': { $size: 0 } }
            ]
        }).sort({ createdAt: -1 });
        
        console.log(`📊 ${examsWithoutAI.length} examens à analyser\n`);
        
        if (examsWithoutAI.length === 0) {
            console.log('✨ Tous les examens ont déjà une extraction IA');
            process.exit(0);
        }
        
        // Analyser chaque examen
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < examsWithoutAI.length; i++) {
            const exam = examsWithoutAI[i];
            console.log(`\n[${i + 1}/${examsWithoutAI.length}]`);
            
            const result = await processExam(exam);
            if (result) {
                successCount++;
            } else {
                failCount++;
            }
            
            // Pause entre chaque analyse pour éviter les rate limits
            if (i < examsWithoutAI.length - 1) {
                console.log('⏸️  Pause de 5 secondes...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 Résumé de la migration:');
        console.log(`✅ Succès: ${successCount}`);
        console.log(`❌ Échecs: ${failCount}`);
        console.log(`📊 Total: ${examsWithoutAI.length}`);
        console.log('='.repeat(50));
        
        // Nettoyer le répertoire temporaire
        if (fs.existsSync(TEMP_DIR)) {
            fs.rmSync(TEMP_DIR, { recursive: true, force: true });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    }
}

// Exécuter le script
main();
