import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { chatWithExam, prepareChatCache } from '../services/ai.api';
import { tokenStorage } from '../../../utils/tokenStorage';

/**
 * Widget chat IA flottant, fixé en bas à droite de la page DetailExam.
 * Mode tuteur pédagogique : aide l'étudiant à comprendre l'examen.
 */
export default function AIChatWidget({ exam }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Bonjour ! 👋\n\nJe suis ton **tuteur IA** pour cet examen de **${exam?.matiere || 'cette matière'}**. Pose-moi tes questions sur les exercices : je te donnerai des indices et des explications pour t'aider à comprendre.\n\nPar quoi veux-tu commencer ?`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    const isUserLoggedIn = !!tokenStorage.getUser();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    // Préparer le cache Redis lors de l'ouverture du chatbot
    useEffect(() => {
        if (open && isUserLoggedIn && exam?.slug) {
            prepareChatCache(exam.slug).catch(err => {
                console.warn('[AI Chat] Erreur préparation cache:', err);
                // Ne pas afficher d'erreur à l'utilisateur, le chat fonctionnera sans cache
            });
        }
    }, [open, isUserLoggedIn, exam?.slug]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        if (!isUserLoggedIn) {
            toast.error('Connectez-vous pour utiliser l\'assistant IA');
            return;
        }

        const newUserMsg = { role: 'user', content: trimmed };
        const newMessages = [...messages, newUserMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // Préparer l'historique (en excluant le message d'accueil initial)
            const history = newMessages
                .slice(1, -1) // skip welcome + current user msg
                .map(m => ({ role: m.role, content: m.content }));

            const response = await chatWithExam(exam.slug, trimmed, history);
            setMessages(prev => [...prev, { role: 'assistant', content: response.reply || '...' }]);
        } catch (error) {
            console.error('Erreur chat IA:', error);
            const status = error?.response?.status;
            const msg = error?.response?.data?.message;
            let errorContent;
            if (status === 429) {
                errorContent = '⏱️ ' + (msg || 'Limite de messages atteinte. Réessayez dans 1 heure.');
            } else if (status === 503) {
                errorContent = '⚠️ Le service IA n\'est pas configuré sur ce serveur.';
            } else {
                errorContent = '❌ Erreur lors de la communication avec l\'IA. Réessayez.';
            }
            setMessages(prev => [...prev, { role: 'assistant', content: errorContent }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleReset = () => {
        setMessages([
            {
                role: 'assistant',
                content: `Conversation réinitialisée. Pose-moi tes questions sur cet examen de **${exam?.matiere || 'cette matière'}** !`
            }
        ]);
    };

    // Rendu markdown minimal : **gras**, listes, retours à la ligne
    const renderContent = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, i) => {
            // Liste à puces
            const isBullet = /^[\s]*[-*•]\s+/.test(line);
            const isNumbered = /^[\s]*\d+\.\s+/.test(line);
            const cleaned = line.replace(/^[\s]*[-*•]\s+/, '').replace(/^[\s]*\d+\.\s+/, '');

            // Remplacer **gras** par <strong>
            const parts = cleaned.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                // Code inline `code`
                const codeSegments = part.split(/(`[^`]+`)/g);
                return codeSegments.map((seg, k) => {
                    if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
                        return <code key={`${j}-${k}`} className="bg-gray-200 text-pink-700 px-1 rounded text-sm">{seg.slice(1, -1)}</code>;
                    }
                    return <span key={`${j}-${k}`}>{seg}</span>;
                });
            });

            if (line.trim() === '') {
                return <div key={i} className="h-2" />;
            }
            if (isBullet) {
                return <div key={i} className="flex gap-2 ml-2"><span className="text-blue-500">•</span><span>{parts}</span></div>;
            }
            if (isNumbered) {
                const num = line.match(/^\s*(\d+)\./)?.[1];
                return <div key={i} className="flex gap-2 ml-2"><span className="text-blue-500 font-semibold">{num}.</span><span>{parts}</span></div>;
            }
            return <div key={i}>{parts}</div>;
        });
    };

    if (!exam) return null;

    return (
        <>
            {/* Bouton flottant */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    aria-label="Ouvrir l'assistant IA"
                    className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all p-4"
                >
                    <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                    <span className="hidden sm:inline font-medium pr-2">Assistant IA</span>
                </button>
            )}

            {/* Panneau de chat */}
            {open && (
                <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-3rem)] sm:w-96 max-w-md h-[600px] max-h-[calc(100vh-3rem)] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        <div className="flex items-center gap-2">
                            <Sparkles size={20} />
                            <div>
                                <h3 className="font-semibold text-sm">Tuteur IA</h3>
                                <p className="text-xs opacity-90 truncate">{exam.matiere}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleReset}
                                title="Nouvelle conversation"
                                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <RotateCcw size={16} />
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                title="Fermer"
                                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                                        m.role === 'user'
                                            ? 'bg-blue-500 text-white rounded-br-sm'
                                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                                    }`}
                                >
                                    {renderContent(m.content)}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin text-purple-500" />
                                    <span className="text-sm text-gray-500">Le tuteur réfléchit…</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 bg-white">
                        {!isUserLoggedIn ? (
                            <p className="text-xs text-center text-gray-500 py-2">
                                Connectez-vous pour discuter avec l'IA
                            </p>
                        ) : (
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Pose ta question…"
                                    rows={1}
                                    disabled={loading}
                                    className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 max-h-28 disabled:opacity-50"
                                    style={{ minHeight: '40px' }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        )}
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            L'IA peut faire des erreurs. Vérifie toujours les informations importantes.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
