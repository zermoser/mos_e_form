import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout,
  Menu,
  Button,
  Card,
  DatePicker,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Popover,
  Space,
  Badge,
  Tabs,
  Calendar,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import locale from 'antd/es/date-picker/locale/th_TH';
import * as XLSX from 'xlsx';
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  DownloadOutlined,
  LogoutOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  MenuOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  TagsOutlined,
  BarChartOutlined,
  SyncOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  SunOutlined,
  MoonOutlined,
  LockOutlined,
  FilterOutlined,
  CheckOutlined,
  CloseOutlined,
  LeftOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

dayjs.extend(buddhistEra);
dayjs.locale('th');

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;

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
  { id: '3', fullName: 'ประเสริฐ ตั้งใจเรียน', date: '2025-07-15', status: 'ลา', reason: 'พบแพทย์', timestamp: '2025-07-15T08:30:00Z' },
  { id: '4', fullName: 'นภา สวยงาม', date: '2025-07-16', status: 'มา', timestamp: '2025-07-16T08:45:00Z' },
  { id: '5', fullName: 'วีระชัย กล้าหาญ', date: '2025-07-16', status: 'ขาด', timestamp: '2025-07-16T00:00:00Z' },
  { id: '6', fullName: 'ธนวัฒน์ พัฒนา', date: '2025-07-17', status: 'ลา', reason: 'ลากิจ', timestamp: '2025-07-17T08:20:00Z' }
];

const MOCK_LEAVES: LeaveRequest[] = [
  { id: '1', fullName: 'นภา สวยงาม', leaveDate: '2025-07-20', type: 'ลาป่วย', reason: 'ป่วย', timestamp: '2025-07-14T10:00:00Z', status: 'รอดำเนินการ' },
  { id: '2', fullName: 'วีระชัย กล้าหาญ', leaveDate: '2025-07-18', type: 'ลากิจ', reason: 'พบแพทย์', timestamp: '2025-07-13T14:30:00Z', status: 'อนุมัติ' },
  { id: '3', fullName: 'สมชาย ใจดี', leaveDate: '2025-07-19', endDate: '2025-07-21', type: 'ลาพักร้อน', reason: 'พักผ่อน', timestamp: '2025-07-15T09:30:00Z', status: 'รอดำเนินการ' },
  { id: '4', fullName: 'สุนีย์ สุขใจ', leaveDate: '2025-07-22', type: 'ลาคลอดบุตร', reason: 'คลอดบุตร', timestamp: '2025-07-16T11:15:00Z', status: 'ปฏิเสธ' }
];

const MOCK_BOOKINGS: RoomBooking[] = [
  { id: '1', fullName: 'ธนวัฒน์ พัฒนา', room: 'ห้อง A', date: '2025-07-16', startTime: '14:00', endTime: '16:00', purpose: 'ประชุมทีม', timestamp: '2025-07-15T11:00:00Z' },
  { id: '2', fullName: 'อรุณี สว่างใจ', room: 'ห้อง B', date: '2025-07-17', startTime: '10:00', endTime: '12:00', purpose: 'นำเสนองาน', timestamp: '2025-07-15T12:00:00Z' },
  { id: '3', fullName: 'สมชาย ใจดี', room: 'ห้องประชุมใหญ่', date: '2025-07-18', startTime: '13:00', endTime: '15:00', purpose: 'สัมมนา', timestamp: '2025-07-16T09:45:00Z' },
  { id: '4', fullName: 'นภา สวยงาม', room: 'ห้องปฏิบัติการ 1', date: '2025-07-19', startTime: '09:00', endTime: '11:00', purpose: 'ทดลองวิทยาศาสตร์', timestamp: '2025-07-17T14:20:00Z' }
];

const ROOMS = ['ห้อง A', 'ห้อง B', 'ห้อง C', 'ห้องประชุมใหญ่', 'ห้องปฏิบัติการ 1', 'ห้องปฏิบัติการ 2'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];
const LEAVE_TYPES = [
  { value: 'ลาป่วย', label: 'ลาป่วย', icon: <MedicineBoxOutlined style={{ color: '#1890ff' }} />, color: 'blue' },
  { value: 'ลากิจ', label: 'ลากิจ', icon: <HeartOutlined style={{ color: '#eb2f96' }} />, color: 'pink' },
  { value: 'ลาพักร้อน', label: 'ลาพักร้อน', icon: <SunOutlined style={{ color: '#fa8c16' }} />, color: 'orange' },
  { value: 'ลาคลอดบุตร', label: 'ลาคลอดบุตร', icon: <MoonOutlined style={{ color: '#722ed1' }} />, color: 'purple' },
  { value: 'อื่นๆ', label: 'อื่นๆ', icon: <FileTextOutlined style={{ color: '#bfbfbf' }} />, color: 'gray' }
];

// Utility functions
const formatDate = (date: string) => {
  return dayjs(date).format('D MMM BBBB');
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  return `${hour}:${minutes} น.`;
};

const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: now.toISOString().split('T')[0],
    time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
    timestamp: now.toISOString()
  };
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    'มา': { color: 'green', icon: <CheckCircleOutlined /> },
    'ขาด': { color: 'red', icon: <CloseCircleOutlined /> },
    'สาย': { color: 'orange', icon: <WarningOutlined /> },
    'ลา': { color: 'blue', icon: <CalendarOutlined /> },
    'รอดำเนินการ': { color: 'default', icon: <ClockCircleOutlined /> },
    'อนุมัติ': { color: 'green', icon: <CheckCircleOutlined /> },
    'ปฏิเสธ': { color: 'red', icon: <CloseCircleOutlined /> }
  };

  const config = statusConfig[status] || { color: 'default', icon: null };

  return (
    <Tag
      icon={config.icon}
      color={config.color}
      className="text-xs sm:text-sm w-20 flex items-center justify-center"
      style={{ minWidth: '120px', height: '24px', display: 'flex', alignItems: 'center' }}
    >
      {status}
    </Tag>
  );
};

// Time conversion helper
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Main App Component
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);

  // Data states
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVES);
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>(MOCK_BOOKINGS);

  // Form states
  const [leaveForm] = Form.useForm();
  const [bookingForm] = Form.useForm();

  // Login Component
  const LoginPage = () => {
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = (values: any) => {
      setIsLoggingIn(true);
      setError('');

      // Simulate API call
      setTimeout(() => {
        if (values.username === 'admin' && values.password === 'admin123') {
          setCurrentUser({
            username: values.username,
            role: 'admin',
            displayName: 'ผู้ดูแลระบบ'
          });
          setCurrentPage('dashboard');
        } else if (values.username === 'user' && values.password === 'user123') {
          setCurrentUser({
            username: values.username,
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
              <BookOutlined className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold mb-1">ระบบจัดการโรงเรียน</h1>
            <p className="opacity-90">ระบบบันทึกการเข้าโรงเรียนและการจองห้อง</p>
          </div>

          <div className="p-8">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              initialValues={{ username: '', password: '' }}
            >
              <Form.Item
                label="ชื่อผู้ใช้"
                name="username"
                rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="กรอกชื่อผู้ใช้ของคุณ"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="รหัสผ่าน"
                name="password"
                rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  size="large"
                />
              </Form.Item>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isLoggingIn}
                  block
                  icon={<UserOutlined />}
                >
                  {isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-6 text-sm text-gray-600 border-t pt-6">
              <p className="font-medium text-center mb-3">ข้อมูลทดสอบ:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <p className="font-medium flex items-center gap-1">
                    <UserOutlined /> ผู้ดูแลระบบ
                  </p>
                  <p className="mt-1">admin / admin123</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <p className="font-medium flex items-center gap-1">
                    <UserOutlined /> ผู้ใช้งาน
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
    const menuItems = [
      { key: 'attendance', label: 'บันทึกการเข้าโรงเรียน', icon: <TeamOutlined /> },
      { key: 'leave', label: 'การลางาน', icon: <ClockCircleOutlined /> },
      { key: 'booking', label: 'การจองห้อง', icon: <TagsOutlined /> },
      { key: 'user-dashboard', label: 'ภาพรวมการเข้างานของฉัน', icon: <UserOutlined /> },
      ...(currentUser?.role === 'admin' ? [{ key: 'dashboard', label: 'แดชบอร์ด', icon: <BarChartOutlined /> }] : [])
    ];

    const toggleSidebar = () => {
      const isMobile = window.innerWidth < 768;
      setCollapsed(!collapsed);
      if (isMobile) {
        setShowMobileOverlay(!collapsed);
      }
    };

    const closeSidebar = () => {
      setCollapsed(true);
      setShowMobileOverlay(false);
    };

    return (
      <Layout className="min-h-screen">
        {/* Mobile Overlay */}
        {showMobileOverlay && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={280}
          theme="dark"
          className={`
          !bg-gradient-to-b from-indigo-700 to-purple-800 
          md:relative fixed z-50 h-full
          transition-all duration-300 ease-in-out
          ${collapsed ? 'md:w-20' : 'md:w-280'}
          ${collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        `}
          style={{
            left: window.innerWidth < 768 ? (collapsed ? '-280px' : '0') : undefined,
          }}
        >
          {/* Header Section */}
          <div className="p-5 text-white border-b border-indigo-600/30">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">ระบบจัดการโรงเรียน</h2>
                    <p className="text-sm opacity-90 mt-1">ยินดีต้อนรับ, {currentUser?.displayName}</p>
                  </div>
                  {/* Close button for mobile */}
                  <Button
                    type="text"
                    icon={<CloseOutlined className="text-white" />}
                    onClick={closeSidebar}
                    className="md:hidden text-white hover:bg-indigo-600/50"
                    size="small"
                  />
                </>
              )}
              {collapsed && (
                <div className="flex justify-center w-full">
                  <UserOutlined className="text-2xl text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-4">
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[currentPage]}
              items={menuItems.map(item => ({
                ...item,
                className: 'hover:bg-indigo-600/50 mx-2 rounded-lg'
              }))}
              onSelect={({ key }) => {
                setCurrentPage(key);
                // ปิด sidebar เฉพาะบน mobile
                if (window.innerWidth < 768) {
                  closeSidebar();
                }
              }}
              className="bg-transparent border-0"
            />
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-indigo-600/30">
            <Button
              onClick={() => {
                setCurrentUser(null);
                setCurrentPage('login');
              }}
              block
              size="large"
              icon={<LogoutOutlined />}
              className="bg-red-500 hover:bg-red-600 border-red-500 text-white font-medium"
            >
              {!collapsed && <span>ออกจากระบบ</span>}
            </Button>
          </div>
        </Sider>

        {/* Main Content */}
        <Layout className={`transition-all duration-300 ${window.innerWidth >= 768 ? (collapsed ? 'md:ml-20' : 'md:ml-280') : ''}`}>
          {/* Header */}
          <Header className="bg-white shadow-md flex items-center px-4 sticky top-0 z-30">
            <Button
              type="text"
              icon={
                window.innerWidth < 768
                  ? <MenuOutlined className="text-gray-700 text-xl" />
                  : (collapsed ? <MenuOutlined className="text-gray-700 text-xl" /> : <LeftOutlined className="text-gray-700 text-xl" />)
              }
              onClick={toggleSidebar}
              className="text-lg mr-4 hover:bg-gray-100 p-2 rounded-lg"
            />

            {/* Page Title */}
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-800">
                {menuItems.find(item => item.key === currentPage)?.label || 'หน้าหลัก'}
              </h1>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <span className="font-medium text-gray-700">{currentUser?.displayName}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <UserOutlined className="text-white text-lg" />
              </div>
            </div>
          </Header>

          {/* Content */}
          <Content className="p-4 sm:p-6 bg-gray-50 min-h-[calc(100vh-64px)] overflow-auto">
            <div className="max-w-7xl mx-auto">
              {renderPage()}
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  };

  // Attendance Page
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <TeamOutlined className="text-indigo-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">บันทึกการเข้าโรงเรียน</h1>
          <p className="text-gray-600">บันทึกการเข้าโรงเรียนประจำวันของคุณ</p>
        </div>

        <Card className="border border-gray-200 text-center p-6 md:p-10 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
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
            loading={isSubmitting}
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'เช็คอินเข้าโรงเรียน'}
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
    const [selectedLeaveType, setSelectedLeaveType] = useState('');

    const handleSubmit = (values: any) => {
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        const newLeave: LeaveRequest = {
          id: generateId(),
          fullName: currentUser?.displayName || '',
          leaveDate: values.leaveDate.format('YYYY-MM-DD'),
          endDate: values.endDate?.format('YYYY-MM-DD') || undefined,
          reason: values.reason,
          type: values.type,
          timestamp: new Date().toISOString(),
          status: 'รอดำเนินการ'
        };

        setLeaveRequests([...leaveRequests, newLeave]);
        leaveForm.resetFields();
        setSelectedLeaveType('');

        setSuccessMessage('ส่งคำขอลางานสำเร็จแล้ว!');
        setShowSuccessModal(true);
        setIsSubmitting(false);
      }, 800);
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ClockCircleOutlined className="text-blue-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">การลางาน</h1>
          <p className="text-gray-600">ส่งคำขอลางานของคุณ</p>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <Form
            form={leaveForm}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ type: '' }}
          >
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl mb-4">
              <p className="font-medium text-gray-800">ผู้ส่งคำขอ: {currentUser?.displayName}</p>
            </div>

            <Form.Item
              label="ประเภทการลา"
              name="type"
              rules={[{ required: true, message: 'กรุณาเลือกประเภทการลา' }]}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {LEAVE_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    onClick={() => {
                      setSelectedLeaveType(type.value);
                      leaveForm.setFieldValue('type', type.value);
                    }}
                    className={`h-24 flex flex-col items-center justify-center ${selectedLeaveType === type.value
                      ? `bg-${type.color}-100 border-${type.color}-600 shadow-inner`
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="text-lg mb-2">
                      {type.icon}
                    </div>
                    <span className="mt-1">{type.label}</span>
                  </Button>
                ))}
              </div>
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="วันที่เริ่มลา"
                  name="leaveDate"
                  rules={[{ required: true, message: 'กรุณาเลือกวันที่เริ่มลา' }]}
                >
                  <DatePicker
                    locale={locale}
                    format="DD/MM/YYYY"
                    placeholder="เลือกวันที่"
                    className="w-full"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="วันที่สิ้นสุดการลา"
                  name="endDate"
                >
                  <DatePicker
                    locale={locale}
                    format="DD/MM/YYYY"
                    placeholder="เลือกวันที่"
                    className="w-full"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="เหตุผลการลา"
              name="reason"
              rules={[{ required: true, message: 'กรุณากรอกเหตุผลการลา' }]}
            >
              <TextArea
                placeholder="กรุณาระบุเหตุผลการลาของคุณ"
                rows={4}
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={isSubmitting}
                icon={<FileTextOutlined />}
              >
                {isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอลา'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  };

  // Room Booking Page
  const BookingPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availabilityCheck, setAvailabilityCheck] = useState<{ available: boolean; message: string } | null>(null);

    const checkAvailability = () => {
      const values = bookingForm.getFieldsValue();
      if (!values.room || !values.date || !values.startTime || !values.endTime) {
        setAvailabilityCheck({
          available: false,
          message: 'กรุณาเลือกห้อง วันที่ และช่วงเวลา'
        });
        return;
      }

      const startMinutes = timeToMinutes(values.startTime);
      const endMinutes = timeToMinutes(values.endTime);

      if (endMinutes <= startMinutes) {
        setAvailabilityCheck({
          available: false,
          message: 'เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น'
        });
        return;
      }

      const dateStr = values.date.format('YYYY-MM-DD');
      const isBooked = roomBookings.some(booking =>
        booking.room === values.room &&
        booking.date === dateStr &&
        (
          startMinutes < timeToMinutes(booking.endTime) &&
          endMinutes > timeToMinutes(booking.startTime)
        )
      );

      setAvailabilityCheck({
        available: !isBooked,
        message: isBooked ? 'ห้องไม่ว่างในช่วงเวลานี้' : 'ห้องว่าง!'
      });
    };

    const handleSubmit = (values: any) => {
      setIsSubmitting(true);

      const dateStr = values.date.format('YYYY-MM-DD');
      const startMinutes = timeToMinutes(values.startTime);
      const endMinutes = timeToMinutes(values.endTime);

      // Check availability again before submitting
      const isBooked = roomBookings.some(booking =>
        booking.room === values.room &&
        booking.date === dateStr &&
        (
          startMinutes < timeToMinutes(booking.endTime) &&
          endMinutes > timeToMinutes(booking.startTime)
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

      // Simulate API call
      setTimeout(() => {
        const newBooking: RoomBooking = {
          id: generateId(),
          fullName: currentUser?.displayName || '',
          room: values.room,
          date: dateStr,
          startTime: values.startTime,
          endTime: values.endTime,
          purpose: values.purpose,
          timestamp: new Date().toISOString()
        };

        setRoomBookings([...roomBookings, newBooking]);
        bookingForm.resetFields();
        setAvailabilityCheck(null);

        setSuccessMessage('จองห้องสำเร็จแล้ว!');
        setShowSuccessModal(true);
        setIsSubmitting(false);
      }, 800);
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <TagsOutlined className="text-purple-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">การจองห้อง</h1>
          <p className="text-gray-600">จองห้องเรียนหรือห้องประชุม</p>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <Form
            form={bookingForm}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl mb-4">
              <p className="font-medium text-gray-800">ผู้จอง: {currentUser?.displayName}</p>
            </div>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="ห้อง"
                  name="room"
                  rules={[{ required: true, message: 'กรุณาเลือกห้อง' }]}
                >
                  <Select
                    placeholder="เลือกห้อง"
                    size="large"
                    options={ROOMS.map(room => ({ value: room, label: room }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="วันที่จอง"
                  name="date"
                  rules={[{ required: true, message: 'กรุณาเลือกวันที่จอง' }]}
                >
                  <DatePicker
                    locale={locale}
                    format="DD/MM/YYYY"
                    placeholder="เลือกวันที่"
                    className="w-full"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="เวลาเริ่มต้น"
                  name="startTime"
                  rules={[{ required: true, message: 'กรุณาเลือกเวลาเริ่มต้น' }]}
                >
                  <Select
                    placeholder="เลือกเวลา"
                    size="large"
                    options={TIME_SLOTS.map(time => ({
                      value: time,
                      label: formatTime(time)
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="เวลาสิ้นสุด"
                  name="endTime"
                  rules={[{ required: true, message: 'กรุณาเลือกเวลาสิ้นสุด' }]}
                >
                  <Select
                    placeholder="เลือกเวลา"
                    size="large"
                    options={TIME_SLOTS.filter(time => {
                      const startTime = bookingForm.getFieldValue('startTime');
                      return !startTime || timeToMinutes(time) > timeToMinutes(startTime);
                    }).map(time => ({
                      value: time,
                      label: formatTime(time)
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button
                type="default"
                onClick={checkAvailability}
                block
                size="large"
                icon={<LockOutlined />}
              >
                ตรวจสอบความพร้อม
              </Button>
              {availabilityCheck && (
                <div className={`mt-3 p-3 rounded-xl text-center ${availabilityCheck.available ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {availabilityCheck.message}
                </div>
              )}
            </Form.Item>

            <Form.Item
              label="วัตถุประสงค์"
              name="purpose"
              rules={[{ required: true, message: 'กรุณากรอกวัตถุประสงค์' }]}
            >
              <TextArea
                placeholder="อธิบายวัตถุประสงค์ในการจอง"
                rows={3}
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={isSubmitting}
                icon={<EnvironmentOutlined />}
              >
                {isSubmitting ? 'กำลังจอง...' : 'จองห้อง'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  };

  // User Dashboard Page
  const UserDashboardPage = () => {
    const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
    const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
    const [dateFilter, ] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('attendance');
    const [selectedMonth, setSelectedMonth] = useState(dayjs());

    // Filter data for current user
    const userAttendance = attendanceRecords.filter(
      record => record.fullName === currentUser?.displayName
    );

    const userLeaves = leaveRequests.filter(
      leave => leave.fullName === currentUser?.displayName
    );

    // Filter by date range
    const filteredAttendance = userAttendance.filter(record => {
      const recordDate = record.date;
      if (startDate && endDate) {
        const start = startDate.format('YYYY-MM-DD');
        const end = endDate.format('YYYY-MM-DD');
        return recordDate >= start && recordDate <= end;
      }
      return true;
    });

    const filteredLeaves = dateFilter
      ? userLeaves.filter(leave => {
        const leaveDate = leave.leaveDate;
        const startDate = dateFilter[0].format('YYYY-MM-DD');
        const endDate = dateFilter[1].format('YYYY-MM-DD');
        return leaveDate >= startDate && leaveDate <= endDate;
      })
      : userLeaves;

    // Function to get date range
    const getDateRange = (startDate: string, endDate?: string): string[] => {
      if (!endDate) return [startDate];

      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const dates: string[] = [];

      let current = start;
      while (current.isBefore(end) || current.isSame(end)) {
        dates.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
      }

      return dates;
    };

    // Calendar view - Group data by date
    const calendarData = useMemo(() => {
      const data: Record<string, { attendance?: string; leave?: string }> = {};

      // Add attendance
      userAttendance.forEach(record => {
        data[record.date] = {
          ...(data[record.date] || {}),
          attendance: record.status
        };
      });

      // Add leaves
      userLeaves.forEach(leave => {
        const leaveDates = getDateRange(leave.leaveDate, leave.endDate);
        leaveDates.forEach(date => {
          data[date] = {
            ...(data[date] || {}),
            leave: leave.type
          };
        });
      });

      return data;
    }, [userAttendance, userLeaves]);

    // Render calendar cell
    const renderCalendarCell = (date: dayjs.Dayjs) => {
      const dateStr = date.format('YYYY-MM-DD');
      const dayData = calendarData[dateStr];

      if (!dayData) {
        return <div className="p-1 min-h-[80px] border border-gray-100"></div>;
      }

      return (
        <div className="p-1 min-h-[80px] border border-gray-100 bg-gray-50">
          {dayData.attendance && (
            <div className="mb-1">
              <Tag
                color={dayData.attendance === 'มา' ? 'green' :
                  dayData.attendance === 'ขาด' ? 'red' :
                    dayData.attendance === 'สาย' ? 'orange' : 'blue'}
                className="text-xs"
              >
                {dayData.attendance}
              </Tag>
            </div>
          )}

          {dayData.leave && (
            <div>
              <Tag color="blue" className="text-xs">
                {dayData.leave}
              </Tag>
            </div>
          )}
        </div>
      );
    };

    // Export functions
    const exportAttendance = () => {
      const wb = XLSX.utils.book_new();
      const attendanceData = filteredAttendance.map(record => ({
        ID: record.id,
        'ชื่อ-นามสกุล': record.fullName,
        วันที่: formatDate(record.date),
        สถานะ: record.status,
        เหตุผล: record.reason || '',
        'เวลาบันทึก': formatTime(record.timestamp.split('T')[1].substring(0, 5))
      }));
      const attendanceWs = XLSX.utils.json_to_sheet(attendanceData);
      XLSX.utils.book_append_sheet(wb, attendanceWs, "บันทึกการเข้าโรงเรียน");
      XLSX.writeFile(wb, `attendance-data-${dayjs().format('YYYY-MM-DD')}.xlsx`);
      setSuccessMessage('ส่งออกข้อมูลการเข้าโรงเรียนสำเร็จแล้ว!');
      setShowSuccessModal(true);
    };

    const exportLeaves = () => {
      const wb = XLSX.utils.book_new();
      const leaveData = filteredLeaves.map(leave => ({
        ID: leave.id,
        'ชื่อ-นามสกุล': leave.fullName,
        'ประเภทการลา': leave.type,
        'วันที่เริ่มลา': formatDate(leave.leaveDate),
        'วันที่สิ้นสุด': leave.endDate ? formatDate(leave.endDate) : '',
        เหตุผล: leave.reason,
        สถานะ: leave.status,
        'เวลาบันทึก': formatTime(leave.timestamp.split('T')[1].substring(0, 5))
      }));
      const leaveWs = XLSX.utils.json_to_sheet(leaveData);
      XLSX.utils.book_append_sheet(wb, leaveWs, "การลางาน");
      XLSX.writeFile(wb, `leave-requests-${dayjs().format('YYYY-MM-DD')}.xlsx`);
      setSuccessMessage('ส่งออกข้อมูลการลางานสำเร็จแล้ว!');
      setShowSuccessModal(true);
    };

    const attendanceColumns: ColumnsType<AttendanceRecord> = [
      {
        title: 'วันที่',
        dataIndex: 'date',
        key: 'date',
        render: (date: string) => formatDate(date)
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => <StatusBadge status={status} />
      },
      {
        title: 'เหตุผล',
        dataIndex: 'reason',
        key: 'reason',
        render: (reason: string) => reason || <span className="text-gray-400">-</span>
      }
    ];

    // Type สำหรับคอลัมน์ตารางการลา
    const leaveColumns: ColumnsType<LeaveRequest> = [
      {
        title: 'ประเภท',
        dataIndex: 'type',
        key: 'type'
      },
      {
        title: 'วันที่',
        key: 'date',
        render: (record: LeaveRequest) => (
          <div>
            <div>{formatDate(record.leaveDate)}</div>
            {record.endDate && (
              <div className="text-xs text-gray-500">ถึง {formatDate(record.endDate)}</div>
            )}
          </div>
        )
      },
      {
        title: 'เหตุผล',
        dataIndex: 'reason',
        key: 'reason'
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => <StatusBadge status={status} />
      }
    ];

    // Filter Component
    const FilterComponent: React.FC = () => (
      <div className="p-4 w-80">
        <div className="font-semibold text-gray-900 mb-3">กรองข้อมูลตามวันที่</div>
        <div className="space-y-3">
          <DatePicker
            locale={locale}
            format="DD/MM/YYYY"
            placeholder="วันที่เริ่มต้น"
            value={startDate}
            onChange={setStartDate}
            className="w-full mb-2"
          />
          <DatePicker
            locale={locale}
            format="DD/MM/YYYY"
            placeholder="วันที่สิ้นสุด"
            value={endDate}
            onChange={setEndDate}
            className="w-full"
          />
          <Button
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
            className="w-full mt-2"
            icon={<SyncOutlined />}
          >
            ล้างตัวกรอง
          </Button>
        </div>
      </div>
    );

    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">แดชบอร์ดส่วนตัว</h1>
          <p className="text-gray-600">
            ข้อมูลการเข้าโรงเรียนและการลาของคุณ {currentUser?.displayName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleOutlined className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">เข้าโรงเรียน</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userAttendance.filter(a => a.status === 'มา').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClockCircleOutlined className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">การลา</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userLeaves.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <CloseCircleOutlined className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ขาดเรียน</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userAttendance.filter(a => a.status === 'ขาด').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <Card className="mb-8 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-900">ปฏิทินบันทึกการเข้าโรงเรียน</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedMonth(selectedMonth.subtract(1, 'month'))}
                icon={<LeftOutlined />}
              />
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={(date) => setSelectedMonth(date || dayjs())}
                format="MMMM BBBB"
                locale={locale}
                className="w-40"
              />
              <Button
                onClick={() => setSelectedMonth(selectedMonth.add(1, 'month'))}
                icon={<LeftOutlined className="rotate-180" />}
              />
            </div>
          </div>

          <div className="overflow-auto">
            <Calendar
              value={selectedMonth}
              mode="month"
              headerRender={() => null}
              fullCellRender={renderCalendarCell}
              className="w-full min-w-[700px]"
            />
          </div>
        </Card>

        {/* Data Tables */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'attendance',
                  label: (
                    <div className="flex items-center gap-2">
                      <TeamOutlined />
                      <span>การเข้าโรงเรียน</span>
                      <Badge count={filteredAttendance.length} size="small" />
                    </div>
                  )
                },
                {
                  key: 'leaves',
                  label: (
                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined />
                      <span>การลา</span>
                      <Badge count={filteredLeaves.length} size="small" />
                    </div>
                  )
                }
              ]}
              className="px-6"
            />
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {activeTab === 'attendance' ? 'บันทึกการเข้าโรงเรียน' : 'ประวัติการลา'}
                </h2>
                <p className="text-gray-600">
                  {activeTab === 'attendance'
                    ? 'ข้อมูลการเข้าโรงเรียนของคุณ'
                    : 'ข้อมูลการลาของคุณ'}
                </p>
              </div>
              <div className="flex gap-3">
                <Popover
                  content={<FilterComponent />}
                  title="ตัวกรองข้อมูล"
                  trigger="click"
                  placement="bottomRight"
                >
                  <Button icon={<FilterOutlined />} size="large">
                    กรองข้อมูล
                    {dateFilter && <CheckOutlined className="ml-2 text-green-600" />}
                  </Button>
                </Popover>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={activeTab === 'attendance' ? exportAttendance : exportLeaves}
                  size="large"
                >
                  ส่งออก Excel
                </Button>
              </div>
            </div>

            {activeTab === 'attendance' ? (
              <Table<AttendanceRecord>
                dataSource={filteredAttendance}
                columns={attendanceColumns}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
                }}
                rowKey="id"
                className="rounded-lg overflow-hidden"
              />
            ) : (
              <Table<LeaveRequest>
                dataSource={filteredLeaves}
                columns={leaveColumns}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
                }}
                rowKey="id"
                className="rounded-lg overflow-hidden"
              />
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Admin Dashboard
  const DashboardPage = () => {
    const [attendanceStartDate, setAttendanceStartDate] = useState<dayjs.Dayjs | null>(null);
    const [attendanceEndDate, setAttendanceEndDate] = useState<dayjs.Dayjs | null>(null);
    const [attendanceFilter, setAttendanceFilter] = useState<any>(null);
    const [leaveFilter, setLeaveFilter] = useState<any>(null);
    const [bookingFilter, setBookingFilter] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('attendance');

    // Update leave status
    const updateLeaveStatus = (id: string, status: 'อนุมัติ' | 'ปฏิเสธ') => {
      setLeaveRequests(prev =>
        prev.map(leave =>
          leave.id === id ? { ...leave, status } : leave
        )
      );
    };

    // Attendance summary
    const getAttendanceSummary = () => {
      const today = dayjs().format('YYYY-MM-DD');
      const todayRecords = attendanceRecords.filter(record => record.date === today);

      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      const yesterdayRecords = attendanceRecords.filter(record => record.date === yesterday);

      const getCount = (records: AttendanceRecord[], status: string) =>
        records.filter(r => r.status === status).length;

      const presentToday = getCount(todayRecords, 'มา');
      const presentYesterday = getCount(yesterdayRecords, 'มา');
      const absentToday = getCount(todayRecords, 'ขาด');
      const absentYesterday = getCount(yesterdayRecords, 'ขาด');
      const lateToday = getCount(todayRecords, 'สาย');
      const lateYesterday = getCount(yesterdayRecords, 'สาย');
      const leaveToday = getCount(todayRecords, 'ลา');
      const leaveYesterday = getCount(yesterdayRecords, 'ลา');

      const totalToday = todayRecords.length || 100;

      return {
        present: {
          today: presentToday,
          yesterday: presentYesterday,
        },
        absent: {
          today: absentToday,
          yesterday: absentYesterday,
        },
        late: {
          today: lateToday,
          yesterday: lateYesterday,
        },
        leave: {
          today: leaveToday,
          yesterday: leaveYesterday,
        },
        total: totalToday
      };
    };

    const summary = getAttendanceSummary();

    // Export functions
    const exportAttendance = () => {
      setIsLoading(true);
      setTimeout(() => {
        const wb = XLSX.utils.book_new();
        const attendanceData = filteredAttendance.map(record => ({
          ID: record.id,
          'ชื่อ-นามสกุล': record.fullName,
          วันที่: formatDate(record.date),
          สถานะ: record.status,
          เหตุผล: record.reason || '',
          'เวลาบันทึก': formatTime(record.timestamp.split('T')[1].substring(0, 5))
        }));
        const attendanceWs = XLSX.utils.json_to_sheet(attendanceData);
        XLSX.utils.book_append_sheet(wb, attendanceWs, "บันทึกการเข้าโรงเรียน");
        XLSX.writeFile(wb, `attendance-data-${dayjs().format('YYYY-MM-DD')}.xlsx`);
        setIsLoading(false);
        setSuccessMessage('ส่งออกข้อมูลการเข้าโรงเรียนสำเร็จแล้ว!');
        setShowSuccessModal(true);
      }, 800);
    };

    const exportLeaves = () => {
      setIsLoading(true);
      setTimeout(() => {
        const wb = XLSX.utils.book_new();
        const leaveData = filteredLeaves.map(leave => ({
          ID: leave.id,
          'ชื่อ-นามสกุล': leave.fullName,
          'ประเภทการลา': leave.type,
          'วันที่เริ่มลา': formatDate(leave.leaveDate),
          'วันที่สิ้นสุด': leave.endDate ? formatDate(leave.endDate) : '',
          เหตุผล: leave.reason,
          สถานะ: leave.status,
          'เวลาบันทึก': formatTime(leave.timestamp.split('T')[1].substring(0, 5))
        }));
        const leaveWs = XLSX.utils.json_to_sheet(leaveData);
        XLSX.utils.book_append_sheet(wb, leaveWs, "การลางาน");
        XLSX.writeFile(wb, `leave-requests-${dayjs().format('YYYY-MM-DD')}.xlsx`);
        setIsLoading(false);
        setSuccessMessage('ส่งออกข้อมูลการลางานสำเร็จแล้ว!');
        setShowSuccessModal(true);
      }, 800);
    };

    const exportBookings = () => {
      setIsLoading(true);
      setTimeout(() => {
        const wb = XLSX.utils.book_new();
        const bookingData = filteredBookings.map(booking => ({
          ID: booking.id,
          'ชื่อ-นามสกุล': booking.fullName,
          ห้อง: booking.room,
          วันที่: formatDate(booking.date),
          'เวลาเริ่มต้น': formatTime(booking.startTime),
          'เวลาสิ้นสุด': formatTime(booking.endTime),
          วัตถุประสงค์: booking.purpose,
          'เวลาบันทึก': formatTime(booking.timestamp.split('T')[1].substring(0, 5))
        }));
        const bookingWs = XLSX.utils.json_to_sheet(bookingData);
        XLSX.utils.book_append_sheet(wb, bookingWs, "การจองห้อง");
        XLSX.writeFile(wb, `room-bookings-${dayjs().format('YYYY-MM-DD')}.xlsx`);
        setIsLoading(false);
        setSuccessMessage('ส่งออกข้อมูลการจองห้องสำเร็จแล้ว!');
        setShowSuccessModal(true);
      }, 800);
    };

    // Filtered data with date range inclusion
    const filteredAttendance = attendanceRecords.filter(record => {
      const recordDate = record.date;
      if (attendanceStartDate && attendanceEndDate) {
        const start = attendanceStartDate.format('YYYY-MM-DD');
        const end = attendanceEndDate.format('YYYY-MM-DD');
        return recordDate >= start && recordDate <= end;
      }
      return true;
    });

    const filteredLeaves = leaveFilter
      ? leaveRequests.filter(leave => {
        const leaveDate = leave.leaveDate;
        const startDate = leaveFilter[0].format('YYYY-MM-DD');
        const endDate = leaveFilter[1].format('YYYY-MM-DD');
        return leaveDate >= startDate && leaveDate <= endDate;
      })
      : leaveRequests;

    const filteredBookings = bookingFilter
      ? roomBookings.filter(booking => {
        const bookingDate = booking.date;
        const startDate = bookingFilter[0].format('YYYY-MM-DD');
        const endDate = bookingFilter[1].format('YYYY-MM-DD');
        return bookingDate >= startDate && bookingDate <= endDate;
      })
      : roomBookings;

    // Enhanced Stats Card Component
    const EnhancedStatsCard: React.FC<{
      title: string;
      value: number | string;
      icon: React.ReactNode;
      color: string;
      subtitle?: string;
      progress?: number;
    }> = ({ title, value, icon, color, subtitle }) => (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center`}>
            {React.isValidElement(icon) &&
              React.cloneElement(icon as React.ReactElement<any>, {
                className: `text-${color}-600 text-xl`,
              })}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
    );

    // Enhanced Mobile Card Component
    const EnhancedMobileCard: React.FC<{ item: any; type: string }> = ({ item, type }) => (
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
        {type === 'attendance' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserOutlined className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.fullName}</h3>
                  <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>
            {item.reason && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 flex items-start gap-2">
                  <FileTextOutlined className="text-gray-400 mt-0.5" />
                  {item.reason}
                </p>
              </div>
            )}
          </div>
        )}

        {type === 'leave' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <ClockCircleOutlined className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.fullName}</h3>
                  <p className="text-sm text-gray-500">{item.type}</p>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarOutlined className="mr-2" />
                <span>{formatDate(item.leaveDate)}</span>
                {item.endDate && <span> - {formatDate(item.endDate)}</span>}
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <FileTextOutlined className="mr-2 mt-0.5" />
                <span>{item.reason}</span>
              </div>
            </div>

            {item.status === 'รอดำเนินการ' && (
              <div className="flex gap-2 pt-2">
                <Button
                  type="primary"
                  size="small"
                  onClick={() => updateLeaveStatus(item.id, 'อนุมัติ')}
                  className="flex-1"
                  icon={<CheckOutlined />}
                >
                  อนุมัติ
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => updateLeaveStatus(item.id, 'ปฏิเสธ')}
                  className="flex-1"
                  icon={<CloseCircleOutlined />}
                >
                  ปฏิเสธ
                </Button>
              </div>
            )}
          </div>
        )}

        {type === 'booking' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TagsOutlined className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.room}</h3>
                  <p className="text-sm text-gray-500">{item.fullName}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">#{item.id}</span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarOutlined className="mr-2" />
                <span>{formatDate(item.date)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ClockCircleOutlined className="mr-2" />
                <span>{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <FileTextOutlined className="mr-2 mt-0.5" />
                <span>{item.purpose}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    // Filter Component with predefined ranges
    const FilterComponent: React.FC<{
      filter: any;
      setFilter: React.Dispatch<React.SetStateAction<any>>;
      title: string
    }> = ({ title }) => {
      return (
        <div className="p-4 w-80">
          <div className="font-semibold text-gray-900 mb-3">{title}</div>
          <div className="space-y-3">
            <DatePicker
              locale={locale}
              format="DD/MM/YYYY"
              placeholder="วันที่เริ่มต้น"
              value={attendanceStartDate}
              onChange={setAttendanceStartDate}
              className="w-full mb-2"
            />
            <DatePicker
              locale={locale}
              format="DD/MM/YYYY"
              placeholder="วันที่สิ้นสุด"
              value={attendanceEndDate}
              onChange={setAttendanceEndDate}
              className="w-full"
            />
            <Button
              onClick={() => {
                setAttendanceStartDate(null);
                setAttendanceEndDate(null);
              }}
              className="w-full mt-2"
              icon={<SyncOutlined />}
            >
              ล้างตัวกรอง
            </Button>
          </div>
        </div>
      );
    };

    // Table columns
    const attendanceColumns = [
      {
        title: 'ชื่อ-นามสกุล',
        dataIndex: 'fullName',
        key: 'fullName',
        render: (text: string) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UserOutlined className="text-blue-600 text-sm" />
            </div>
            <span className="font-medium">{text}</span>
          </div>
        )
      },
      {
        title: 'วันที่',
        dataIndex: 'date',
        key: 'date',
        render: (date: string) => formatDate(date)
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => <StatusBadge status={status} />
      },
      {
        title: 'เหตุผล',
        dataIndex: 'reason',
        key: 'reason',
        render: (reason: string) => reason || <span className="text-gray-400">-</span>
      }
    ];

    const leaveColumns = [
      {
        title: 'ชื่อ-นามสกุล',
        dataIndex: 'fullName',
        key: 'fullName',
        render: (text: string) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <UserOutlined className="text-orange-600 text-sm" />
            </div>
            <span className="font-medium">{text}</span>
          </div>
        )
      },
      {
        title: 'ประเภท',
        dataIndex: 'type',
        key: 'type'
      },
      {
        title: 'วันที่',
        key: 'date',
        render: (record: LeaveRequest) => (
          <div>
            <div>{formatDate(record.leaveDate)}</div>
            {record.endDate && (
              <div className="text-xs text-gray-500">ถึง {formatDate(record.endDate)}</div>
            )}
          </div>
        )
      },
      {
        title: 'เหตุผล',
        dataIndex: 'reason',
        key: 'reason'
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => <StatusBadge status={status} />
      },
      {
        title: 'การดำเนินการ',
        key: 'action',
        render: (record: LeaveRequest) => (
          record.status === 'รอดำเนินการ' && (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => updateLeaveStatus(record.id, 'อนุมัติ')}
                icon={<CheckOutlined />}
              >
                อนุมัติ
              </Button>
              <Button
                danger
                size="small"
                onClick={() => updateLeaveStatus(record.id, 'ปฏิเสธ')}
                icon={<CloseCircleOutlined />}
              >
                ปฏิเสธ
              </Button>
            </Space>
          )
        )
      }
    ];

    const bookingColumns = [
      {
        title: 'ห้อง',
        dataIndex: 'room',
        key: 'room',
        render: (room: string) => <span className="font-medium">{room}</span>
      },
      {
        title: 'วันที่',
        dataIndex: 'date',
        key: 'date',
        render: (date: string) => formatDate(date)
      },
      {
        title: 'เวลา',
        key: 'time',
        render: (record: RoomBooking) => (
          <span className="text-gray-700">
            {formatTime(record.startTime)} - {formatTime(record.endTime)}
          </span>
        )
      },
      {
        title: 'จองโดย',
        dataIndex: 'fullName',
        key: 'fullName',
        render: (text: string) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <UserOutlined className="text-green-600 text-sm" />
            </div>
            <span className="font-medium">{text}</span>
          </div>
        )
      },
      {
        title: 'วัตถุประสงค์',
        dataIndex: 'purpose',
        key: 'purpose'
      }
    ];

    const tabItems = [
      {
        key: 'attendance',
        label: (
          <div className="flex items-center gap-2">
            <TeamOutlined />
            <span className="hidden sm:inline">การเข้าโรงเรียน</span>
            <Badge count={filteredAttendance.length} size="small" />
          </div>
        )
      },
      {
        key: 'leaves',
        label: (
          <div className="flex items-center gap-2">
            <ClockCircleOutlined />
            <span className="hidden sm:inline">การลา</span>
            <Badge
              count={filteredLeaves.filter(leave => leave.status === 'รอดำเนินการ').length}
              size="small"
            />
          </div>
        )
      },
      {
        key: 'bookings',
        label: (
          <div className="flex items-center gap-2">
            <TagsOutlined />
            <span className="hidden sm:inline">จองห้อง</span>
            <Badge count={filteredBookings.length} size="small" />
          </div>
        )
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChartOutlined className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">แดชบอร์ดผู้ดูแล</h1>
                  <p className="text-gray-600 mt-1">จัดการและติดตามการเข้าโรงเรียน การลา และการจองห้อง</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden lg:block text-right">
                  <p className="text-sm text-gray-500">วันนี้</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {dayjs().format('DD/MM/YYYY')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    icon={<BellOutlined />}
                    size="large"
                    className="hidden sm:flex"
                  />
                  <Button icon={<SettingOutlined />} size="large" className="hidden sm:flex" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Enhanced Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <EnhancedStatsCard
              title="เข้าโรงเรียน"
              value={`${summary.present.today}`}
              subtitle={`คน`}
              icon={<TeamOutlined />}
              color="green"
            />
            <EnhancedStatsCard
              title="ขาดโรงเรียน"
              value={summary.absent.today}
              subtitle="คน"
              icon={<CloseCircleOutlined />}
              color="red"
            />
            <EnhancedStatsCard
              title="เข้าสาย"
              value={summary.late.today}
              subtitle="คน"
              icon={<WarningOutlined />}
              color="orange"
            />
            <EnhancedStatsCard
              title="คำขอลา"
              value={filteredLeaves.filter(leave => leave.status === 'รอดำเนินการ').length}
              subtitle="รอดำเนินการ"
              icon={<ClockCircleOutlined />}
              color="blue"
            />
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="border-b border-gray-200">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                className="px-6"
                size="large"
              />
            </div>

            <div className="p-6">
              {activeTab === 'attendance' && (
                <div>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">บันทึกการเข้าโรงเรียน</h2>
                      <p className="text-gray-600">จัดการและติดตามการเข้าโรงเรียนของบุคลากร</p>
                    </div>
                    <div className="flex gap-3">
                      <Popover
                        content={<FilterComponent filter={attendanceFilter} setFilter={setAttendanceFilter} title="กรองข้อมูลการเข้าโรงเรียน" />}
                        title="ตัวกรองขั้นสูง"
                        trigger="click"
                        placement="bottomRight"
                      >
                        <Button icon={<FilterOutlined />} size="large">
                          กรองข้อมูล
                          {attendanceFilter && <CheckOutlined className="ml-2 text-green-600" />}
                        </Button>
                      </Popover>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={exportAttendance}
                        loading={isLoading}
                        size="large"
                      >
                        ส่งออก Excel
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block">
                    <Table
                      dataSource={filteredAttendance}
                      columns={attendanceColumns}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`
                      }}
                      rowKey="id"
                      className="rounded-lg overflow-hidden"
                    />
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-4">
                    {filteredAttendance.length > 0 ? (
                      filteredAttendance.map((item) => (
                        <EnhancedMobileCard key={item.id} item={item} type="attendance" />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <TeamOutlined className="text-gray-300 text-4xl mb-4" />
                        <p className="text-gray-500">ไม่พบข้อมูลการเข้าโรงเรียน</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'leaves' && (
                <div>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">คำขอลาที่รอดำเนินการ</h2>
                      <p className="text-gray-600">อนุมัติหรือปฏิเสธคำขอลาของบุคลากร</p>
                    </div>
                    <div className="flex gap-3">
                      <Popover
                        content={<FilterComponent filter={leaveFilter} setFilter={setLeaveFilter} title="กรองข้อมูลการลา" />}
                        title="ตัวกรองขั้นสูง"
                        trigger="click"
                        placement="bottomRight"
                      >
                        <Button icon={<FilterOutlined />} size="large">
                          กรองข้อมูล
                          {leaveFilter && <CheckOutlined className="ml-2 text-green-600" />}
                        </Button>
                      </Popover>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={exportLeaves}
                        loading={isLoading}
                        size="large"
                      >
                        ส่งออก Excel
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block">
                    <Table
                      dataSource={filteredLeaves}
                      columns={leaveColumns}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`
                      }}
                      rowKey="id"
                    />
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-4">
                    {filteredLeaves.filter(leave => leave.status === 'รอดำเนินการ').length > 0 ? (
                      filteredLeaves
                        .filter(leave => leave.status === 'รอดำเนินการ')
                        .map((item) => (
                          <EnhancedMobileCard key={item.id} item={item} type="leave" />
                        ))
                    ) : (
                      <div className="text-center py-12">
                        <ClockCircleOutlined className="text-gray-300 text-4xl mb-4" />
                        <p className="text-gray-500">ไม่พบคำขอลาที่รอดำเนินการ</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">การจองห้อง</h2>
                      <p className="text-gray-600">จัดการและติดตามการจองห้องเรียนและห้องประชุม</p>
                    </div>
                    <div className="flex gap-3">
                      <Popover
                        content={<FilterComponent filter={bookingFilter} setFilter={setBookingFilter} title="กรองข้อมูลการจอง" />}
                        title="ตัวกรองขั้นสูง"
                        trigger="click"
                        placement="bottomRight"
                      >
                        <Button icon={<FilterOutlined />} size="large">
                          กรองข้อมูล
                          {bookingFilter && <CheckOutlined className="ml-2 text-green-600" />}
                        </Button>
                      </Popover>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={exportBookings}
                        loading={isLoading}
                        size="large"
                      >
                        ส่งออก Excel
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block">
                    <Table
                      dataSource={filteredBookings}
                      columns={bookingColumns}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`
                      }}
                      rowKey="id"
                    />
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-4">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((item) => (
                        <EnhancedMobileCard key={item.id} item={item} type="booking" />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <TagsOutlined className="text-gray-300 text-4xl mb-4" />
                        <p className="text-gray-500">ไม่พบข้อมูลการจองห้อง</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Success Modal
  const SuccessModal = () => (
    <Modal
      open={showSuccessModal}
      onCancel={() => setShowSuccessModal(false)}
      title="สำเร็จ!"
      footer={null}
      centered
    >
      <div className="text-center py-4">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleOutlined className="text-green-600 text-2xl" />
        </div>
        <p className="text-gray-700 mb-6 text-lg font-medium">{successMessage}</p>
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={() => setShowSuccessModal(false)}
            type="primary"
            block
            size="large"
          >
            ดำเนินการต่อ
          </Button>
          {currentUser?.role === 'user' && currentPage !== 'dashboard' && (
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                setCurrentPage('dashboard');
              }}
              block
              size="large"
            >
              ดูแดชบอร์ด
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );

  // Main render
  if (!currentUser || currentPage === 'login') {
    return <LoginPage />;
  }

  // ในส่วน renderPage
  const renderPage = () => {
    switch (currentPage) {
      case 'attendance':
        return <AttendancePage />;
      case 'leave':
        return <LeavePage />;
      case 'booking':
        return <BookingPage />;
      case 'dashboard':
        return currentUser.role === 'admin'
          ? <DashboardPage />
          : <UserDashboardPage />;
      case 'user-dashboard':
        return <UserDashboardPage />;
      default:
        return <AttendancePage />;
    }
  };

  return (
    <>
      <Navigation />
      <SuccessModal />
    </>
  );
};

export default App;