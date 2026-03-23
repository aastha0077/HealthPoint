import { motion } from "framer-motion";
import { DoctorStats } from "./DoctorStats";
import { PersonnelConsole } from "./PersonnelConsole";
import { CommunicationHub } from "./CommunicationHub";
import { TimelineMatrixCard } from "./TimelineMatrixCard";
import { UnavailabilityControl } from "./UnavailabilityControl";

interface DoctorDashboardTabProps {
    doctorStats: any;
    stats: any;
    totalAppointmentsToday: number;
    appointments: any[];
    imminentAppt: any;
    sessionTimer: string;
    onStart: (id: number) => void;
    onComplete: (id: number) => void;
    conversations: any[];
    // onOpenMessages removed as it's handled via routing now
    onOpenCalendar: () => void;
    unavailableDate: string;
    setUnavailableDate: (date: string) => void;
    isMarkingUnavailable: boolean;
    onMarkUnavailable: () => void;
}

export const DoctorDashboardTab = (props: DoctorDashboardTabProps) => {
    return (
        <motion.div
            key="DASHBOARD"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
        >
            <DoctorStats 
                doctorStats={props.doctorStats} 
                upcomingCount={props.stats.upcoming} 
                todayCount={props.totalAppointmentsToday} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <PersonnelConsole 
                        appointments={props.appointments}
                        imminentAppt={props.imminentAppt}
                        inProgressCount={props.stats.inProgress}
                        sessionTimer={props.sessionTimer}
                        onStart={props.onStart}
                        onComplete={props.onComplete}
                    />
                    <CommunicationHub 
                        conversations={props.conversations}
                    />
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <TimelineMatrixCard 
                        totalAppointmentsToday={props.totalAppointmentsToday}
                        onOpenCalendar={props.onOpenCalendar}
                    />
                    <UnavailabilityControl 
                        unavailableDate={props.unavailableDate}
                        setUnavailableDate={props.setUnavailableDate}
                        isMarkingUnavailable={props.isMarkingUnavailable}
                        onMarkUnavailable={props.onMarkUnavailable}
                    />
                </div>
            </div>
        </motion.div>
    );
};
