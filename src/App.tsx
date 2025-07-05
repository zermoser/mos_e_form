import React, { useState, useEffect } from 'react';
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
  Heart,
  Stethoscope,
  Sun,
  Moon,
  Lock
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { th } from 'date-fns/locale';

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
  type: string;
  timestamp: string;
  status: 'รอดำเนินการ' | 'อนุมัติ' | 'ปฏิเสธ';
}

interface RoomBooking {
  id: string;
  fullName: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
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
  { id: '1', fullName: 'นภา สวยงาม', leaveDate: '2025-07-20', type: 'ลาป่วย', reason: 'เหตุฉุกเฉินในครอบครัว', timestamp: '2025-07-14T10:00:00Z', status: 'รอดำเนินการ' },
  { id: '2', fullName: 'วีระชัย กล้าหาญ', leaveDate: '2025-07-18', type: 'ลากิจ', reason: 'พบแพทย์', timestamp: '2025-07-13T14:30:00Z', status: 'อนุมัติ' }
];

const MOCK_BOOKINGS: RoomBooking[] = [
  { id: '1', fullName: 'ธนวัฒน์ พัฒนา', room: 'ห้อง A', date: '2025-07-16', startTime: '14:00', endTime: '16:00', purpose: 'ประชุมทีม', timestamp: '2025-07-15T11:00:00Z' },
  { id: '2', fullName: 'อรุณี สว่างใจ', room: 'ห้อง B', date: '2025-07-17', startTime: '10:00', endTime: '12:00', purpose: 'นำเสนองาน', timestamp: '2025-07-15T12:00:00Z' }
];

const ROOMS = ['ห้อง A', 'ห้อง B', 'ห้อง C', 'ห้องประชุมใหญ่', 'ห้องปฏิบัติการ 1', 'ห้องปฏิบัติการ 2'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', 
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];
const LEAVE_TYPES = [
  { value: 'ลาป่วย', label: 'ลาป่วย', icon: Stethoscope, color: 'bg-blue-100 text-blue-800' },
  { value: 'ลากิจ', label: 'ลากิจ', icon: Heart, color: 'bg-pink-100 text-pink-800' },
  { value: 'ลาพักร้อน', label: 'ลาพักร้อน', icon: Sun, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ลาคลอดบุตร', label: 'ลาคลอดบุตร', icon: Moon, color: 'bg-purple-100 text-purple-800' },
  { value: 'อื่นๆ', label: 'อื่นๆ', icon: FileText, color: 'bg-gray-100 text-gray-800' }
];

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
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
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
    outline: 'bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 disabled:opacity-50'
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

const Select: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
}> = ({ label, value, onChange, options, required = false, className = '', icon }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <select
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-no-repeat bg-[right_0.75rem_center] ${icon ? 'pl-10' : ''}`}
          style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2Y2E2NCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==")` }}
        >
          <option value="">เลือก {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
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

  // Form states
  const [leaveForm, setLeaveForm] = useState({
    fullName: '',
    leaveDate: '',
    endDate: '',
    reason: '',
    type: ''
  });

  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    room: '',
    date: '',
    startTime: '',
    endTime: '',
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
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
            <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold mb-1">ระบบจัดการโรงเรียน</h1>
            <p className="opacity-90">ระบบบันทึกการเข้าโรงเรียนและการจองห้อง</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อผู้ใช้ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="กรอกชื่อผู้ใช้ของคุณ"
                    className="w-full pl-10 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="กรอกรหัสผ่านของคุณ"
                    className="w-full pl-10 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
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

            <div className="mt-6 text-sm text-gray-600 border-t pt-6">
              <p className="font-medium text-center mb-3">ข้อมูลทดสอบ:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <p className="font-medium flex items-center gap-1">
                    <User size={14} /> ผู้ดูแลระบบ
                  </p>
                  <p className="mt-1">admin / admin123</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <p className="font-medium flex items-center gap-1">
                    <User size={14} /> ผู้ใช้งาน
                  </p>
                  <p className="mt-1">user / user123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    trend?: number;
  }> = ({ title, value, icon, color, className = '', trend }) => {
    return (
      <div className={`bg-white rounded-2xl shadow p-5 flex items-center ${className}`}>
        <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% จากเมื่อวาน
            </p>
          )}
        </div>
      </div>
    );
  };

  // Attendance Page - Simplified with single button
  const AttendancePage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastCheckIn, setLastCheckIn] = useState<AttendanceRecord | null>(null);
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
      const updateTime = () => {
        const { time } = getCurrentDateTime();
        setCurrentTime(time);
      };
      
      updateTime();
      const interval = setInterval(updateTime, 1000);
      
      return () => clearInterval(interval);
    }, []);

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

        <Card className="border border-gray-200 text-center p-10 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-800 mb-1">ข้อมูลผู้ใช้</p>
            <div className="bg-white rounded-xl p-4 shadow-sm inline-block">
              <p className="text-gray-700 font-medium">{currentUser?.displayName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(getCurrentDateTime().date)} {currentTime}
              </p>
            </div>
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
          type: leaveForm.type,
          timestamp: new Date().toISOString(),
          status: 'รอดำเนินการ'
        };

        setLeaveRequests([...leaveRequests, newLeave]);
        setLeaveForm({
          fullName: '',
          leaveDate: '',
          endDate: '',
          reason: '',
          type: ''
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทการลา <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {LEAVE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setLeaveForm({...leaveForm, type: type.value})}
                    className={`p-3 rounded-xl border ${leaveForm.type === type.value 
                      ? `${type.color.split(' ')[0]} border-indigo-600 shadow-inner` 
                      : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                  >
                    <div className="flex flex-col items-center">
                      <type.icon size={24} className="mb-2" />
                      <span className="text-sm">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่เริ่มลา <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Calendar size={18} />
                  </div>
                  <DatePicker
                    selected={leaveForm.leaveDate ? new Date(leaveForm.leaveDate) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setLeaveForm({...leaveForm, leaveDate: date.toISOString().split('T')[0]});
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    locale={th}
                    className="w-full pl-10 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholderText="เลือกวันที่"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่สิ้นสุดการลา
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Calendar size={18} />
                  </div>
                  <DatePicker
                    selected={leaveForm.endDate ? new Date(leaveForm.endDate) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setLeaveForm({...leaveForm, endDate: date.toISOString().split('T')[0]});
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    locale={th}
                    className="w-full pl-10 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholderText="เลือกวันที่"
                  />
                </div>
              </div>
            </div>

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
                disabled={isSubmitting || !leaveForm.type}
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
    const [bookingDate, setBookingDate] = useState<Date | null>(null);

    const checkAvailability = () => {
      if (!bookingForm.room || !bookingForm.date || !bookingForm.startTime || !bookingForm.endTime) {
        setAvailabilityCheck({
          available: false,
          message: 'กรุณาเลือกห้อง วันที่ และช่วงเวลา'
        });
        return;
      }

      const startHour = parseInt(bookingForm.startTime.split(':')[0]);
      const endHour = parseInt(bookingForm.endTime.split(':')[0]);
      
      if (endHour <= startHour) {
        setAvailabilityCheck({
          available: false,
          message: 'เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น'
        });
        return;
      }

      const isBooked = roomBookings.some(booking =>
        booking.room === bookingForm.room &&
        booking.date === bookingForm.date &&
        (
          (parseInt(bookingForm.startTime) >= parseInt(booking.startTime) && 
          parseInt(bookingForm.startTime) < parseInt(booking.endTime)) ||
          (parseInt(bookingForm.endTime) > parseInt(booking.startTime) && 
          parseInt(bookingForm.endTime) <= parseInt(booking.endTime))
        )
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
          (
            (parseInt(bookingForm.startTime) >= parseInt(booking.startTime) && 
             parseInt(bookingForm.startTime) < parseInt(booking.endTime)) ||
            (parseInt(bookingForm.endTime) > parseInt(booking.startTime) && 
             parseInt(bookingForm.endTime) <= parseInt(booking.endTime))
          )
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
          startTime: bookingForm.startTime,
          endTime: bookingForm.endTime,
          purpose: bookingForm.purpose,
          timestamp: new Date().toISOString()
        };

        setRoomBookings([...roomBookings, newBooking]);
        setBookingForm({
          fullName: '',
          room: '',
          date: '',
          startTime: '',
          endTime: '',
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
              icon={<MapPin size={18} />}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่จอง <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Calendar size={18} />
                </div>
                <DatePicker
                  selected={bookingDate}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setBookingDate(date);
                      setBookingForm({...bookingForm, date: date.toISOString().split('T')[0]});
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale={th}
                  className="w-full pl-10 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholderText="เลือกวันที่"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เวลาเริ่มต้น <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Clock size={18} />
                  </div>
                  <select
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
                    required
                    className="w-full pl-10 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-no-repeat bg-[right_0.75rem_center]"
                    style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2Y2E2NCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==")` }}
                  >
                    <option value="">เลือกเวลา</option>
                    {TIME_SLOTS.map(time => (
                      <option key={`start-${time}`} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เวลาสิ้นสุด <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Clock size={18} />
                  </div>
                  <select
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({...bookingForm, endTime: e.target.value})}
                    required
                    className="w-full pl-10 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-no-repeat bg-[right_0.75rem_center]"
                    style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI4IDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM2Y2E2NCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==")` }}
                  >
                    <option value="">เลือกเวลา</option>
                    {TIME_SLOTS.filter(time => 
                      !bookingForm.startTime || parseInt(time) > parseInt(bookingForm.startTime)
                    ).map(time => (
                      <option key={`end-${time}`} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

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
      
      // Create Excel content with UTF-8 BOM for proper encoding
      const BOM = "\uFEFF";
      let csvContent = "data:text/csv;charset=utf-8," + BOM;
      
      // Attendance data
      csvContent += "บันทึกการเข้าโรงเรียน\n";
      csvContent += "ID,ชื่อ-นามสกุล,วันที่,สถานะ,เหตุผล,เวลาบันทึก\n";
      attendanceRecords.forEach(record => {
        csvContent += `${record.id},${record.fullName},${record.date},${record.status},"${record.reason || ''}",${record.timestamp}\n`;
      });
      
      // Leave requests
      csvContent += "\nการลางาน\n";
      csvContent += "ID,ชื่อ-นามสกุล,ประเภทการลา,วันที่เริ่มลา,วันที่สิ้นสุด,เหตุผล,สถานะ,เวลาบันทึก\n";
      leaveRequests.forEach(leave => {
        csvContent += `${leave.id},${leave.fullName},${leave.type},${leave.leaveDate},${leave.endDate || ''},"${leave.reason}",${leave.status},${leave.timestamp}\n`;
      });
      
      // Room bookings
      csvContent += "\nการจองห้อง\n";
      csvContent += "ID,ชื่อ-นามสกุล,ห้อง,วันที่,เวลาเริ่มต้น,เวลาสิ้นสุด,วัตถุประสงค์,เวลาบันทึก\n";
      roomBookings.forEach(booking => {
        csvContent += `${booking.id},${booking.fullName},${booking.room},${booking.date},${booking.startTime},${booking.endTime},"${booking.purpose}",${booking.timestamp}\n`;
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `school-data-${new Date().toISOString().slice(0,10)}.csv`);
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

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];
      const yesterdayRecords = attendanceRecords.filter(record => record.date === yesterdayDate);

      const getCount = (records: AttendanceRecord[], status: string) => 
        records.filter(r => r.status === status).length;

      const calculateTrend = (todayCount: number, yesterdayCount: number) => {
        if (yesterdayCount === 0) {
          return todayCount === 0 ? 0 : 100;
        }
        return Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
      };

      const presentToday = getCount(todayRecords, 'มา');
      const presentYesterday = getCount(yesterdayRecords, 'มา');
      const absentToday = getCount(todayRecords, 'ขาด');
      const absentYesterday = getCount(yesterdayRecords, 'ขาด');
      const lateToday = getCount(todayRecords, 'สาย');
      const lateYesterday = getCount(yesterdayRecords, 'สาย');
      const leaveToday = getCount(todayRecords, 'ลา');
      const leaveYesterday = getCount(yesterdayRecords, 'ลา');

      return {
        present: {
          today: presentToday,
          yesterday: presentYesterday,
          trend: calculateTrend(presentToday, presentYesterday)
        },
        absent: {
          today: absentToday,
          yesterday: absentYesterday,
          trend: calculateTrend(absentToday, absentYesterday)
        },
        late: {
          today: lateToday,
          yesterday: lateYesterday,
          trend: calculateTrend(lateToday, lateYesterday)
        },
        leave: {
          today: leaveToday,
          yesterday: leaveYesterday,
          trend: calculateTrend(leaveToday, leaveYesterday)
        }
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
            value={summary.present.today} 
            icon={<UserCheck className="text-green-600" size={24} />} 
            color="bg-green-100"
            trend={summary.present.trend}
          />
          <StatsCard 
            title="ขาดโรงเรียนวันนี้" 
            value={summary.absent.today} 
            icon={<XCircle className="text-red-600" size={24} />} 
            color="bg-red-100"
            trend={summary.absent.trend}
          />
          <StatsCard 
            title="สายวันนี้" 
            value={summary.late.today} 
            icon={<AlertCircle className="text-yellow-600" size={24} />} 
            color="bg-yellow-100"
            trend={summary.late.trend}
          />
          <StatsCard 
            title="ลาวันนี้" 
            value={summary.leave.today} 
            icon={<Calendar className="text-blue-600" size={24} />} 
            color="bg-blue-100"
            trend={summary.leave.trend}
          />
        </div>

        {/* Date Range Filter */}
        <Card className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">กรองข้อมูล</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Calendar size={18} />
                </div>
                <DatePicker
                  selected={adminFilters.startDate ? new Date(adminFilters.startDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setAdminFilters({...adminFilters, startDate: date.toISOString().split('T')[0]});
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale={th}
                  className="w-full pl-10 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholderText="เลือกวันที่"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Calendar size={18} />
                </div>
                <DatePicker
                  selected={adminFilters.endDate ? new Date(adminFilters.endDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setAdminFilters({...adminFilters, endDate: date.toISOString().split('T')[0]});
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale={th}
                  className="w-full pl-10 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholderText="เลือกวันที่"
                />
              </div>
            </div>

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
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800">การเข้าโรงเรียนล่าสุด</h3>
              </div>
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
              <div className="flex items-center gap-2">
                <Bookmark size={20} className="text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">การจองห้องล่าสุด</h3>
              </div>
              {activeSection === 'bookings' ? <ChevronUp /> : <ChevronDown />}
            </div>

            {activeSection === 'bookings' && (
              <div className="border-t pt-4 px-4 pb-2">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ห้อง</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จองโดย</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.slice(-5).map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{booking.room}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(booking.date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.fullName}</td>
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
              <div className="flex items-center gap-2">
                <CalendarCheck size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">คำขอลาที่รอดำเนินการ</h3>
              </div>
              {activeSection === 'leaves' ? <ChevronUp /> : <ChevronDown />}
            </div>

            {activeSection === 'leaves' && (
              <div className="border-t pt-4 px-4 pb-2">
                <div className="space-y-3">
                  {leaveRequests
                    .filter(leave => leave.status === 'รอดำเนินการ')
                    .map((leave) => {
                      const leaveType = LEAVE_TYPES.find(type => type.value === leave.type);
                      return (
                        <div key={leave.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div>
                            <p className="font-medium text-gray-900">{leave.fullName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {leaveType && (
                                <span className={`px-2 py-1 rounded-full text-xs ${leaveType.color}`}>
                                  {leaveType.label}
                                </span>
                              )}
                              <span className="text-sm text-gray-600">
                                {formatDate(leave.leaveDate)}
                                {leave.endDate && ` - ${formatDate(leave.endDate)}`}
                              </span>
                            </div>
                            {leave.reason && (
                              <p className="text-sm text-gray-600 mt-2">{leave.reason}</p>
                            )}
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
                      );
                    })}
                  {leaveRequests.filter(leave => leave.status === 'รอดำเนินการ').length === 0 && (
                    <div className="text-center py-6">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-500">ไม่มีคำขอลาที่รอดำเนินการ</p>
                    </div>
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