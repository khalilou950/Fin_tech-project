'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Send, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/toast';

// Déclaration TypeScript pour l'API Web Speech
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface VoiceTransactionInputProps {
    onTransactionCreated?: () => void;
}

type Language = 'fr-FR' | 'en-US' | 'ar-SA';

const languages = [
    { code: 'fr-FR' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'en-US' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'ar-SA' as Language, name: 'العربية', flag: '🇸🇦' },
];

export default function VoiceTransactionInput({ onTransactionCreated }: VoiceTransactionInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('fr-FR');
    const { addToast } = useToast();

    useEffect(() => {
        // Vérifier si l'API Web Speech est supportée
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                setIsSupported(true);
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = false;
                recognitionInstance.interimResults = false;
                recognitionInstance.lang = selectedLanguage;

                recognitionInstance.onresult = (event: any) => {
                    let text = '';
                    for (let i = 0; i < event.results.length; i++) {
                        text += event.results[i][0].transcript;
                    }
                    setTranscript(text);
                };

                recognitionInstance.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    setIsListening(false);

                    if (event.error === 'no-speech') {
                        addToast('Aucune parole détectée. Veuillez parler plus fort ou réessayer.', 'error');
                    } else if (event.error === 'not-allowed') {
                        addToast('Permission refusée. Veuillez autoriser l\'accès au microphone.', 'error');
                    } else {
                        addToast(`Erreur de reconnaissance vocale: ${event.error}`, 'error');
                    }
                };

                recognitionInstance.onend = () => {
                    setIsListening(false);
                };

                setRecognition(recognitionInstance);
            } else {
                setIsSupported(false);
            }
        }
    }, [selectedLanguage, addToast]);

    const startListening = () => {
        if (recognition) {
            setTranscript('');
            recognition.lang = selectedLanguage; // Mettre à jour la langue
            recognition.start();
            setIsListening(true);
            addToast('🎤 Écoute en cours... Parlez maintenant', 'info');
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    };

    const handleSubmit = async () => {
        if (!transcript.trim()) {
            addToast('Veuillez d\'abord enregistrer une commande vocale', 'error');
            return;
        }

        setIsSubmitting(true);
        console.log('🎤 [VOICE] Début de création de transaction...');
        console.log('🎤 [VOICE] Texte:', transcript);
        console.log('🎤 [VOICE] Langue:', selectedLanguage);

        try {
            const response = await fetch('/api/transactions/create-from-voice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    voiceText: transcript,
                    language: selectedLanguage,
                }),
            });

            const data = await response.json();
            console.log('🎤 [VOICE] Réponse API:', data);

            if (data.success) {
                addToast(`✅ Transaction créée ! ${data.data.transaction.merchant} - ${data.data.transaction.amount} ${data.data.transaction.currency}`, 'success');
                setTranscript('');

                console.log('🎤 [VOICE] Appel du callback onTransactionCreated...');
                console.log('🎤 [VOICE] onTransactionCreated est défini?', typeof onTransactionCreated);

                if (onTransactionCreated) {
                    onTransactionCreated();
                    console.log('🎤 [VOICE] Callback appelé avec succès!');
                } else {
                    console.warn('🎤 [VOICE] ⚠️ Callback onTransactionCreated non défini!');
                }
            } else {
                addToast(data.message || 'Impossible de créer la transaction', 'error');
            }
        } catch (error) {
            console.error('🎤 [VOICE] Error creating transaction:', error);
            addToast('Une erreur est survenue', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearTranscript = () => {
        setTranscript('');
    };

    if (!isSupported) {
        return (
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                        <MicOff className="h-5 w-5" />
                        Saisie Vocale Non Disponible
                    </CardTitle>
                    <CardDescription className="text-orange-700 dark:text-orange-300">
                        Votre navigateur ne supporte pas la reconnaissance vocale.
                        Essayez Chrome, Edge ou Safari pour utiliser cette fonctionnalité.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const getExamplesByLanguage = () => {
        switch (selectedLanguage) {
            case 'fr-FR':
                return [
                    "J'ai acheté du pain avec 50 da",
                    "Dépense de 500 dinars pour le transport",
                    "Revenu de 20000 da salaire",
                    "250 da essence",
                ];
            case 'en-US':
                return [
                    "I bought bread for 50 da",
                    "Spent 500 dinars on transport",
                    "Income of 20000 da salary",
                    "250 da gasoline",
                ];
            case 'ar-SA':
                return [
                    "اشتريت خبز بـ 50 دينار",
                    "مصروف 500 دينار للنقل",
                    "دخل 20000 دينار راتب",
                    "250 دينار وقود",
                ];
            default:
                return [];
        }
    };

    return (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                    <Mic className="h-5 w-5" />
                    Ajouter une Transaction par Vocal
                </CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                    Parlez dans votre langue pour créer une transaction
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Sélecteur de Langue */}
                <div className="flex items-center gap-2 justify-center flex-wrap">
                    <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Langue:</span>
                    {languages.map((lang) => (
                        <Button
                            key={lang.code}
                            variant={selectedLanguage === lang.code ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedLanguage(lang.code)}
                            disabled={isListening || isSubmitting}
                            className={`
                ${selectedLanguage === lang.code
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'hover:bg-purple-100 dark:hover:bg-purple-900'
                                }
              `}
                        >
                            <span className="mr-1">{lang.flag}</span>
                            {lang.name}
                        </Button>
                    ))}
                </div>

                {/* Bouton Microphone */}
                <div className="flex items-center justify-center">
                    <Button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isSubmitting}
                        size="lg"
                        className={`
              relative h-20 w-20 rounded-full transition-all duration-300
              ${isListening
                                ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50'
                                : 'bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/50'
                            }
            `}
                    >
                        {isListening ? (
                            <MicOff className="h-8 w-8 text-white" />
                        ) : (
                            <Mic className="h-8 w-8 text-white" />
                        )}
                    </Button>
                </div>

                {/* Status */}
                <p className="text-center text-sm font-medium text-purple-700 dark:text-purple-300">
                    {isListening ? '🔴 Enregistrement en cours...' : '⚪ Appuyez pour commencer'}
                </p>

                {/* Transcription */}
                {transcript && (
                    <div className="relative rounded-lg bg-white dark:bg-gray-800 p-4 shadow-inner border border-purple-200 dark:border-purple-700">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                                    Transcription :
                                </p>
                                <p className="text-sm text-gray-800 dark:text-gray-200" dir={selectedLanguage === 'ar-SA' ? 'rtl' : 'ltr'}>
                                    {transcript}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearTranscript}
                                className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Bouton Soumettre */}
                {transcript && (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Création en cours...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Créer la Transaction
                            </>
                        )}
                    </Button>
                )}

                {/* Exemples */}
                <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-3 text-xs">
                    <p className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                        💡 Exemples de commandes ({languages.find(l => l.code === selectedLanguage)?.name}) :
                    </p>
                    <ul className="space-y-1 text-purple-700 dark:text-purple-300" dir={selectedLanguage === 'ar-SA' ? 'rtl' : 'ltr'}>
                        {getExamplesByLanguage().map((example, index) => (
                            <li key={index}>• {example}</li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
