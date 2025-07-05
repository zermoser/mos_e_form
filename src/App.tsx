import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  LogOut,
  User,
  MapPin,
  FileText,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CalendarCheck,
  Bookmark,
  BarChart2,
  Loader,
} from 'lucide-react';

// Types
interface AttendanceRecord {
  id: string;
  fullName: string;
  date: string;
  status: 'มา' | 'ขาด' | 'สาย' | 'ลา';
  reason?: string;
  timestamp: string;
}

interface LeaveRequest {
  id: string;
  fullName: string;
  leaveDate: string;
  endDate?: string;
  reason: string;
  timestamp: string;
  status: 'รอดำเนินการ' | 'อนุมัติ' | 'ปฏิเสธ';
}

interface RoomBooking {
  id: string;
  fullName: string;
  room: string;
  date: string;
  time: string;
  purpose: string;
  timestamp: string;
}

interface User {
  username: string;
  role: 'admin' | 'user';
  displayName: string;
}

// Mock data storage
const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: '1', fullName: 'สมชาย ใจดี', date: '2025-07-15', status: 'มา', timestamp: '2025-07-15T09:00:00Z' },
  { id: '2', fullName: 'สุนีย์ สุขใจ', date: '2025-07-15', status: 'สาย', timestamp: '2025-07-15T09:15:00Z' },
  { id: '3', fullName: 'ประเสริฐ ตั้งใจเรียน', date: '2025-07-15', status: 'ลา', reason: 'พบแพทย์', timestamp: '2025-07-15T08:30:00Z' }
];

const MOCK_LEAVES: LeaveRequest[] = [
  { id: '1', fullName: 'นภา สวยงาม', leaveDate: '2025-07-20', reason: 'เหตุฉุกเฉินในครอบครัว', timestamp: '2025-07-14T10:00:00Z', status: 'รอดำเนินการ' },
  { id: '2', fullName: 'วีระชัย กล้าหาญ', leaveDate: '2025-07-18', reason: 'พบแพทย์', timestamp: '2025-07-13T14:30:00Z', status: 'อนุมัติ' }
];

const MOCK_BOOKINGS: RoomBooking[] = [
  { id: '1', fullName: 'ธนวัฒน์ พัฒนา', room: 'ห้อง A', date: '2025-07-16', time: '14:00', purpose: 'ประชุมทีม', timestamp: '2025-07-15T11:00:00Z' },
  { id: '2', fullName: 'อรุณี สว่างใจ', room: 'ห้อง B', date: '2025-07-17', time: '10:00', purpose: 'นำเสนองาน', timestamp: '2025-07-15T12:00:00Z' }
];

const ROOMS = ['ห้อง A', 'ห้อง B', 'ห้อง C', 'ห้องประชุมใหญ่', 'ห้องปฏิบัติการ 1', 'ห้องปฏิบัติการ 2'];

// Utility functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  return `${hour}:${minutes} น.`;
};

const getCurrentDateTime = () => {
  const now = new Date();
  const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
  return {
    date: thaiTime.toISOString().split('T')[0],
    time: `${thaiTime.getHours().toString().padStart(2, '0')}:${thaiTime.getMinutes().toString().padStart(2, '0')}`,
    timestamp: thaiTime.toISOString()
  };
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Components
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}> = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '', icon }) => {
  const baseClasses = 'px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 justify-center text-sm';
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-sm hover:shadow-md',
    secondary: 'bg-white text-gray-800 hover:bg-gray-50 disabled:bg-gray-100 border border-gray-300 shadow-sm hover:shadow-md',
    danger: 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 disabled:opacity-50 shadow-sm hover:shadow-md',
    success: 'bg-gradient-to-r from-green-600 to-teal-500 text-white hover:from-green-700 hover:to-teal-600 disabled:opacity-50 shadow-sm hover:shadow-md',
    outline: 'bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

const Input: React.FC<{
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}> = ({ label, type = 'text', value, onChange, required = false, className = '', placeholder }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
  );
};

const Select: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
}> = ({ label, value, onChange, options, required = false, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiYjMzg7NmNhNjQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[right_0.75rem_center]"
      >
        <option value="">เลือก {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const TextArea: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}> = ({ label, value, onChange, required = false, className = '', placeholder }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
  );
};

const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
};

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

const statusStyles: Record<string, string> = {
  'มา': 'bg-green-100 text-green-800',
  'สาย': 'bg-yellow-100 text-yellow-800',
  'ขาด': 'bg-red-100 text-red-800',
  'ลา': 'bg-blue-100 text-blue-800',
  'รอดำเนินการ': 'bg-gray-100 text-gray-800',
  'อนุมัติ': 'bg-green-100 text-green-800',
  'ปฏิเสธ': 'bg-red-100 text-red-800'
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const badgeClass = statusStyles[status] ?? 'bg-gray-200 text-gray-700';
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
      {status}
    </span>
  );
};

// Main App Component
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Data states
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVES);
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>(MOCK_BOOKINGS);

  const [leaveForm, setLeaveForm] = useState({
    fullName: '',
    leaveDate: '',
    endDate: '',
    reason: ''
  });

  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    room: '',
    date: '',
    time: '',
    purpose: ''
  });

  const [adminFilters, setAdminFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login Component
  const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoggingIn(true);

      // Simulate API call
      setTimeout(() => {
        // Mock authentication
        if (username === 'admin' && password === 'admin123') {
          setCurrentUser({
            username,
            role: 'admin',
            displayName: 'ผู้ดูแลระบบ'
          });
          setCurrentPage('dashboard');
        } else if (username === 'user' && password === 'user123') {
          setCurrentUser({
            username,
            role: 'user',
            displayName: 'สมชาย ใจดี'
          });
          setCurrentPage('attendance');
        } else {
          setError('ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
        }
        setIsLoggingIn(false);
      }, 800);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
            <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold mb-1">ระบบจัดการโรงเรียน</h1>
            <p className="opacity-90">ระบบบันทึกการเข้าโรงเรียนและการจองห้อง</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleLogin}>
              <Input
                label="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="กรอกชื่อผู้ใช้ของคุณ"
              />
              <Input
                label="รหัสผ่าน"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="กรอกรหัสผ่านของคุณ"
              />
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <span className="flex items-center justify-center">
                    <Loader className="animate-spin mr-2" size={16} />
                    กำลังเข้าสู่ระบบ...
                  </span>
                ) : (
                  <>
                    <User size={16} />
                    เข้าสู่ระบบ
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-sm text-gray-600 border-t pt-4">
              <p className="font-medium text-center mb-1">ข้อมูลทดสอบ:</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <p className="font-medium">ผู้ดูแลระบบ</p>
                  <p>admin / admin123</p>
                </div>
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <p className="font-medium">ผู้ใช้งาน</p>
                  <p>user / user123</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Navigation Component
  const Navigation = () => {
    const navItems = [
      { id: 'attendance', label: 'บันทึกการเข้าโรงเรียน', icon: UserCheck },
      { id: 'leave', label: 'การลางาน', icon: CalendarCheck },
      { id: 'booking', label: 'การจองห้อง', icon: Bookmark },
      ...(currentUser?.role === 'admin' ? [{ id: 'dashboard', label: 'แดชบอร์ด', icon: BarChart2 }] : [])
    ];

    return (
      <>
        {/* Mobile menu button */}
        {!sidebarOpen && (
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <Button
              onClick={() => setSidebarOpen(true)}
              variant="secondary"
              className="p-2 shadow"
            >
              <Menu size={20} />
            </Button>
          </div>
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-700 to-purple-800 shadow-lg transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-5 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">ระบบจัดการโรงเรียน</h2>
              <Button
                onClick={() => setSidebarOpen(false)}
                variant="outline"
                className="p-1 lg:hidden border-white text-white"
              >
                <X size={16} />
              </Button>
            </div>
            <p className="text-sm opacity-90 mt-1">ยินดีต้อนรับ, {currentUser?.displayName}</p>
          </div>

          <nav className="p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${currentPage === item.id
                    ? 'bg-white text-indigo-700 font-medium shadow'
                    : 'text-indigo-100 hover:bg-indigo-600'
                    }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={() => {
                setCurrentUser(null);
                setCurrentPage('login');
              }}
              variant="outline"
              className="w-full border-white text-white hover:bg-indigo-600"
            >
              <LogOut size={16} />
              ออกจากระบบ
            </Button>
          </div>
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </>
    );
  };

  // Dashboard Stats Card
  const StatsCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    className?: string;
  }> = ({ title, value, icon, color, className = '' }) => {
    return (
      <div className={`bg-white rounded-2xl shadow p-5 flex items-center ${className}`}>
        <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    );
  };

  // Attendance Page - Simplified with single button
  const AttendancePage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastCheckIn, setLastCheckIn] = useState<AttendanceRecord | null>(null);

    const handleCheckIn = () => {
      setIsSubmitting(true);

      const { date, timestamp } = getCurrentDateTime();

      // Simulate API call
      setTimeout(() => {
        const newRecord: AttendanceRecord = {
          id: generateId(),
          fullName: currentUser?.displayName || 'Unknown',
          date: date,
          status: 'มา',
          timestamp: timestamp
        };

        setAttendanceRecords([...attendanceRecords, newRecord]);
        setLastCheckIn(newRecord);

        setSuccessMessage('บันทึกการเข้าโรงเรียนสำเร็จแล้ว!');
        setShowSuccessModal(true);
        setIsSubmitting(false);
      }, 800);
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserCheck className="text-indigo-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">บันทึกการเข้าโรงเรียน</h1>
          <p className="text-gray-600">บันทึกการเข้าโรงเรียนประจำวันของคุณ</p>
        </div>

        <Card className="border border-gray-200 text-center p-10">
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-800 mb-1">ข้อมูลผู้ใช้</p>
            <p className="text-gray-700">{currentUser?.displayName}</p>
            <p className="text-sm text-gray-500 mt-2">
              {formatDate(getCurrentDateTime().date)} {getCurrentDateTime().time}
            </p>
          </div>

          <Button
            onClick={handleCheckIn}
            className="w-full max-w-xs mx-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin mr-2" size={16} />
                กำลังบันทึก...
              </span>
            ) : (
              <>
                <CheckCircle size={16} />
                เช็คอินเข้าโรงเรียน
              </>
            )}
          </Button>

          {lastCheckIn && (
            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-green-700 font-medium">
                เช็คอินล่าสุดเมื่อ: {formatDate(lastCheckIn.date)} {formatTime(lastCheckIn.timestamp.split('T')[1].substring(0, 5))}
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // Leave Request Page
  const LeavePage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        const newLeave: LeaveRequest = {
          id: generateId(),
          fullName: currentUser?.displayName || '',
          leaveDate: leaveForm.leaveDate,
          endDate: leaveForm.endDate || undefined,
          reason: leaveForm.reason,
          timestamp: new Date().toISOString(),
          status: 'รอดำเนินการ'
        };

        setLeaveRequests([...leaveRequests, newLeave]);
        setLeaveForm({
          fullName: '',
          leaveDate: '',
          endDate: '',
          reason: ''
        });

        setSuccessMessage('ส่งคำขอลางานสำเร็จแล้ว!');
        setShowSuccessModal(true);
        setIsSubmitting(false);
      }, 800);
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="text-blue-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">การลางาน</h1>
          <p className="text-gray-600">ส่งคำขอลางานของคุณ</p>
        </div>

        <Card className="border border-gray-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl mb-4">
              <p className="font-medium text-gray-800">ผู้ส่งคำขอ: {currentUser?.displayName}</p>
            </div>

            <Input
              label="วันที่เริ่มลา"
              type="date"
              value={leaveForm.leaveDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveDate: e.target.value })}
              required
            />

            <Input
              label="วันที่สิ้นสุดการลา (ไม่จำเป็น)"
              type="date"
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              placeholder="เว้นว่างไว้สำหรับลาเพียงวันเดียว"
            />

            <TextArea
              label="เหตุผลการลา"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              required
              placeholder="กรุณาระบุเหตุผลการลาของคุณ"
              className="md:col-span-2"
            />

            <div className="md:col-span-2 mt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader className="animate-spin mr-2" size={16} />
                    กำลังส่งคำขอ...
                  </span>
                ) : (
                  <>
                    <FileText size={16} />
                    ส่งคำขอลา
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  };

  // Room Booking Page
  const BookingPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availabilityCheck, setAvailabilityCheck] = useState<{ available: boolean; message: string } | null>(null);

    const checkAvailability = () => {
      if (!bookingForm.room || !bookingForm.date || !bookingForm.time) {
        setAvailabilityCheck({
          available: false,
          message: 'กรุณาเลือกห้อง วันที่ และเวลา'
        });
        return;
      }

      const isBooked = roomBookings.some(booking =>
        booking.room === bookingForm.room &&
        booking.date === bookingForm.date &&
        booking.time === bookingForm.time
      );

      setAvailabilityCheck({
        available: !isBooked,
        message: isBooked ? 'ห้องไม่ว่างในช่วงเวลานี้' : 'ห้องว่าง!'
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        const isBooked = roomBookings.some(booking =>
          booking.room === bookingForm.room &&
          booking.date === bookingForm.date &&
          booking.time === bookingForm.time
        );

        if (isBooked) {
          setAvailabilityCheck({
            available: false,
            message: 'ห้องไม่ว่างในช่วงเวลานี้!'
          });
          setIsSubmitting(false);
          return;
        }

        const newBooking: RoomBooking = {
          id: generateId(),
          fullName: currentUser?.displayName || '',
          room: bookingForm.room,
          date: bookingForm.date,
          time: bookingForm.time,
          purpose: bookingForm.purpose,
          timestamp: new Date().toISOString()
        };

        setRoomBookings([...roomBookings, newBooking]);
        setBookingForm({
          fullName: '',
          room: '',
          date: '',
          time: '',
          purpose: ''
        });
        setAvailabilityCheck(null);

        setSuccessMessage('จองห้องสำเร็จแล้ว!');
        setShowSuccessModal(true);
        setIsSubmitting(false);
      }, 800);
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Bookmark className="text-purple-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">การจองห้อง</h1>
          <p className="text-gray-600">จองห้องเรียนหรือห้องประชุม</p>
        </div>

        <Card className="border border-gray-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl mb-4">
              <p className="font-medium text-gray-800">ผู้จอง: {currentUser?.displayName}</p>
            </div>

            <Select
              label="ห้อง"
              value={bookingForm.room}
              onChange={(e) => setBookingForm({ ...bookingForm, room: e.target.value })}
              options={ROOMS.map(room => ({ value: room, label: room }))}
              required
            />

            <Input
              label="วันที่จอง"
              type="date"
              value={bookingForm.date}
              onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
              required
            />

            <Input
              label="เวลา"
              type="time"
              value={bookingForm.time}
              onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
              required
            />

            <div className="md:col-span-2">
              <Button
                type="button"
                onClick={checkAvailability}
                variant="secondary"
                className="w-full"
              >
                <Clock size={16} />
                ตรวจสอบความพร้อม
              </Button>
              {availabilityCheck && (
                <div className={`mt-3 p-3 rounded-xl text-center ${availabilityCheck.available ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {availabilityCheck.message}
                </div>
              )}
            </div>

            <TextArea
              label="วัตถุประสงค์"
              value={bookingForm.purpose}
              onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
              required
              placeholder="อธิบายวัตถุประสงค์ในการจอง"
              className="md:col-span-2"
            />

            <div className="md:col-span-2 mt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader className="animate-spin mr-2" size={16} />
                    กำลังจอง...
                  </span>
                ) : (
                  <>
                    <MapPin size={16} />
                    จองห้อง
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  };

  // Admin Dashboard
  const DashboardPage = () => {
    const exportToExcel = () => {
      setIsLoading(true);

      // Create Excel content
      let csvContent = "data:text/csv;charset=utf-8,";

      // Attendance data
      csvContent += "บันทึกการเข้าโรงเรียน\n";
      csvContent += "ID,ชื่อ-นามสกุล,วันที่,สถานะ,เหตุผล,เวลาบันทึก\n";
      attendanceRecords.forEach(record => {
        csvContent += `${record.id},${record.fullName},${record.date},${record.status},${record.reason || ''},${record.timestamp}\n`;
      });

      // Leave requests
      csvContent += "\nการลางาน\n";
      csvContent += "ID,ชื่อ-นามสกุล,วันที่เริ่มลา,วันที่สิ้นสุด,เหตุผล,สถานะ,เวลาบันทึก\n";
      leaveRequests.forEach(leave => {
        csvContent += `${leave.id},${leave.fullName},${leave.leaveDate},${leave.endDate || ''},${leave.reason},${leave.status},${leave.timestamp}\n`;
      });

      // Room bookings
      csvContent += "\nการจองห้อง\n";
      csvContent += "ID,ชื่อ-นามสกุล,ห้อง,วันที่,เวลา,วัตถุประสงค์,เวลาบันทึก\n";
      roomBookings.forEach(booking => {
        csvContent += `${booking.id},${booking.fullName},${booking.room},${booking.date},${booking.time},${booking.purpose},${booking.timestamp}\n`;
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `school-data-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);

      setIsLoading(false);
      setSuccessMessage('ส่งออกข้อมูลสำเร็จแล้ว!');
      setShowSuccessModal(true);
    };

    const getAttendanceSummary = () => {
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = attendanceRecords.filter(record => record.date === today);

      return {
        present: todayRecords.filter(r => r.status === 'มา').length,
        absent: todayRecords.filter(r => r.status === 'ขาด').length,
        late: todayRecords.filter(r => r.status === 'สาย').length,
        leave: todayRecords.filter(r => r.status === 'ลา').length
      };
    };

    const summary = getAttendanceSummary();

    // Filter bookings based on date range
    const filteredBookings = adminFilters.startDate && adminFilters.endDate
      ? roomBookings.filter(booking =>
        booking.date >= adminFilters.startDate &&
        booking.date <= adminFilters.endDate
      )
      : roomBookings;

    const toggleSection = (section: string) => {
      setActiveSection(activeSection === section ? '' : section);
    };

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">แดชบอร์ดผู้ดูแล</h1>
            <p className="text-gray-600">ภาพรวมการเข้าโรงเรียนและการจองห้อง</p>
          </div>
          <Button
            onClick={exportToExcel}
            variant="primary"
            disabled={isLoading}
            icon={<Download size={16} />}
          >
            {isLoading ? 'กำลังส่งออก...' : 'ส่งออกเป็น Excel'}
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title="มาโรงเรียนวันนี้"
            value={summary.present}
            icon={<UserCheck className="text-green-600" size={24} />}
            color="bg-green-100"
          />
          <StatsCard
            title="ขาดโรงเรียนวันนี้"
            value={summary.absent}
            icon={<XCircle className="text-red-600" size={24} />}
            color="bg-red-100"
          />
          <StatsCard
            title="สายวันนี้"
            value={summary.late}
            icon={<AlertCircle className="text-yellow-600" size={24} />}
            color="bg-yellow-100"
          />
          <StatsCard
            title="ลาวันนี้"
            value={summary.leave}
            icon={<Calendar className="text-blue-600" size={24} />}
            color="bg-blue-100"
          />
        </div>

        {/* Date Range Filter */}
        <Card className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">กรองข้อมูล</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="วันที่เริ่มต้น"
              type="date"
              value={adminFilters.startDate}
              onChange={(e) => setAdminFilters({ ...adminFilters, startDate: e.target.value })}
              className="mb-0"
            />
            <Input
              label="วันที่สิ้นสุด"
              type="date"
              value={adminFilters.endDate}
              onChange={(e) => setAdminFilters({ ...adminFilters, endDate: e.target.value })}
              className="mb-0"
            />
            <div className="flex items-end gap-2 md:col-span-2">
              <Button
                onClick={() => setAdminFilters({ startDate: '', endDate: '' })}
                variant="secondary"
                className="flex-1"
              >
                ล้างตัวกรอง
              </Button>
              <Button
                onClick={() => {
                  // Apply filters
                }}
                variant="primary"
                className="flex-1"
              >
                ใช้ตัวกรอง
              </Button>
            </div>
          </div>
        </Card>

        {/* Collapsible Sections */}
        <div className="space-y-6">
          {/* Recent Attendance */}
          <Card>
            <div
              className="flex justify-between items-center cursor-pointer p-4"
              onClick={() => toggleSection('attendance')}
            >
              <h3 className="text-lg font-semibold text-gray-800">การเข้าโรงเรียนล่าสุด</h3>
              {activeSection === 'attendance' ? <ChevronUp /> : <ChevronDown />}
            </div>

            {activeSection === 'attendance' && (
              <div className="border-t pt-4 px-4 pb-2">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceRecords.slice(-5).map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{record.fullName}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(record.date)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={record.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>

          {/* Recent Bookings */}
          <Card>
            <div
              className="flex justify-between items-center cursor-pointer p-4"
              onClick={() => toggleSection('bookings')}
            >
              <h3 className="text-lg font-semibold text-gray-800">การจองห้องล่าสุด</h3>
              {activeSection === 'bookings' ? <ChevronUp /> : <ChevronDown />}
            </div>

            {activeSection === 'bookings' && (
              <div className="border-t pt-4 px-4 pb-2">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ห้อง</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่และเวลา</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จองโดย</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วัตถุประสงค์</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.slice(-5).map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{booking.room}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(booking.date)} เวลา {formatTime(booking.time)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.fullName}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>

          {/* Leave Requests */}
          <Card>
            <div
              className="flex justify-between items-center cursor-pointer p-4"
              onClick={() => toggleSection('leaves')}
            >
              <h3 className="text-lg font-semibold text-gray-800">คำขอลาที่รอดำเนินการ</h3>
              {activeSection === 'leaves' ? <ChevronUp /> : <ChevronDown />}
            </div>

            {activeSection === 'leaves' && (
              <div className="border-t pt-4 px-4 pb-2">
                <div className="space-y-3">
                  {leaveRequests
                    .filter(leave => leave.status === 'รอดำเนินการ')
                    .map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{leave.fullName}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(leave.leaveDate)}
                            {leave.endDate && ` ถึง ${formatDate(leave.endDate)}`}
                            {leave.reason && ` • ${leave.reason}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setLeaveRequests(prev => prev.map(l =>
                                l.id === leave.id ? { ...l, status: 'อนุมัติ' } : l
                              ));
                            }}
                            variant="success"
                            className="text-xs px-3 py-1.5"
                          >
                            อนุมัติ
                          </Button>
                          <Button
                            onClick={() => {
                              setLeaveRequests(prev => prev.map(l =>
                                l.id === leave.id ? { ...l, status: 'ปฏิเสธ' } : l
                              ));
                            }}
                            variant="danger"
                            className="text-xs px-3 py-1.5"
                          >
                            ปฏิเสธ
                          </Button>
                        </div>
                      </div>
                    ))}
                  {leaveRequests.filter(leave => leave.status === 'รอดำเนินการ').length === 0 && (
                    <p className="text-gray-500 text-center py-4">ไม่มีคำขอลาที่รอดำเนินการ</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  // Success Modal
  const SuccessModal = () => (
    <Modal
      isOpen={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
      title="สำเร็จ!"
    >
      <div className="text-center py-4">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <p className="text-gray-700 mb-6 text-lg font-medium">{successMessage}</p>
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={() => setShowSuccessModal(false)}
            className="w-full"
          >
            ดำเนินการต่อ
          </Button>
          {currentUser?.role === 'user' && currentPage !== 'dashboard' && (
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                setCurrentPage('dashboard');
              }}
              variant="secondary"
              className="w-full"
            >
              ดูแดชบอร์ด
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );

  // Main render
  if (!currentUser) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'attendance':
        return <AttendancePage />;
      case 'leave':
        return <LeavePage />;
      case 'booking':
        return <BookingPage />;
      case 'dashboard':
        return currentUser.role === 'admin' ? <DashboardPage /> : <AttendancePage />;
      default:
        return <AttendancePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navigation />

      <div className="lg:ml-64">
        <div className="pt-16 lg:pt-6">
          {renderPage()}
        </div>
      </div>

      <SuccessModal />
    </div>
  );
};

export default App;