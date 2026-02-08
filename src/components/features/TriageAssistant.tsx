'use client';

import { useState } from 'react';
import { Activity, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';

export default function TriageAssistant() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const questions = [
        {
            id: 'consciousness',
            text: 'Is the patient conscious?',
            options: ['Yes', 'No', 'Drowsy/Confused']
        },
        {
            id: 'breathing',
            text: 'How is the breathing?',
            options: ['Normal', 'Fast/Shallow', 'Difficulty Breathing', 'Gasping']
        },
        {
            id: 'pain',
            text: 'Any severe pain?',
            options: ['None', 'Chest Pain', 'Abdominal', 'Headache']
        }
    ];

    const handleAnswer = (option: string) => {
        const currentQ = questions[step];
        setAnswers({ ...answers, [currentQ.id]: option });
        setStep(step + 1);
    };

    const getRecommendation = () => {
        // Basic decision logic stub
        if (answers['consciousness'] === 'No' || answers['breathing'] === 'Gasping') {
            return {
                level: 'CRITICAL',
                color: 'bg-red-600',
                action: 'Call Ambulance immediately. Start CPR if pulse is absent.',
                resource: '/ambulance'
            };
        }
        if (answers['pain'] === 'Chest Pain' || answers['breathing'] === 'Difficulty Breathing') {
            return {
                level: 'HIGH URGENCY',
                color: 'bg-orange-500',
                action: 'Visit nearest Hospital with ICU. Do not drive yourself.',
                resource: '/hospital'
            };
        }
        return {
            level: 'MODERATE',
            color: 'bg-yellow-500',
            action: 'Consult a doctor. Monitor oxygen levels.',
            resource: '/medicine'
        };
    };

    if (step >= questions.length) {
        const result = getRecommendation();
        return (
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm animate-in zoom-in-50">
                <div className={`${result.color} text-white p-4 text-center`}>
                    <AlertTriangle className="mx-auto mb-2" size={32} />
                    <h2 className="text-2xl font-bold uppercase">{result.level}</h2>
                </div>
                <div className="p-6 text-center">
                    <p className="text-lg font-medium text-gray-800 mb-4">{result.action}</p>
                    <a href={result.resource} className="btn btn-primary w-full justify-center">
                        Find {result.resource.replace('/', '')} Now
                    </a>
                    <button
                        onClick={() => { setStep(0); setAnswers({}); }}
                        className="mt-4 text-sm text-gray-500 underline"
                    >
                        Start Over
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-blue-600">
                <Activity size={20} />
                <h2 className="font-bold">AI Triage Assistant</h2>
            </div>

            <div className="mb-6">
                <p className="text-lg font-medium text-gray-900 mb-4">{questions[step].text}</p>
                <div className="grid gap-2">
                    {questions[step].options.map(opt => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className="p-3 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex justify-between group"
                        >
                            {opt}
                            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-1">
                {questions.map((_, idx) => (
                    <div key={idx} className={`h-1 flex-1 rounded-full ${idx <= step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                ))}
            </div>
        </div>
    );
}
