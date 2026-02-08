import { Resource } from '@/types';
import { Phone, MapPin, Clock, ThumbsUp, ShieldCheck, Bed, Pill, Home as HomeIcon, Activity } from 'lucide-react';
import clsx from 'clsx';

interface ResourceCardProps {
    resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
    const statusColors: Record<string, string> = {
        AVAILABLE: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        BUSY: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        UNAVAILABLE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        LIMITED: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        ON_CALL: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        ON_LEAVE: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 ease-out p-4 group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{resource.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin size={14} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
                        <span className="truncate">{resource.location.address || 'Location generic'}</span>
                    </p>
                </div>
                <span className={clsx('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border flex-shrink-0', statusColors[resource.status])}>
                    {resource.status}
                </span>
            </div>

            {/* Rich Metadata Section v4.0 */}
            <div className="mb-4 text-sm space-y-3">

                {/* DOCTORS & SPECIALISTS */}
                {(resource.type === 'DOCTOR' || resource.type === 'SPECIALIST') && resource.metadata?.doctor && (
                    <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100/50 dark:border-blue-800/50 text-blue-900 dark:text-blue-100">
                        <div className="font-bold flex justify-between items-center mb-1">
                            <span>{resource.metadata.doctor.specialty}</span>
                            <span className="text-xs bg-white/50 dark:bg-white/10 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-200 font-mono">{resource.metadata.doctor.experienceYears}y Exp</span>
                        </div>
                        <div className="text-xs text-blue-700/80 dark:text-blue-200/80">
                            {resource.metadata.doctor.qualification} • {resource.metadata.doctor.hospitalAffiliation || 'Private Practice'}
                        </div>
                        {resource.metadata.doctor.nextAvailableSlot && (
                            <div className="mt-2 text-xs flex items-center gap-1 text-blue-600 font-medium">
                                <Clock size={12} />
                                Next: {resource.metadata.doctor.nextAvailableSlot}
                            </div>
                        )}
                    </div>
                )}

                {/* PATHOLOGY */}
                {resource.type === 'PATHOLOGY' && resource.metadata?.labTests && (
                    <div className="space-y-1.5">
                        {resource.metadata.labTests.slice(0, 2).map((test, i) => (
                            <div key={i} className="flex justify-between items-center bg-purple-50/50 px-2.5 py-1.5 rounded-lg text-xs text-purple-900 border border-purple-100/50">
                                <span className="font-medium">{test.name}</span>
                                <span className="font-bold bg-white/50 px-1 rounded">⏱ {test.turnaroundTime}</span>
                            </div>
                        ))}
                        {resource.metadata.labTests.length > 2 && <div className="text-[10px] text-center text-gray-400 font-medium">+{resource.metadata.labTests.length - 2} more tests</div>}
                    </div>
                )}

                {/* EQUIPMENT */}
                {resource.type === 'EQUIPMENT' && resource.metadata?.equipment && (
                    <div className="flex flex-wrap gap-1.5">
                        {resource.metadata.equipment.map((eq, i) => (
                            <span key={i} className="bg-orange-50 text-orange-800 text-xs px-2 py-1 rounded-md border border-orange-100 font-medium">
                                🩼 {eq.type} {eq.isRental && <span className="opacity-75 text-[10px] ml-1">(Rental)</span>}
                            </span>
                        ))}
                    </div>
                )}

                {/* BLOOD BANK (v4) */}
                {resource.type === 'BLOOD_BANK' && resource.metadata?.bloodStock && (
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                        {Object.entries(resource.metadata.bloodStock.groups).map(([grp, qty]) => (
                            qty > 0 && <span key={grp} className={clsx("rounded-md py-1 border font-bold flex flex-col justify-center",
                                qty < 5 ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100"
                            )}>
                                <span className="text-[10px] opacity-70 mb-0.5">{grp}</span>
                                <span>{qty}</span>
                            </span>
                        ))}
                    </div>
                )}

                {/* OXYGEN (v4) */}
                {resource.type === 'OXYGEN' && resource.metadata?.oxygenType && (
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${resource.metadata.oxygenType === 'REFILL' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                <Activity size={14} />
                            </div>
                            <span className="text-xs font-bold text-gray-700">{resource.metadata.oxygenType}</span>
                        </div>
                        {resource.metadata.operatingHours && <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><Clock size={12} /> {resource.metadata.operatingHours}</span>}
                    </div>
                )}

                {/* AMBULANCE (v4) */}
                {resource.type === 'AMBULANCE' && resource.metadata?.ambulanceType && (
                    <div className="flex justify-between items-center mt-2 bg-yellow-50 dark:bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-100/50 dark:border-yellow-800/50">
                        <div className="flex items-center gap-2.5">
                            <span className="w-9 h-9 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center text-lg shadow-sm">🚑</span>
                            <div>
                                <div className="text-xs font-bold text-yellow-900 dark:text-yellow-100">{resource.metadata.ambulanceType}</div>
                                <div className="text-[10px] text-yellow-700/80 dark:text-yellow-200/80 font-medium uppercase tracking-wide">Ambulance Type</div>
                            </div>
                        </div>
                        <div className="text-right bg-white/50 dark:bg-white/10 px-2 py-1 rounded-lg">
                            <div className="text-sm font-black text-gray-800 dark:text-white tabular-nums">
                                {resource.distance ? Math.ceil(resource.distance * 1.5) : Math.floor(Math.random() * 15) + 5}<span className="text-[10px] font-normal text-gray-500 dark:text-gray-300 ml-0.5">min</span>
                            </div>
                            <div className="text-[9px] text-gray-400 dark:text-gray-400 font-bold uppercase tracking-wider">ETA</div>
                        </div>
                    </div>
                )}

                {/* SHELTER (v4) */}
                {resource.type === 'SHELTER' && resource.metadata?.shelter && (
                    <div className="mt-2 space-y-2.5">
                        {/* Capacity Bar */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                                <span>Occupancy</span>
                                <span>{Math.round((resource.metadata.shelter.occupancy / resource.metadata.shelter.capacity) * 100)}%</span>
                            </div>
                            <div className="bg-gray-100 rounded-full h-1.5 w-full overflow-hidden">
                                <div
                                    className={clsx("h-full rounded-full transition-all duration-500",
                                        (resource.metadata.shelter.occupancy / resource.metadata.shelter.capacity) > 0.9 ? "bg-red-500" : "bg-green-500"
                                    )}
                                    style={{ width: `${Math.min((resource.metadata.shelter.occupancy / resource.metadata.shelter.capacity) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-600">
                            <span className="font-bold flex items-center gap-1"><HomeIcon size={12} className="text-gray-400" /> {resource.metadata.shelter.occupancy} / {resource.metadata.shelter.capacity}</span>
                            {resource.metadata.shelter.petFriendly && <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">🐾 Pet Friendly</span>}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {resource.metadata.shelter.facilities.map((f, i) => (
                                <span key={i} className="text-[10px] bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-medium">
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- Legacy Support (Hospital) --- */}
                {resource.type === 'HOSPITAL' && resource.metadata?.hospital && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-800 rounded-lg p-2 text-center">
                            <div className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase tracking-wider mb-0.5">General</div>
                            <div className="text-sm font-black text-blue-700 dark:text-blue-100 flex items-center justify-center gap-1">
                                <Bed size={14} className="text-blue-400 dark:text-blue-300" /> {resource.metadata.hospital.beds.general}
                            </div>
                        </div>
                        <div className="bg-red-50/50 dark:bg-red-500/10 border border-red-100 dark:border-red-800 rounded-lg p-2 text-center">
                            <div className="text-[10px] text-red-600 dark:text-red-300 font-bold uppercase tracking-wider mb-0.5">ICU + Vent</div>
                            <div className="text-sm font-black text-red-700 dark:text-red-100 flex items-center justify-center gap-1">
                                <Activity size={14} className="text-red-400 dark:text-red-300" /> {resource.metadata.hospital.beds.icu + resource.metadata.hospital.beds.ventilator}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-300 mb-4 pt-3 border-t border-gray-50 dark:border-gray-700">
                {(resource.verificationLevel === 'OFFICIAL_PARTNER' || resource.verificationLevel === 'NGO') && (
                    <span className="bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md font-bold border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified
                    </span>
                )}
                {resource.verificationLevel === 'GOVERNMENT' && (
                    <span className="bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md font-bold border border-purple-100 dark:border-purple-800 flex items-center gap-1">
                        <ShieldCheck size={12} /> Govt
                    </span>
                )}
                {!['OFFICIAL_PARTNER', 'NGO', 'GOVERNMENT'].includes(resource.verificationLevel) && (
                    <span className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-2 py-1 rounded-md font-medium border border-gray-100 dark:border-slate-700 flex items-center gap-1">
                        Unverified
                    </span>
                )}

                <span className="flex items-center gap-1 ml-auto opacity-60" title="Last Updated">
                    <Clock size={12} />
                    {new Date(resource.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <a href={`tel:${resource.contact.phone}`} className="flex-1 btn bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-white hover:text-gray-900 text-sm font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                    <Phone size={16} className="text-gray-400 dark:text-slate-400" />
                    Call
                </a>
                <a
                    href={`https://wa.me/${resource.contact.whatsapp || resource.contact.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-green-500/20 flex items-center justify-center gap-2 border border-transparent"
                >
                    Chat
                    <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded text-white ml-0.5">WhatsApp</span>
                </a>
            </div>
        </div>
    );
}
