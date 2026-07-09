import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Bug, Film, User, Send, CheckCircle, Sparkles, AlertTriangle, Mail, Upload, Image, Video, Trash2, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ReportType = 'bug' | 'movie' | 'user';

function getFriendlySmtpErrorMessage(error: string): React.ReactNode {
  if (!error) return 'Chưa thiết lập cấu hình SMTP.';
  
  const lower = error.toLowerCase();
  if (lower.includes('535') || lower.includes('authentication failed') || lower.includes('invalid login')) {
    return (
      <div className="space-y-1 text-zinc-300 font-sans text-xs">
        <p className="font-bold text-rose-400 flex items-center gap-1.5">
          ❌ Lỗi 535: Xác thực tài khoản SMTP thất bại (Authentication Failed)
        </p>
        <div className="leading-relaxed text-[11px] text-zinc-400 space-y-1">
          <p><strong>Nguyên nhân:</strong> Sai tài khoản đăng nhập hoặc mật khẩu SMTP đã nhập.</p>
          <div className="bg-black/30 p-2.5 rounded-xl border border-zinc-850/50 space-y-1 mt-1 text-[11px] text-zinc-300">
            <p className="text-amber-400 font-bold">💡 Hướng dẫn cấu hình Google Gmail SMTP:</p>
            <p className="pl-1">
              • Bạn <span className="text-rose-400 font-bold">KHÔNG ĐƯỢC</span> dùng mật khẩu đăng nhập Gmail cá nhân thông thường.
              <br />
              • Bạn phải bật <span className="text-emerald-400">Xác minh 2 bước</span> trên tài khoản Google, sau đó truy cập mục <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-blue-400 underline hover:text-blue-300 font-bold">Mật khẩu ứng dụng (App Passwords)</a> để tạo mã ứng dụng gồm 16 ký tự.
              <br />
              • Copy mã 16 ký tự viết liền đó và dán vào trường <strong>"Mật khẩu SMTP"</strong> ở mục cấu hình nâng cao bên dưới.
            </p>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            * Nếu dùng dịch vụ SMTP khác (Brevo, SendGrid, v.v.): Vui lòng kiểm tra kỹ xem bạn đã sao chép đúng SMTP API Key hoặc Password chưa.
          </p>
        </div>
      </div>
    );
  }

  if (lower.includes('econnrefused') || lower.includes('connection refused') || lower.includes('timeout')) {
    return (
      <div className="space-y-1 text-zinc-300 font-sans text-xs">
        <p className="font-bold text-rose-400">
          ❌ Lỗi kết nối: Không thể kết nối tới máy chủ SMTP (Connection Refused/Timeout)
        </p>
        <p className="leading-relaxed text-[11px] text-zinc-400">
          <strong>💡 Cách khắc phục:</strong> Vui lòng kiểm tra lại địa chỉ <strong>SMTP Host</strong> và cổng <strong>SMTP Port</strong>.
          <br />
          • Thông thường cổng <strong>587</strong> yêu cầu bật chế độ TLS, cổng <strong>465</strong> yêu cầu SSL, còn cổng <strong>25</strong> không bảo mật thường bị các nhà cung cấp cloud chặn chặn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 text-zinc-300 font-sans text-xs">
      <p className="font-bold text-rose-400">❌ Lỗi SMTP xảy ra:</p>
      <p className="font-mono text-[11px] bg-black/25 p-1.5 rounded border border-zinc-850/60 text-rose-300 break-all whitespace-pre-wrap">
        {error}
      </p>
      <p className="text-[10px] text-zinc-500 leading-normal">
        Vui lòng kiểm tra lại thông tin cấu hình Host, Port, Username, Password ở phần Cấu hình gửi mail SMTP (Nâng cao).
      </p>
    </div>
  );
}

interface OpenReportEventDetail {
  type?: ReportType;
  movieName?: string;
  episodeName?: string;
  reportedUser?: string;
  location?: string;
}

export default function ReportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ReportType>('bug');
  
  // Form states - common
  const [email, setEmail] = useState('');
  
  // Form states - Bug
  const [bugTitle, setBugTitle] = useState('');
  const [bugFeature, setBugFeature] = useState('Xem Phim');
  const [bugDevice, setBugDevice] = useState('Máy tính / Laptop');
  const [bugDesc, setBugDesc] = useState('');

  // Form states - Movie
  const [movieName, setMovieName] = useState('');
  const [movieEpisode, setMovieEpisode] = useState('');
  const [movieIssue, setMovieIssue] = useState('Link hỏng / Không xem được');
  const [movieDesc, setMovieDesc] = useState('');

  // Form states - User
  const [reportedUser, setReportedUser] = useState('');
  const [userViolation, setUserViolation] = useState('Bình luận thô tục / xúc phạm');
  const [violationLocation, setViolationLocation] = useState('');
  const [userDesc, setUserDesc] = useState('');

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [targetEmail, setTargetEmail] = useState('muahakhongcoem@proton.me');

  // Attachment states
  const [images, setImages] = useState<{ name: string; base64: string; preview: string }[]>([]);
  const [video, setVideo] = useState<{ name: string; base64: string; size: number } | null>(null);
  const [attachmentError, setAttachmentError] = useState('');
  const [isDragOverImage, setIsDragOverImage] = useState(false);
  const [isDragOverVideo, setIsDragOverVideo] = useState(false);

  // SMTP custom client config states
  const [smtpMode, setSmtpMode] = useState<'gmail' | 'custom'>(() => (localStorage.getItem('ff_smtp_mode') as 'gmail' | 'custom') || 'gmail');
  const [smtpHost, setSmtpHost] = useState(() => localStorage.getItem('ff_smtp_host') || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(() => localStorage.getItem('ff_smtp_port') || '587');
  const [smtpUser, setSmtpUser] = useState(() => localStorage.getItem('ff_smtp_user') || '');
  const [smtpPass, setSmtpPass] = useState(() => localStorage.getItem('ff_smtp_pass') || '');
  const [smtpFromEmail, setSmtpFromEmail] = useState(() => localStorage.getItem('ff_smtp_from') || '');
  const [smtpToEmail, setSmtpToEmail] = useState(() => localStorage.getItem('ff_smtp_to') || 'lehuybao17112007@gmail.com');
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);
  const [sentRealEmail, setSentRealEmail] = useState(false);
  const [smtpError, setSmtpError] = useState('');

  // Persist SMTP state to local storage
  useEffect(() => {
    localStorage.setItem('ff_smtp_mode', smtpMode);
    localStorage.setItem('ff_smtp_host', smtpHost);
    localStorage.setItem('ff_smtp_port', smtpPort);
    localStorage.setItem('ff_smtp_user', smtpUser);
    localStorage.setItem('ff_smtp_pass', smtpPass);
    localStorage.setItem('ff_smtp_from', smtpFromEmail);
    localStorage.setItem('ff_smtp_to', smtpToEmail);
  }, [smtpMode, smtpHost, smtpPort, smtpUser, smtpPass, smtpFromEmail, smtpToEmail]);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<OpenReportEventDetail>;
      const detail = customEvent.detail || {};
      
      if (detail.type) {
        setActiveTab(detail.type);
      }
      if (detail.movieName) {
        setMovieName(detail.movieName);
      } else {
        setMovieName('');
      }
      if (detail.episodeName) {
        setMovieEpisode(detail.episodeName);
      } else {
        setMovieEpisode('');
      }
      if (detail.reportedUser) {
        setReportedUser(detail.reportedUser);
      } else {
        setReportedUser('');
      }
      if (detail.location) {
        setViolationLocation(detail.location);
        setBugTitle(`Lỗi tại trang: ${detail.location}`);
      } else {
        setViolationLocation('');
        setBugTitle('');
      }

      // Reset submission states
      setIsSuccess(false);
      setErrorMsg('');
      setIsSubmitting(false);
      setIsOpen(true);
    };

    window.addEventListener('open-report-modal', handleOpen);
    return () => {
      window.removeEventListener('open-report-modal', handleOpen);
    };
  }, []);

  const handleTabChange = (tab: ReportType) => {
    setActiveTab(tab);
    setErrorMsg('');
  };

  const validateForm = () => {
    if (!email) {
      setErrorMsg('Vui lòng cung cấp địa chỉ email liên hệ!');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Địa chỉ email không hợp lệ!');
      return false;
    }

    if (activeTab === 'bug') {
      if (!bugTitle.trim()) {
        setErrorMsg('Vui lòng nhập tiêu đề lỗi!');
        return false;
      }
      if (!bugDesc.trim()) {
        setErrorMsg('Vui lòng nhập mô tả chi tiết lỗi!');
        return false;
      }
    } else if (activeTab === 'movie') {
      if (!movieName.trim()) {
        setErrorMsg('Vui lòng nhập tên phim bị lỗi!');
        return false;
      }
      if (!movieDesc.trim()) {
        setErrorMsg('Vui lòng nhập mô tả lỗi phim!');
        return false;
      }
    } else if (activeTab === 'user') {
      if (!reportedUser.trim()) {
        setErrorMsg('Vui lòng nhập tên hoặc ID người dùng vi phạm!');
        return false;
      }
      if (!userDesc.trim()) {
        setErrorMsg('Vui lòng nhập chi tiết hành vi vi phạm!');
        return false;
      }
    }

    setErrorMsg('');
    return true;
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError('');
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files) as File[];
    if (images.length + fileList.length > 5) {
      setAttachmentError('Bạn chỉ được đính kèm tối đa 5 hình ảnh!');
      return;
    }

    const newImages = [...images];
    for (const file of fileList) {
      if (!file.type.startsWith('image/')) {
        setAttachmentError('Tệp đính kèm không phải là ảnh hợp lệ!');
        continue;
      }
      try {
        const base64 = await readFileAsDataURL(file);
        newImages.push({
          name: file.name,
          base64,
          preview: URL.createObjectURL(file)
        });
      } catch (err) {
        console.error('Lỗi khi đọc file ảnh:', err);
      }
    }
    setImages(newImages.slice(0, 5));
    e.target.value = '';
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('video/')) {
      setAttachmentError('Tệp đính kèm không phải là video hợp lệ!');
      return;
    }

    const maxSizeBytes = 250 * 1024 * 1024; // 250MB
    if (file.size > maxSizeBytes) {
      setAttachmentError('Dung lượng video không được vượt quá 250MB!');
      return;
    }

    try {
      const base64 = await readFileAsDataURL(file);
      setVideo({
        name: file.name,
        base64,
        size: file.size
      });
    } catch (err) {
      console.error('Lỗi khi đọc file video:', err);
      setAttachmentError('Không thể đọc file video này.');
    }
    e.target.value = '';
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverImage(true);
  };

  const handleImageDragLeave = () => {
    setIsDragOverImage(false);
  };

  const handleImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverImage(false);
    setAttachmentError('');

    const files = e.dataTransfer.files;
    if (!files) return;

    const fileList = Array.from(files) as File[];
    if (images.length + fileList.length > 5) {
      setAttachmentError('Bạn chỉ được đính kèm tối đa 5 hình ảnh!');
      return;
    }

    const newImages = [...images];
    for (const file of fileList) {
      if (!file.type.startsWith('image/')) {
        setAttachmentError('Tệp đính kèm không phải là ảnh hợp lệ!');
        continue;
      }
      try {
        const base64 = await readFileAsDataURL(file);
        newImages.push({
          name: file.name,
          base64,
          preview: URL.createObjectURL(file)
        });
      } catch (err) {
        console.error('Lỗi khi đọc file ảnh:', err);
      }
    }
    setImages(newImages.slice(0, 5));
  };

  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverVideo(true);
  };

  const handleVideoDragLeave = () => {
    setIsDragOverVideo(false);
  };

  const handleVideoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverVideo(false);
    setAttachmentError('');

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('video/')) {
      setAttachmentError('Tệp đính kèm không phải là video hợp lệ!');
      return;
    }

    const maxSizeBytes = 250 * 1024 * 1024; // 250MB
    if (file.size > maxSizeBytes) {
      setAttachmentError('Dung lượng video không được vượt quá 250MB!');
      return;
    }

    try {
      const base64 = await readFileAsDataURL(file);
      setVideo({
        name: file.name,
        base64,
        size: file.size
      });
    } catch (err) {
      console.error('Lỗi khi đọc file video:', err);
      setAttachmentError('Không thể đọc file video này.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let payloadContent = '';
      let payloadTitle = '';
      let extraData: Record<string, any> = {};

      if (activeTab === 'bug') {
        payloadTitle = bugTitle;
        payloadContent = bugDesc;
        extraData = {
          'Chức năng lỗi': bugFeature,
          'Thiết bị sử dụng': bugDevice
        };
      } else if (activeTab === 'movie') {
        payloadTitle = `Báo lỗi phim: ${movieName}`;
        payloadContent = movieDesc;
        extraData = {
          'Tên phim': movieName,
          'Tập phim': movieEpisode || 'Không rõ',
          'Vấn đề gặp phải': movieIssue
        };
      } else if (activeTab === 'user') {
        payloadTitle = `Báo cáo người dùng: ${reportedUser}`;
        payloadContent = userDesc;
        extraData = {
          'Đối tượng bị tố cáo': reportedUser,
          'Hành vi vi phạm': userViolation,
          'Nơi xảy ra vi phạm': violationLocation || 'Phần bình luận chung'
        };
      }

      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: activeTab,
          email,
          title: payloadTitle,
          content: payloadContent,
          extraData,
          images: images.map(img => img.base64),
          video: video ? { name: video.name, base64: video.base64 } : null,
          smtpConfig: smtpUser && smtpPass ? {
            host: smtpMode === 'gmail' ? 'smtp.gmail.com' : (smtpHost || 'smtp.gmail.com'),
            port: smtpMode === 'gmail' ? '587' : (smtpPort || '587'),
            user: smtpUser,
            pass: smtpPass,
            fromEmail: smtpMode === 'gmail' ? smtpUser : (smtpFromEmail || smtpUser),
            toEmail: smtpToEmail || 'lehuybao17112007@gmail.com'
          } : null
        })
      });

      const data = await response.json();

      if (response.ok && data.status) {
        setIsSuccess(true);
        setSentRealEmail(data.sentRealEmail);
        setSmtpError(data.smtpError || '');
        if (data.targetEmail) {
          setTargetEmail(data.targetEmail);
        }
      } else {
        setErrorMsg(data.message || 'Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể kết nối với máy chủ. Vui lòng kiểm tra lại mạng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset all fields
  const handleReset = () => {
    setEmail('');
    setBugTitle('');
    setBugDesc('');
    setMovieName('');
    setMovieEpisode('');
    setMovieDesc('');
    setReportedUser('');
    setViolationLocation('');
    setUserDesc('');
    setImages([]);
    setVideo(null);
    setAttachmentError('');
    setIsSuccess(false);
    setErrorMsg('');
  };

  const tabs = [
    { id: 'bug', label: 'Báo lỗi hệ thống', icon: <Bug size={14} />, color: 'text-blue-500' },
    { id: 'movie', label: 'Báo cáo phim lỗi', icon: <Film size={14} />, color: 'text-amber-500' },
    { id: 'user', label: 'Báo cáo người dùng', icon: <User size={14} />, color: 'text-red-500' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="report-global-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl bg-zinc-950 border border-zinc-850 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col min-h-[500px] max-h-[90vh] z-10 border-zinc-800/80"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-900/60 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                  <AlertTriangle size={14} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Hệ thống báo cáo &amp; Phản hồi</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">TỰ ĐỘNG GỬI VỀ HÒM THƯ ADMIN</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 pt-3 shrink-0">
              <div className="flex p-1 bg-zinc-900/40 border border-zinc-900/80 rounded-xl gap-1">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as ReportType)}
                      disabled={isSubmitting || isSuccess}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-[#E63946] text-white shadow-md' 
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                      }`}
                    >
                      <span className={isActive ? 'text-white' : tab.color}>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-left">
              {isSuccess ? (
                /* Success Screen */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 px-4 text-center h-full"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 relative">
                    <CheckCircle size={32} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  </div>
                  <h4 className="text-base font-black text-white uppercase tracking-wide">Gửi Báo Cáo Thành Công!</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mt-3 leading-relaxed font-sans">
                    Nội dung phản hồi của bạn đã được đóng gói và chuyển lên hệ thống:
                  </p>
                  <div className="bg-zinc-900/60 border border-zinc-850 rounded-xl px-4 py-2 mt-4 text-xs font-mono text-zinc-300 font-bold select-all">
                    {targetEmail}
                  </div>

                  {sentRealEmail ? (
                    <div className="mt-4 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-sans flex items-center justify-center gap-2 w-full max-w-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold">Đã gửi email thực tế thành công qua SMTP!</span>
                    </div>
                  ) : (
                    <div className="mt-4 px-4 py-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-sans text-left space-y-1.5 w-full max-w-md">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <AlertTriangle size={14} className="shrink-0 text-amber-500" />
                        <span>Chưa nhận được email thực tế!</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        Hệ thống đã ghi nhận báo cáo, nhưng không thể gửi email thực tế đến hòm thư do:
                      </p>
                      <div className="p-3 bg-black/50 rounded-xl border border-zinc-900 leading-relaxed text-zinc-300">
                        {getFriendlySmtpErrorMessage(smtpError)}
                      </div>
                      <p className="text-[10px] text-zinc-500 italic mt-1 leading-normal">
                        💡 Bạn có thể sửa cấu hình ngay và nhấn "Gửi tiếp báo cáo khác" để thử lại.
                      </p>
                    </div>
                  )}

                  <p className="text-[10px] text-zinc-500 mt-6 italic font-sans">
                    Chúng tôi sẽ tiến hành kiểm tra, xác minh và xử lý ngay trong tối đa 24 giờ làm việc. Cảm ơn sự đóng góp quý giá của bạn!
                  </p>
                  
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-xs font-bold text-zinc-300 transition-all cursor-pointer uppercase tracking-wider"
                    >
                      Gửi tiếp báo cáo khác
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all cursor-pointer uppercase tracking-wider shadow-md shadow-rose-950/20"
                    >
                      Đóng cửa sổ
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Interactive forms */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-sans"
                    >
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}

                  {/* Input Email (Common field) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                      <Mail size={10} className="text-zinc-500" />
                      Email liên hệ của bạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="VD: emailcuaban@gmail.com"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs font-sans outline-none transition-all placeholder:text-zinc-600 select-text"
                      required
                    />
                    <p className="text-[9px] text-zinc-500 font-sans italic">Chúng tôi sẽ phản hồi lại tiến độ xử lý qua hòm thư này.</p>
                  </div>

                  {activeTab === 'bug' && (
                    /* FORM 1: BÁO LỖI HỆ THỐNG */
                    <div className="space-y-4">
                      {/* Tiêu đề lỗi */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                          Tiêu đề lỗi hệ thống <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bugTitle}
                          onChange={(e) => setBugTitle(e.target.value)}
                          placeholder="VD: Không thể nhấn nút play video trên iPhone, v.v."
                          className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs font-sans outline-none transition-all placeholder:text-zinc-600 select-text"
                          required
                        />
                      </div>

                      {/* Dropdowns Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                            Chức năng gặp lỗi
                          </label>
                          <select
                            value={bugFeature}
                            onChange={(e) => setBugFeature(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs outline-none transition-all cursor-pointer"
                          >
                            <option value="Xem Phim">Xem Phim (Video Player)</option>
                            <option value="Tìm Kiếm">Tìm Kiếm Phim</option>
                            <option value="Đăng Nhập / Đăng Ký">Đăng Nhập / Đăng Ký</option>
                            <option value="Tải App">Tải App (Download Screen)</option>
                            <option value="Lịch Sử Xem">Lịch Sử Xem &amp; Ưa Thích</option>
                            <option value="VIP / Thanh Toán">VIP / Nâng cấp Hội Viên</option>
                            <option value="Khác">Khác / Ý kiến đóng góp</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                            Thiết bị sử dụng
                          </label>
                          <select
                            value={bugDevice}
                            onChange={(e) => setBugDevice(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs outline-none transition-all cursor-pointer"
                          >
                            <option value="Máy tính / Laptop">Máy tính / Laptop (Web browser)</option>
                            <option value="Điện thoại iPhone">Điện thoại iPhone (iOS)</option>
                            <option value="Điện thoại Android">Điện thoại Android</option>
                            <option value="Máy tính bảng (Tablet)">Máy tính bảng (Tablet / iPad)</option>
                            <option value="Smart TV">Smart TV / TV Box</option>
                            <option value="Khác">Thiết bị khác</option>
                          </select>
                        </div>
                      </div>

                      {/* Chi tiết lỗi */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                          Mô tả chi tiết lỗi &amp; Các bước tái hiện <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={bugDesc}
                          onChange={(e) => setBugDesc(e.target.value)}
                          placeholder="Hãy mô tả chi tiết lỗi bạn gặp phải. Lỗi xảy ra thế nào? Bạn đã ấn nút gì? Có xuất hiện thông báo lỗi nào không? Để ban kỹ thuật nhanh chóng sửa lỗi cho bạn nhé..."
                          className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs font-sans outline-none transition-all placeholder:text-zinc-600 select-text resize-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'movie' && (
                    /* FORM 2: BÁO CÁO PHIM LỖI */
                    <div className="space-y-4">
                      {/* Tên phim & tập phim */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                            Tên phim gặp sự cố <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={movieName}
                            onChange={(e) => setMovieName(e.target.value)}
                            placeholder="VD: Thanh Gươm Diệt Quỷ, v.v."
                            className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs font-sans outline-none transition-all placeholder:text-zinc-600 select-text"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                            Tập số / Bản m3u8
                          </label>
                          <input
                            type="text"
                            value={movieEpisode}
                            onChange={(e) => setMovieEpisode(e.target.value)}
                            placeholder="VD: Tập 3, Full, v.v."
                            className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs font-sans outline-none transition-all placeholder:text-zinc-600 select-text"
                          />
                        </div>
                      </div>

                      {/* Loại lỗi phim */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                          Sự cố bạn gặp phải
                        </label>
                        <select
                          value={movieIssue}
                          onChange={(e) => setMovieIssue(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs outline-none transition-all cursor-pointer"
                        >
                          <option value="Link hỏng / Không xem được">Link hỏng / Không xem được (Error Loading Video)</option>
                          <option value="Phụ đề lỗi / Sai chính tả">Phụ đề (Subtitle) lỗi / Dịch sai / Lệch phụ đề</option>
                          <option value="Lệch âm thanh / Mất tiếng">Âm thanh mất tiếng / Lệch tiếng so với hình</option>
                          <option value="Chất lượng kém / Lag giật">Tải chậm / Lag giật / Chất lượng mờ kém</option>
                          <option value="Thông tin phim không chính xác">Sai thông tin phim / Nhầm tập phim</option>
                          <option value="Khác">Lỗi khác</option>
                        </select>
                      </div>

                      {/* Mô tả chi tiết */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                          Mô tả sự cố chi tiết <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={movieDesc}
                          onChange={(e) => setMovieDesc(e.target.value)}
                          placeholder="Hãy mô tả chi tiết lỗi để nhóm kỹ thuật kiểm tra nguồn stream CDN. VD: Phim bị đứng hình ở giây thứ 14, không tải được tập 2, phụ đề dịch sai ngữ nghĩa, v.v."
                          className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs font-sans outline-none transition-all placeholder:text-zinc-600 select-text resize-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'user' && (
                    /* FORM 3: BÁO CÁO NGƯỜI DÙNG VI PHẠM */
                    <div className="space-y-4">
                      {/* Đối tượng tố cáo & Vị trí vi phạm */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                            Tên người dùng / ID vi phạm <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={reportedUser}
                            onChange={(e) => setReportedUser(e.target.value)}
                            placeholder="VD: NguyenVanA, ID: 2901"
                            className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs font-sans outline-none transition-all placeholder:text-zinc-600 select-text"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                            Vị trí vi phạm xảy ra
                          </label>
                          <input
                            type="text"
                            value={violationLocation}
                            onChange={(e) => setViolationLocation(e.target.value)}
                            placeholder="VD: Bình luận tại phim Đảo Hải Tặc, v.v."
                            className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs font-sans outline-none transition-all placeholder:text-zinc-600 select-text"
                          />
                        </div>
                      </div>

                      {/* Loại vi phạm */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                          Hành vi vi phạm
                        </label>
                        <select
                          value={userViolation}
                          onChange={(e) => setUserViolation(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs outline-none transition-all cursor-pointer"
                        >
                          <option value="Bình luận thô tục / xúc phạm">Bình luận thô tục, vô văn hóa, xúc phạm danh dự</option>
                          <option value="Quảng cáo / Spam">Spam link quảng cáo, cờ bạc, lừa đảo</option>
                          <option value="Tên tài khoản không phù hợp">Đặt tên hiển thị (avatar) phản cảm, vi phạm pháp luật</option>
                          <option value="Tiết lộ nội dung phim (Spoiler)">Tiết lộ nội dung phim (Spoiler) cố ý phá hỏng trải nghiệm người khác</option>
                          <option value="Khác">Hành vi vi phạm khác</option>
                        </select>
                      </div>

                      {/* Mô tả chi tiết */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                          Mô tả chi tiết nội dung vi phạm <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={userDesc}
                          onChange={(e) => setUserDesc(e.target.value)}
                          placeholder="Hãy mô tả chi tiết từ từ ngữ vi phạm, hành vi bôi nhọ hoặc spam phá hoại để Đội ngũ Quản trị viên lập tức kiểm tra nhật ký (log) hệ thống và tiến hành xử phạt, khóa tài khoản vi phạm..."
                          className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-[#E63946]/50 focus:ring-1 focus:ring-[#E63946]/30 text-white text-xs font-sans outline-none transition-all placeholder:text-zinc-600 select-text resize-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Attachment uploads (Images up to 5, Video <= 250MB) */}
                  <div className="space-y-3 pt-3 border-t border-zinc-900/40">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <Paperclip size={10} className="text-[#E63946]" />
                      Đính kèm hình ảnh &amp; video minh họa
                    </label>

                    {attachmentError && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-sans">
                        ⚠️ {attachmentError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Image Upload Area */}
                      <div
                        onDragOver={handleImageDragOver}
                        onDragLeave={handleImageDragLeave}
                        onDrop={handleImageDrop}
                        className={`relative rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] ${
                          isDragOverImage
                            ? 'border-[#E63946] bg-[#E63946]/5'
                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30'
                        }`}
                        onClick={() => document.getElementById('image-upload-input')?.click()}
                      >
                        <input
                          id="image-upload-input"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Image size={24} className="text-zinc-550 mb-1.5" />
                        <span className="text-xs font-black text-zinc-300">Tải lên hình ảnh ({images.length}/5)</span>
                        <span className="text-[9px] text-zinc-500 mt-0.5 leading-tight text-center">Hỗ trợ tất cả định dạng ảnh<br/>Kéo &amp; thả hoặc nhấp để chọn</span>
                      </div>

                      {/* Video Upload Area */}
                      <div
                        onDragOver={handleVideoDragOver}
                        onDragLeave={handleVideoDragLeave}
                        onDrop={handleVideoDrop}
                        className={`relative rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] ${
                          video ? 'border-zinc-800 bg-zinc-900/10' :
                          isDragOverVideo
                            ? 'border-emerald-500 bg-emerald-500/5'
                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30'
                        }`}
                        onClick={() => !video && document.getElementById('video-upload-input')?.click()}
                      >
                        <input
                          id="video-upload-input"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                          disabled={!!video}
                        />
                        <Video size={24} className={video ? "text-emerald-500 mb-1.5 animate-pulse" : "text-zinc-550 mb-1.5"} />
                        <span className="text-xs font-black text-zinc-300">Tải lên video {video ? '(1/1)' : '(0/1)'}</span>
                        <span className="text-[9px] text-zinc-500 mt-0.5 leading-tight text-center">Dung lượng tối đa 250MB<br/>Kéo &amp; thả hoặc nhấp để chọn</span>
                      </div>
                    </div>

                    {/* Previews of uploaded images */}
                    {images.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Ảnh đã chọn:</span>
                        <div className="grid grid-cols-5 gap-2">
                          {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
                              <img
                                src={img.preview}
                                alt={img.name}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setImages(images.filter((_, i) => i !== idx)); }}
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-[#E63946] text-white transition-colors cursor-pointer"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details of uploaded video */}
                    {video && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Video đã chọn:</span>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                              <Video size={14} />
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-xs font-bold text-zinc-200 truncate">{video.name}</p>
                              <p className="text-[10px] text-zinc-500 font-mono font-bold mt-0.5">
                                {(video.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setVideo(null); }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                            title="Xóa video"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SMTP Custom Config - Advanced */}
                  <div className="pt-3 border-t border-zinc-900/40 space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/20 border border-zinc-850 hover:bg-zinc-900/40 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="text-xs font-black text-zinc-300 group-hover:text-zinc-100 transition-colors uppercase tracking-wider">Cấu hình gửi mail SMTP (Nâng cao)</span>
                      </div>
                      <span className="text-zinc-500 text-xs font-mono font-bold">
                        {showSmtpConfig ? 'Ẩn [-]' : 'Hiện [+]'}
                      </span>
                    </button>

                    {showSmtpConfig && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-3"
                      >
                        {/* SMTP Mode Tabs */}
                        <div className="flex gap-2 border-b border-zinc-900 pb-2.5">
                          <button
                            type="button"
                            onClick={() => setSmtpMode('gmail')}
                            className={`flex-1 text-center py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                              smtpMode === 'gmail'
                                ? 'bg-zinc-900 text-[#E63946] border border-zinc-800/80 shadow-md shadow-black/40'
                                : 'text-zinc-550 hover:text-zinc-350'
                            }`}
                          >
                            Gmail (Cực đơn giản)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSmtpMode('custom')}
                            className={`flex-1 text-center py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                              smtpMode === 'custom'
                                ? 'bg-zinc-900 text-[#E63946] border border-zinc-800/80 shadow-md shadow-black/40'
                                : 'text-zinc-550 hover:text-zinc-350'
                            }`}
                          >
                            SMTP Khác (Nâng cao)
                          </button>
                        </div>

                        {smtpMode === 'gmail' ? (
                          <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-850/60 text-[11px] text-zinc-400 font-sans leading-relaxed">
                              💡 <strong className="text-zinc-200">Bí quyết đơn giản nhất:</strong> Để nhận email thật, bạn chỉ cần nhập địa chỉ Gmail của bạn và <strong>Mật khẩu ứng dụng (App Password)</strong>. Hệ thống sẽ tự động liên kết máy chủ Gmail bảo mật tối ưu phía sau!
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Gmail Username */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Địa chỉ Gmail của bạn</label>
                                <input
                                  type="email"
                                  value={smtpUser}
                                  onChange={(e) => {
                                    setSmtpUser(e.target.value);
                                    setSmtpFromEmail(e.target.value); // Auto sync from email to avoid errors
                                  }}
                                  placeholder="e.g. lehuybao17112007@gmail.com"
                                  className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] font-mono"
                                />
                              </div>

                              {/* Gmail App Pass */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Mật khẩu ứng dụng Gmail</label>
                                <input
                                  type="password"
                                  value={smtpPass}
                                  onChange={(e) => setSmtpPass(e.target.value)}
                                  placeholder="Nhập 16 ký tự (App Password)"
                                  className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] font-mono"
                                />
                              </div>
                            </div>

                            {/* To Email */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Hòm thư nhận báo cáo (To Email)</label>
                              <input
                                type="email"
                                value={smtpToEmail}
                                onChange={(e) => setSmtpToEmail(e.target.value)}
                                placeholder="lehuybao17112007@gmail.com"
                                className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] font-mono"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-850/60 text-[11px] text-zinc-400 font-sans leading-relaxed">
                              📌 <strong className="text-zinc-200">Lưu ý:</strong> Cấu hình nâng cao dành cho các dịch vụ gửi thư như Brevo SMTP, SendGrid hoặc máy chủ SMTP riêng của bạn.
                            </div>

                            {/* Presets */}
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Mẫu nhanh:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSmtpHost('smtp.gmail.com');
                                  setSmtpPort('587');
                                  setSmtpFromEmail('your-email@gmail.com');
                                  setSmtpToEmail('lehuybao17112007@gmail.com');
                                }}
                                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 font-bold cursor-pointer transition-colors"
                              >
                                Google Gmail
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSmtpHost('smtp-relay.brevo.com');
                                  setSmtpPort('587');
                                  setSmtpFromEmail('your-brevo@email.com');
                                  setSmtpToEmail('lehuybao17112007@gmail.com');
                                }}
                                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 font-bold cursor-pointer transition-colors"
                              >
                                Brevo SMTP
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Host */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">SMTP Host</label>
                                <input
                                  type="text"
                                  value={smtpHost}
                                  onChange={(e) => setSmtpHost(e.target.value)}
                                  placeholder="e.g. smtp.gmail.com"
                                  className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] font-mono"
                                />
                              </div>

                              {/* Port */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">SMTP Port</label>
                                <input
                                  type="text"
                                  value={smtpPort}
                                  onChange={(e) => setSmtpPort(e.target.value)}
                                  placeholder="587 hoặc 465"
                                  className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] font-mono"
                                />
                              </div>

                              {/* User */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Tài khoản SMTP (Username)</label>
                                <input
                                  type="text"
                                  value={smtpUser}
                                  onChange={(e) => setSmtpUser(e.target.value)}
                                  placeholder="e.g. email_cua_ban@gmail.com"
                                  className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] font-mono"
                                />
                              </div>

                              {/* Pass */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Mật khẩu SMTP (Password / App Pass)</label>
                                <input
                                  type="password"
                                  value={smtpPass}
                                  onChange={(e) => setSmtpPass(e.target.value)}
                                  placeholder="Mật khẩu ứng dụng 16 ký tự"
                                  className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] font-mono"
                                />
                              </div>

                              {/* From */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Email Gửi Đi (From Email)</label>
                                <input
                                  type="text"
                                  value={smtpFromEmail}
                                  onChange={(e) => setSmtpFromEmail(e.target.value)}
                                  placeholder="e.g. email_cua_ban@gmail.com"
                                  className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] font-mono"
                                />
                              </div>

                              {/* To */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Hòm thư nhận báo cáo (To Email)</label>
                                <input
                                  type="text"
                                  value={smtpToEmail}
                                  onChange={(e) => setSmtpToEmail(e.target.value)}
                                  placeholder="Địa chỉ email muốn nhận thư báo cáo"
                                  className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSmtpHost('smtp.gmail.com');
                              setSmtpPort('587');
                              setSmtpUser('');
                              setSmtpPass('');
                              setSmtpFromEmail('');
                              setSmtpToEmail('lehuybao17112007@gmail.com');
                              localStorage.removeItem('ff_smtp_host');
                              localStorage.removeItem('ff_smtp_port');
                              localStorage.removeItem('ff_smtp_user');
                              localStorage.removeItem('ff_smtp_pass');
                              localStorage.removeItem('ff_smtp_from');
                              localStorage.removeItem('ff_smtp_to');
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 hover:text-white hover:border-zinc-700 font-bold transition-colors cursor-pointer uppercase tracking-wider animate-pulse-subtle"
                          >
                            Xóa trắng cấu hình
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Submission Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-900/60 shrink-0">
                    <span className="text-[9px] text-zinc-550 font-sans italic flex items-center gap-1">
                      <Sparkles size={9} className="text-rose-600" />
                      Thông tin được bảo mật mã hóa hoàn toàn.
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-[#E63946] hover:bg-rose-500 disabled:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-950/20 disabled:text-zinc-550"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          Gửi báo cáo
                          <Send size={11} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
