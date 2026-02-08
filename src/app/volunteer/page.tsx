'use client';

import { Award, CheckCircle, MapPin, Truck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function VolunteerPage() {
    const [tasks, setTasks] = useState<{ id: string; title: string; location: string; urgent: boolean; points: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch('/api/volunteer/tasks');
                if (!res.ok) throw new Error('Failed to fetch tasks');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setTasks(data);
                } else {
                    console.error('API response is not an array:', data);
                    setTasks([]);
                }
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Volunteer Dashboard</h1>
                <p className="opacity-90">Thank you for being a hero. You have earned <span className="font-bold text-yellow-300">120 Karma Points</span> this week.</p>

                <div className="flex gap-4 mt-6">
                    <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2">
                        <Award className="text-yellow-300" /> Top 5% Contributor
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2">
                        <CheckCircle className="text-green-300" /> 12 Tasks Completed
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck className="text-blue-600" /> Available Tasks
                    </h2>
                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-gray-500 text-center py-4">Loading tasks...</p>
                        ) : tasks.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No tasks available right now.</p>
                        ) : (
                            tasks.map(task => (
                                <div key={task.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-800">{task.title}</h3>
                                            {task.urgent && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">URGENT</span>}
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <MapPin size={14} /> {task.location}
                                        </p>
                                    </div>
                                    <button className="btn btn-primary text-sm py-1 px-4">Accept (+{task.points})</button>
                                </div>
                            ))
                        )}
                        {/* Static fallback was removed */}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="text-purple-600" /> Leaderboard
                    </h2>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        {[
                            { name: 'Amit Sharma', points: 450, badge: '🚑 Driver' },
                            { name: 'Priya Verma', points: 320, badge: '💊 Pharma' },
                            { name: 'Rohan Das', points: 280, badge: '📦 Logistics' },
                        ].map((user, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-400 w-6">#{idx + 1}</span>
                                    <div>
                                        <p className="font-bold text-gray-900">{user.name}</p>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 rounded-full">{user.badge}</span>
                                    </div>
                                </div>
                                <span className="font-bold text-blue-600">{user.points} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
