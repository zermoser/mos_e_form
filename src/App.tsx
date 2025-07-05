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
  Loader
} from 'lucide-react';

// Types
interface AttendanceRecord {
  id: string;
  fullName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
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
  status: 'Pending' | 'Approved' | 'Rejected';
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
}

// Mock data storage
const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: '1', fullName: 'John Doe', date: '2025-07-15', status: 'Present', timestamp: '2025-07-15T09:00:00Z' },
  { id: '2', fullName: 'Jane Smith', date: '2025-07-15', status: 'Late', timestamp: '2025-07-15T09:15:00Z' },
  { id: '3', fullName: 'Bob Johnson', date: '2025-07-15', status: 'Leave', reason: 'Medical appointment', timestamp: '2025-07-15T08:30:00Z' }
];

const MOCK_LEAVES: LeaveRequest[] = [
  { id: '1', fullName: 'Alice Brown', leaveDate: '2025-07-20', reason: 'Family emergency', timestamp: '2025-07-14T10:00:00Z', status: 'Pending' },
  { id: '2', fullName: 'Charlie Wilson', leaveDate: '2025-07-18', reason: 'Medical appointment', timestamp: '2025-07-13T14:30:00Z', status: 'Approved' }
];

const MOCK_BOOKINGS: RoomBooking[] = [
  { id: '1', fullName: 'David Lee', room: 'Room A', date: '2025-07-16', time: '14:00', purpose: 'Team meeting', timestamp: '2025-07-15T11:00:00Z' },
  { id: '2', fullName: 'Emma Davis', room: 'Room B', date: '2025-07-17', time: '10:00', purpose: 'Presentation', timestamp: '2025-07-15T12:00:00Z' }
];

const ROOMS = ['Room A', 'Room B', 'Room C', 'Conference Room', 'Lab 1', 'Lab 2'];

// Utility functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Components
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) => {
  const baseClasses = 'px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 justify-center text-sm';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 shadow-sm hover:shadow-md',
    secondary: 'bg-white text-gray-800 hover:bg-gray-50 disabled:bg-gray-100 border border-gray-300 shadow-sm hover:shadow-md',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 shadow-sm hover:shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 shadow-sm hover:shadow-md'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
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
        <option value="">Select {label}</option>
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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${className}`}>
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
  Present: 'bg-green-100 text-green-800',
  Late: 'bg-yellow-100 text-yellow-800',
  Absent: 'bg-red-100 text-red-800',
  Leave: 'bg-blue-100 text-blue-800',
  Pending: 'bg-gray-100 text-gray-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800'
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
  const [attendanceForm, setAttendanceForm] = useState({
    fullName: '',
    date: new Date().toISOString().split('T')[0],
    status: '' as AttendanceRecord['status'] | '',
    reason: ''
  });

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
          setCurrentUser({ username, role: 'admin' });
          setCurrentPage('dashboard');
        } else if (username === 'user' && password === 'user123') {
          setCurrentUser({ username, role: 'user' });
          setCurrentPage('attendance');
        } else {
          setError('Invalid credentials. Try: admin/admin123 or user/user123');
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
            <h1 className="text-2xl font-bold mb-1">School Management</h1>
            <p className="opacity-90">Attendance & Room Booking System</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleLogin}>
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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
                    Signing in...
                  </span>
                ) : (
                  <>
                    <User size={16} />
                    Login
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-sm text-gray-600 border-t pt-4">
              <p className="font-medium text-center mb-1">Demo Credentials:</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <p className="font-medium">Admin</p>
                  <p>admin / admin123</p>
                </div>
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <p className="font-medium">User</p>
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
      { id: 'attendance', label: 'Attendance', icon: UserCheck },
      { id: 'leave', label: 'Leave Request', icon: CalendarCheck },
      { id: 'booking', label: 'Room Booking', icon: Bookmark },
      ...(currentUser?.role === 'admin' ? [{ id: 'dashboard', label: 'Dashboard', icon: BarChart2 }] : [])
    ];

    return (
      <>
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            onClick={() => setSidebarOpen(true)}
            variant="secondary"
            className="p-2 shadow"
          >
            <Menu size={20} />
          </Button>
        </div>

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">School System</h2>
              <Button
                onClick={() => setSidebarOpen(false)}
                variant="secondary"
                className="p-1 lg:hidden bg-white/20 hover:bg-white/30"
              >
                <X size={16} className="text-white" />
              </Button>
            </div>
            <p className="text-sm opacity-90 mt-1">Welcome, {currentUser?.username}</p>
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
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
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
              variant="danger"
              className="w-full"
            >
              <LogOut size={16} />
              Logout
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

  // Attendance Page
  const AttendancePage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        const newRecord: AttendanceRecord = {
          id: generateId(),
          fullName: attendanceForm.fullName,
          date: attendanceForm.date,
          status: attendanceForm.status as AttendanceRecord['status'],
          reason: attendanceForm.reason || undefined,
          timestamp: new Date().toISOString()
        };

        setAttendanceRecords([...attendanceRecords, newRecord]);
        setAttendanceForm({
          fullName: '',
          date: new Date().toISOString().split('T')[0],
          status: '',
          reason: ''
        });

        setSuccessMessage('Attendance recorded successfully!');
        setShowSuccessModal(true);
        setIsSubmitting(false);
      }, 800);
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="text-indigo-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Attendance Check-in</h1>
          <p className="text-gray-600">Record your daily attendance</p>
        </div>

        <Card className="border border-gray-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Input
              label="Full Name"
              value={attendanceForm.fullName}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, fullName: e.target.value })}
              required
              placeholder="Enter your full name"
              className="md:col-span-2"
            />

            <Input
              label="Date"
              type="date"
              value={attendanceForm.date}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
              required
            />

            <Select
              label="Attendance Status"
              value={attendanceForm.status}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value as AttendanceRecord['status'] })}
              options={[
                { value: 'Present', label: 'Present' },
                { value: 'Absent', label: 'Absent' },
                { value: 'Late', label: 'Late' },
                { value: 'Leave', label: 'Leave' }
              ]}
              required
            />

            {attendanceForm.status === 'Leave' && (
              <TextArea
                label="Reason for Leave"
                value={attendanceForm.reason}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, reason: e.target.value })}
                required
                placeholder="Please specify the reason for leave"
                className="md:col-span-2"
              />
            )}

            <div className="md:col-span-2 mt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader className="animate-spin mr-2" size={16} />
                    Submitting...
                  </span>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Submit Attendance
                  </>
                )}
              </Button>
            </div>
          </form>
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
          fullName: leaveForm.fullName,
          leaveDate: leaveForm.leaveDate,
          endDate: leaveForm.endDate || undefined,
          reason: leaveForm.reason,
          timestamp: new Date().toISOString(),
          status: 'Pending'
        };

        setLeaveRequests([...leaveRequests, newLeave]);
        setLeaveForm({
          fullName: '',
          leaveDate: '',
          endDate: '',
          reason: ''
        });

        setSuccessMessage('Leave request submitted successfully!');
        setShowSuccessModal(true);
        setIsSubmitting(false);
      }, 800);
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="text-blue-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Leave Application</h1>
          <p className="text-gray-600">Submit your leave request</p>
        </div>

        <Card className="border border-gray-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Input
              label="Full Name"
              value={leaveForm.fullName}
              onChange={(e) => setLeaveForm({ ...leaveForm, fullName: e.target.value })}
              required
              placeholder="Enter your full name"
              className="md:col-span-2"
            />

            <Input
              label="Leave Start Date"
              type="date"
              value={leaveForm.leaveDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveDate: e.target.value })}
              required
            />

            <Input
              label="Leave End Date (Optional)"
              type="date"
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              placeholder="Leave empty for single day"
            />

            <TextArea
              label="Reason for Leave"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              required
              placeholder="Please specify the reason for your leave request"
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
                    Submitting...
                  </span>
                ) : (
                  <>
                    <FileText size={16} />
                    Submit Leave Request
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
          message: 'Please select room, date, and time first'
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
        message: isBooked ? 'Room is not available at this time' : 'Room is available!'
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
            message: 'Room is already booked at this time!'
          });
          setIsSubmitting(false);
          return;
        }

        const newBooking: RoomBooking = {
          id: generateId(),
          fullName: bookingForm.fullName,
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

        setSuccessMessage('Room booked successfully!');
        setShowSuccessModal(true);
        setIsSubmitting(false);
      }, 800);
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="text-purple-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Room Booking</h1>
          <p className="text-gray-600">Reserve a classroom or meeting room</p>
        </div>

        <Card className="border border-gray-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Input
              label="Full Name"
              value={bookingForm.fullName}
              onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
              required
              placeholder="Enter your full name"
              className="md:col-span-2"
            />

            <Select
              label="Room"
              value={bookingForm.room}
              onChange={(e) => setBookingForm({ ...bookingForm, room: e.target.value })}
              options={ROOMS.map(room => ({ value: room, label: room }))}
              required
            />

            <Input
              label="Booking Date"
              type="date"
              value={bookingForm.date}
              onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
              required
            />

            <Input
              label="Time"
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
                Check Availability
              </Button>
              {availabilityCheck && (
                <div className={`mt-3 p-3 rounded-xl text-center ${availabilityCheck.available ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {availabilityCheck.message}
                </div>
              )}
            </div>

            <TextArea
              label="Purpose"
              value={bookingForm.purpose}
              onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
              required
              placeholder="Describe the purpose of the booking"
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
                    Booking...
                  </span>
                ) : (
                  <>
                    <MapPin size={16} />
                    Book Room
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
      // Mock export functionality
      setTimeout(() => {
        const data = {
          attendance: attendanceRecords,
          leaves: leaveRequests,
          bookings: roomBookings
        };

        console.log('Exporting data:', data);
        setSuccessMessage('Data exported successfully!');
        setShowSuccessModal(true);
        setIsLoading(false);
      }, 1200);
    };

    const getAttendanceSummary = () => {
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = attendanceRecords.filter(record => record.date === today);

      return {
        present: todayRecords.filter(r => r.status === 'Present').length,
        absent: todayRecords.filter(r => r.status === 'Absent').length,
        late: todayRecords.filter(r => r.status === 'Late').length,
        leave: todayRecords.filter(r => r.status === 'Leave').length
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
            <p className="text-gray-600">Overview of attendance and bookings</p>
          </div>
          <Button
            onClick={exportToExcel}
            variant="secondary"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin mr-2" size={16} />
                Exporting...
              </span>
            ) : (
              <>
                <Download size={16} />
                Export to Excel
              </>
            )}
          </Button>
        </div>

        {/* Date Range Filter */}
        <Card className="mb-6 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={adminFilters.startDate}
              onChange={(e) => setAdminFilters({ ...adminFilters, startDate: e.target.value })}
              className="mb-0"
            />
            <Input
              label="End Date"
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
                Clear Filters
              </Button>
              <Button
                onClick={() => {
                  // Apply filters
                }}
                variant="primary"
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="text-center p-5 border-l-4 border-green-500">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{summary.present}</h3>
            <p className="text-gray-600 text-sm">Present Today</p>
          </Card>

          <Card className="text-center p-5 border-l-4 border-red-500">
            <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="text-red-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{summary.absent}</h3>
            <p className="text-gray-600 text-sm">Absent Today</p>
          </Card>

          <Card className="text-center p-5 border-l-4 border-yellow-500">
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{summary.late}</h3>
            <p className="text-gray-600 text-sm">Late Today</p>
          </Card>

          <Card className="text-center p-5 border-l-4 border-blue-500">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{summary.leave}</h3>
            <p className="text-gray-600 text-sm">On Leave Today</p>
          </Card>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-6">
          {/* Recent Attendance */}
          <Card>
            <div
              className="flex justify-between items-center cursor-pointer p-4"
              onClick={() => toggleSection('attendance')}
            >
              <h3 className="text-lg font-semibold text-gray-800">Recent Attendance</h3>
              {activeSection === 'attendance' ? <ChevronUp /> : <ChevronDown />}
            </div>

            {activeSection === 'attendance' && (
              <div className="border-t pt-4 px-4 pb-2">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
              <h3 className="text-lg font-semibold text-gray-800">Room Bookings</h3>
              {activeSection === 'bookings' ? <ChevronUp /> : <ChevronDown />}
            </div>

            {activeSection === 'bookings' && (
              <div className="border-t pt-4 px-4 pb-2">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked By</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.slice(-5).map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{booking.room}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(booking.date)} at {formatTime(booking.time)}
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
              <h3 className="text-lg font-semibold text-gray-800">Pending Leave Requests</h3>
              {activeSection === 'leaves' ? <ChevronUp /> : <ChevronDown />}
            </div>

            {activeSection === 'leaves' && (
              <div className="border-t pt-4 px-4 pb-2">
                <div className="space-y-3">
                  {leaveRequests
                    .filter(leave => leave.status === 'Pending')
                    .map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{leave.fullName}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(leave.leaveDate)}
                            {leave.endDate && ` to ${formatDate(leave.endDate)}`}
                            {leave.reason && ` • ${leave.reason}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setLeaveRequests(prev => prev.map(l =>
                                l.id === leave.id ? { ...l, status: 'Approved' } : l
                              ));
                            }}
                            variant="success"
                            className="text-xs px-3 py-1.5"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => {
                              setLeaveRequests(prev => prev.map(l =>
                                l.id === leave.id ? { ...l, status: 'Rejected' } : l
                              ));
                            }}
                            variant="danger"
                            className="text-xs px-3 py-1.5"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  {leaveRequests.filter(leave => leave.status === 'Pending').length === 0 && (
                    <p className="text-gray-500 text-center py-4">No pending leave requests</p>
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
      title="Success!"
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
            Continue
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
              View Dashboard
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );

  // Google Sheets Integration Functions (Mock)
  const syncWithGoogleSheets = async (data: any, sheetName: string) => {
    // In a real implementation, this would connect to Google Sheets API
    console.log(`Syncing ${sheetName} data:`, data);

    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  // Effect to sync data with Google Sheets (mock)
  useEffect(() => {
    if (currentUser) {
      // Mock sync with Google Sheets
      syncWithGoogleSheets(attendanceRecords, 'Attendance');
      syncWithGoogleSheets(leaveRequests, 'Leave_Requests');
      syncWithGoogleSheets(roomBookings, 'Room_Bookings');
    }
  }, [attendanceRecords, leaveRequests, roomBookings, currentUser]);

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