import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import { apiClient } from "@/apis/apis";
import toast from "react-hot-toast";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AppointmentTable } from "@/components/admin/AppointmentTable";
import { DoctorManagement } from "@/components/admin/DoctorManagement";
import { UserPatientManagement } from "@/components/admin/UserPatientManagement";
import { DepartmentView } from "@/components/admin/DepartmentView";
import { PaymentTable } from "@/components/admin/PaymentTable";
import { Dashboard } from "@/components/admin/Dashboard";
import { RefundManagement } from "@/components/admin/RefundManagement";

export function AdminPanel() {
    const { pathname } = useLocation();
    const currentTab = pathname.split("/").pop()?.toUpperCase() || "DASHBOARD";

    const [appointments, setAppointments] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [deptFilter, setDeptFilter] = useState("ALL");

    const [doctorForm, setDoctorForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        speciality: "",
        departmentId: 1,
        bio: "",
        timeSlots: "09:00,10:00,11:00",
        profilePicture: ""
    });
    const [departments, setDepartments] = useState<any[]>([]);

    const fetchAdminData = async () => {
        try {
            const [aptRes, userRes, patientRes, docRes] = await Promise.all([
                apiClient.get("/api/appointments"),
                apiClient.get("/api/user/all"),
                apiClient.get("/api/patients/all"),
                apiClient.get("/api/doctors/1/100")
            ]);
            setAppointments(aptRes.data.appointments || []);
            setUsers(userRes.data);
            setPatients(patientRes.data);
            setDoctors(docRes.data.doctors || []);
        } catch {
            toast.error("Failed to load administration data");
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await apiClient.get("/api/departments");
            setDepartments(res.data || []);
            if (res.data?.length > 0) {
                setDoctorForm(prev => ({ ...prev, departmentId: res.data[0].id }));
            }
        } catch {
            console.error("Failed to fetch departments");
        }
    };

    useEffect(() => {
        fetchAdminData();
        fetchDepartments();
    }, []);

    const handleDoctorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const rawSlots = doctorForm.timeSlots;
            const timeSlots = Array.isArray(rawSlots)
                ? rawSlots
                : (rawSlots || "").split(",").map((t: string) => t.trim()).filter(Boolean);
            await apiClient.post("/api/doctors", {
                ...doctorForm,
                departmentId: Number(doctorForm.departmentId),
                timeSlots
            });
            toast.success("Doctor added successfully!");
            const defaultSlots = ["09:00", "10:00", "11:00"];
            setDoctorForm({
                ...doctorForm,
                firstName: "", lastName: "", email: "", password: "", speciality: "",
                bio: "", profilePicture: "",
                departmentId: departments[0]?.id || 1,
                timeSlots: defaultSlots.join(",")
            });
            fetchAdminData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add doctor");
        }
    };

    const handleExportPDF = async (title: string, columns: string[], data: any[]) => {
        try {
            const res = await apiClient.post("/api/pdf/table-export", 
                { title, columns, data }, 
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, "_")}_export.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`${title} exported successfully`);
        } catch {
            toast.error("Failed to export PDF");
        }
    };

    const downloadInvoice = async (id: number) => {
        try {
            const res = await apiClient.get(`/api/pdf/invoice/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_hp_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            toast.error("Failed to download invoice");
        }
    };

    const handleDelete = async (type: string, id: number) => {
        try {
            await apiClient.delete(`/api/admin/${type}/${id}`);
            toast.success("Deleted successfully");
            fetchAdminData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete");
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar
                setSearch={setSearch}
            />

            <main className="flex-1 overflow-auto">
                <div className="p-4 max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                        <div>
                            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                                {currentTab === 'DASHBOARD' ? "Executive Overview" : `${currentTab.charAt(0) + currentTab.slice(1).toLowerCase()} Management`}
                            </h1>
                            <p className="text-slate-400 mt-0.5 text-[10px] font-bold uppercase tracking-widest">
                                {currentTab === 'DASHBOARD' ? "System and healthcare metrics" : `Control center for managing ${currentTab.toLowerCase()}.`}
                            </p>
                        </div>
                    </div>

                    <Routes>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={
                            <Dashboard
                                users={users}
                                patients={patients}
                                doctors={doctors}
                                appointments={appointments}
                                departments={departments}
                            />
                        } />
                        <Route path="appointments" element={
                            <AppointmentTable
                                appointments={appointments}
                                search={search}
                                setSearch={setSearch}
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                deptFilter={deptFilter}
                                setDeptFilter={setDeptFilter}
                                departments={departments}
                                onDelete={(id: number) => handleDelete('appointments', id)}
                                onExport={() => handleExportPDF("Appointments", ["ID", "Patient", "Doctor", "Date", "Status"], appointments.map(a => ({
                                    id: a.appointmentNumber,
                                    patient: `${a.patient.firstName} ${a.patient.lastName}`,
                                    doctor: `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}`,
                                    date: new Date(a.dateTime).toLocaleDateString(),
                                    status: a.status
                                })))}
                                onDownloadInvoice={downloadInvoice}
                            />
                        } />
                        <Route path="doctors" element={
                            <DoctorManagement
                                allDoctors={doctors}
                                search={search}
                                setSearch={setSearch}
                                doctorForm={doctorForm}
                                setDoctorForm={setDoctorForm}
                                departments={departments}
                                handleDoctorSubmit={handleDoctorSubmit}
                                onDelete={(id: number) => handleDelete('doctors', id)}
                                onExport={() => handleExportPDF("Doctor Registry", ["ID", "Name", "Speciality", "Email"], doctors.map(d => ({
                                    id: d.doctorId,
                                    name: `${d.firstName} ${d.lastName}`,
                                    speciality: d.speciality,
                                    email: d.email
                                })))}
                            />
                        } />
                        <Route path="users" element={
                            <UserPatientManagement
                                tab="USERS"
                                search={search}
                                setSearch={setSearch}
                                users={users}
                                patients={patients}
                                onDelete={handleDelete}
                                onExport={() => handleExportPDF("User Directory", ["ID", "Name", "Email", "Role"], users.map(u => ({
                                    id: u.id,
                                    name: `${u.firstName} ${u.lastName}`,
                                    email: u.email,
                                    role: u.role
                                })))}
                            />
                        } />
                        <Route path="patients" element={
                            <UserPatientManagement
                                tab="PATIENTS"
                                search={search}
                                setSearch={setSearch}
                                users={users}
                                patients={patients}
                                onDelete={handleDelete}
                                onExport={() => handleExportPDF("Patient Records", ["ID", "Name", "Gender", "Location"], patients.map(p => ({
                                    id: p.id,
                                    name: `${p.firstName} ${p.lastName}`,
                                    gender: p.gender,
                                    location: `${p.municipality}, ${p.district}`
                                })))}
                            />
                        } />
                        <Route path="departments" element={<DepartmentView onExport={() => handleExportPDF("Medical Departments", ["ID", "Name", "Description"], departments.map(d => ({ id: d.id, name: d.name, description: d.description })))} />} />
                        <Route path="payments" element={
                            <PaymentTable
                                appointments={appointments}
                                search={search}
                                setSearch={setSearch}
                                onExport={() => handleExportPDF("Payment Ledger", ["Transaction", "Patient", "Method", "Amount", "Status"], appointments.filter(a => a.payment).map(a => ({
                                    transaction: a.payment.transactionId || 'N/A',
                                    patient: `${a.patient.firstName} ${a.patient.lastName}`,
                                    method: a.payment.method,
                                    amount: `Rs. ${a.doctor.fee || 500}`,
                                    status: a.payment.status
                                })))}
                            />
                        } />
                        <Route path="refunds" element={
                            <RefundManagement search={search} setSearch={setSearch} />
                        } />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
