import React, { useState, useEffect } from 'react';
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
  LeftOutlined,
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
  CheckOutlined
} from '@ant-design/icons';

dayjs.extend(buddhistEra);
dayjs.locale('th');

const { Header, Sider, Content } = Layout;
const { RangePicker } = DatePicker;
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
    'รอดำเนินการ': { color: 'default', icon: <SyncOutlined spin /> },
    'อนุมัติ': { color: 'green', icon: <CheckCircleOutlined /> },
    'ปฏิเสธ': { color: 'red', icon: <CloseCircleOutlined /> }
  };

  const config = statusConfig[status] || { color: 'default', icon: null };

  return (
    <Tag icon={config.icon} color={config.color}>
      {status}
    </Tag>
  );
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

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    setShowMobileOverlay(!collapsed);
  };

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
      ...(currentUser?.role === 'admin' ? [{ key: 'dashboard', label: 'แดชบอร์ด', icon: <BarChartOutlined /> }] : [])
    ];

    return (
      <Layout className="min-h-screen">
        {showMobileOverlay && (
          <div
            className="mobile-overlay md:hidden"
            onClick={() => {
              setCollapsed(true);
              setShowMobileOverlay(false);
            }}
          />
        )}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          theme="dark"
          className={`!bg-gradient-to-b from-indigo-700 to-purple-800 ${collapsed ? 'collapsed-mobile' : ''}`}
        >
          <div className="p-5 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">ระบบจัดการโรงเรียน</h2>
            </div>
            <p className="text-sm opacity-90 mt-1">ยินดีต้อนรับ, {currentUser?.displayName}</p>
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[currentPage]}
            items={menuItems}
            onSelect={({ key }) => {
              setCurrentPage(key);
              setCollapsed(true);
              setShowMobileOverlay(false);
            }}
            className="bg-transparent"
          />

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={() => {
                setCurrentUser(null);
                setCurrentPage('login');
              }}
              block
              size="large"
              icon={<LogoutOutlined />}
              className="text-white border-white hover:bg-indigo-600"
            >
              {!collapsed && <span className="text-white">ออกจากระบบ</span>}
            </Button>
          </div>
        </Sider>

        <Layout>
          <Header className="bg-white shadow-sm flex items-center px-4">
            <Button
              type="text"
              icon={collapsed ? <MenuOutlined className="text-gray-700 text-xl" /> : <LeftOutlined className="text-gray-700 text-xl" />}
              onClick={toggleSidebar}
              className="text-lg mr-4"
            />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <span className="font-medium">{currentUser?.displayName}</span>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserOutlined className="text-indigo-600" />
              </div>
            </div>
          </Header>

          <Content className="p-6 bg-gray-50 min-h-[280px]">
            {renderPage()}
          </Content>
        </Layout>
      </Layout>
    );
  };

  // Dashboard Stats Card
  const StatsCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    trend?: number;
  }> = ({ title, value, icon, color, trend }) => {
    return (
      <Card className="h-full shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className={`bg-${color}-100 w-12 h-12 rounded-xl flex items-center justify-center mr-4`}>
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
      </Card>
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

      const startHour = parseInt(values.startTime.split(':')[0]);
      const endHour = parseInt(values.endTime.split(':')[0]);

      if (endHour <= startHour) {
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
          (parseInt(values.startTime) >= parseInt(booking.startTime) &&
            parseInt(values.startTime) < parseInt(booking.endTime)) ||
          (parseInt(values.endTime) > parseInt(booking.startTime) &&
            parseInt(values.endTime) <= parseInt(booking.endTime))
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

      // Check availability again before submitting
      const isBooked = roomBookings.some(booking =>
        booking.room === values.room &&
        booking.date === dateStr &&
        (
          (parseInt(values.startTime) >= parseInt(booking.startTime) &&
            parseInt(values.startTime) < parseInt(booking.endTime)) ||
          (parseInt(values.endTime) > parseInt(booking.startTime) &&
            parseInt(values.endTime) <= parseInt(booking.endTime))
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
                      return !startTime || parseInt(time) > parseInt(startTime);
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

  // Admin Dashboard
  const DashboardPage = () => {
    const [attendanceFilter, setAttendanceFilter] = useState<any>(null);
    const [leaveFilter, setLeaveFilter] = useState<any>(null);
    const [bookingFilter, setBookingFilter] = useState<any>(null);

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

    // Export functions for each section
    const exportAttendance = () => {
      setIsLoading(true);

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
    };

    const exportLeaves = () => {
      setIsLoading(true);

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
    };

    const exportBookings = () => {
      setIsLoading(true);

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
    };

    // Filtered data
    const filteredAttendance = attendanceFilter
      ? attendanceRecords.filter(record => {
        const recordDate = dayjs(record.date);
        return recordDate.isAfter(attendanceFilter[0]) && recordDate.isBefore(attendanceFilter[1]);
      })
      : attendanceRecords;

    const filteredLeaves = leaveFilter
      ? leaveRequests.filter(leave => {
        const leaveDate = dayjs(leave.leaveDate);
        return leaveDate.isAfter(leaveFilter[0]) && leaveDate.isBefore(leaveFilter[1]);
      })
      : leaveRequests;

    const filteredBookings = bookingFilter
      ? roomBookings.filter(booking => {
        const bookingDate = dayjs(booking.date);
        return bookingDate.isAfter(bookingFilter[0]) && bookingDate.isBefore(bookingFilter[1]);
      })
      : roomBookings;

    // Table columns
    const attendanceColumns = [
      { title: 'ชื่อ', dataIndex: 'fullName', key: 'fullName' },
      { title: 'วันที่', dataIndex: 'date', key: 'date', render: (date: string) => formatDate(date) },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => <StatusBadge status={status} />
      },
      { title: 'เหตุผล', dataIndex: 'reason', key: 'reason' },
    ];

    const leaveColumns = [
      { title: 'ชื่อ', dataIndex: 'fullName', key: 'fullName' },
      { title: 'ประเภท', dataIndex: 'type', key: 'type' },
      {
        title: 'วันที่',
        key: 'date',
        render: (record: LeaveRequest) => (
          <span>
            {formatDate(record.leaveDate)}
            {record.endDate && ` - ${formatDate(record.endDate)}`}
          </span>
        )
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
              >
                อนุมัติ
              </Button>
              <Button
                danger
                size="small"
                onClick={() => updateLeaveStatus(record.id, 'ปฏิเสธ')}
              >
                ปฏิเสธ
              </Button>
            </Space>
          )
        )
      },
    ];

    const bookingColumns = [
      { title: 'ห้อง', dataIndex: 'room', key: 'room' },
      { title: 'วันที่', dataIndex: 'date', key: 'date', render: (date: string) => formatDate(date) },
      {
        title: 'เวลา',
        key: 'time',
        render: (record: RoomBooking) => (
          <span>
            {formatTime(record.startTime)} - {formatTime(record.endTime)}
          </span>
        )
      },
      { title: 'จองโดย', dataIndex: 'fullName', key: 'fullName' },
    ];

    // Filter components
    const AttendanceFilter = () => (
      <div className="p-3">
        <div className="font-medium mb-2">กรองวันที่</div>
        <RangePicker
          locale={locale}
          format="DD/MM/YYYY"
          value={attendanceFilter}
          onChange={setAttendanceFilter}
          className="w-full"
        />
        <Button
          onClick={() => setAttendanceFilter(null)}
          className="mt-2 w-full"
          size="small"
        >
          ล้างตัวกรอง
        </Button>
      </div>
    );

    const LeaveFilter = () => (
      <div className="p-3">
        <div className="font-medium mb-2">กรองวันที่</div>
        <RangePicker
          locale={locale}
          format="DD/MM/YYYY"
          value={leaveFilter}
          onChange={setLeaveFilter}
          className="w-full"
        />
        <Button
          onClick={() => setLeaveFilter(null)}
          className="mt-2 w-full"
          size="small"
        >
          ล้างตัวกรอง
        </Button>
      </div>
    );

    const BookingFilter = () => (
      <div className="p-3">
        <div className="font-medium mb-2">กรองวันที่</div>
        <RangePicker
          locale={locale}
          format="DD/MM/YYYY"
          value={bookingFilter}
          onChange={setBookingFilter}
          className="w-full"
        />
        <Button
          onClick={() => setBookingFilter(null)}
          className="mt-2 w-full"
          size="small"
        >
          ล้างตัวกรอง
        </Button>
      </div>
    );

    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">แดชบอร์ดผู้ดูแล</h1>
          <p className="text-gray-600">ภาพรวมการเข้าโรงเรียนและการจองห้อง</p>
        </div>

        {/* Stats Summary */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={6} className="mb-4">
            <StatsCard
              title="มาโรงเรียนวันนี้"
              value={summary.present.today}
              icon={<TeamOutlined className="text-green-600 text-xl" />}
              color="green"
              trend={summary.present.trend}
            />
          </Col>
          <Col xs={24} sm={12} md={6} className="mb-4">
            <StatsCard
              title="ขาดโรงเรียนวันนี้"
              value={summary.absent.today}
              icon={<CloseCircleOutlined className="text-red-600 text-xl" />}
              color="red"
              trend={summary.absent.trend}
            />
          </Col>
          <Col xs={24} sm={12} md={6} className="mb-4">
            <StatsCard
              title="สายวันนี้"
              value={summary.late.today}
              icon={<WarningOutlined className="text-orange-600 text-xl" />}
              color="orange"
              trend={summary.late.trend}
            />
          </Col>
          <Col xs={24} sm={12} md={6} className="mb-4">
            <StatsCard
              title="ลาวันนี้"
              value={summary.leave.today}
              icon={<ClockCircleOutlined className="text-blue-600 text-xl" />}
              color="blue"
              trend={summary.leave.trend}
            />
          </Col>
        </Row>

        {/* Sections */}
        <Card
          className="mb-6 shadow-sm"
          title={
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-indigo-600" />
              <span>บันทึกการเข้าโรงเรียนล่าสุด</span>
              <Badge count={filteredAttendance.length} className="ml-2" />
            </div>
          }
          extra={
            <Space>
              <Popover
                content={<AttendanceFilter />}
                title="กรองข้อมูล"
                trigger="click"
                placement="bottomRight"
              >
                <Button icon={<FilterOutlined />}>
                  กรอง
                  {attendanceFilter && <CheckOutlined className="ml-1 text-green-600" />}
                </Button>
              </Popover>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportAttendance}
                loading={isLoading}
              >
                ส่งออก
              </Button>
            </Space>
          }
        >
          <Table
            dataSource={filteredAttendance}
            columns={attendanceColumns}
            pagination={{ pageSize: 5 }}
            rowKey="id"
            size="small"
          />
        </Card>

        <Card
          className="mb-6 shadow-sm"
          title={
            <div className="flex items-center gap-2">
              <TagsOutlined className="text-purple-600" />
              <span>การจองห้องล่าสุด</span>
              <Badge count={filteredBookings.length} className="ml-2" />
            </div>
          }
          extra={
            <Space>
              <Popover
                content={<BookingFilter />}
                title="กรองข้อมูล"
                trigger="click"
                placement="bottomRight"
              >
                <Button icon={<FilterOutlined />}>
                  กรอง
                  {bookingFilter && <CheckOutlined className="ml-1 text-green-600" />}
                </Button>
              </Popover>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportBookings}
                loading={isLoading}
              >
                ส่งออก
              </Button>
            </Space>
          }
        >
          <Table
            dataSource={filteredBookings}
            columns={bookingColumns}
            pagination={{ pageSize: 5 }}
            rowKey="id"
            size="small"
          />
        </Card>

        <Card
          className="shadow-sm"
          title={
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-blue-600" />
              <span>คำขอลาที่รอดำเนินการ</span>
              <Badge count={filteredLeaves.filter(leave => leave.status === 'รอดำเนินการ').length} className="ml-2" />
            </div>
          }
          extra={
            <Space>
              <Popover
                content={<LeaveFilter />}
                title="กรองข้อมูล"
                trigger="click"
                placement="bottomRight"
              >
                <Button icon={<FilterOutlined />}>
                  กรอง
                  {leaveFilter && <CheckOutlined className="ml-1 text-green-600" />}
                </Button>
              </Popover>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportLeaves}
                loading={isLoading}
              >
                ส่งออก
              </Button>
            </Space>
          }
        >
          <Table
            dataSource={filteredLeaves.filter(leave => leave.status === 'รอดำเนินการ')}
            columns={leaveColumns}
            pagination={{ pageSize: 5 }}
            rowKey="id"
            size="small"
          />
        </Card>
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
    <>
      <Navigation />
      <SuccessModal />
    </>
  );
};

export default App;