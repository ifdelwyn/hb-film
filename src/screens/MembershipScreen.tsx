import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Sparkles, AlertCircle, CreditCard, Wallet, Smartphone, RefreshCw, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MembershipScreenProps {
  onNavigate: (route: string) => void;
}

export default function MembershipScreen({ onNavigate }: MembershipScreenProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | 'vnpay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync user state from localStorage
  const loadUser = () => {
    try {
      const stored = localStorage.getItem('hb_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUser();
    // Sync on update event
    window.addEventListener('hb_user_updated', loadUser);
    return () => {
      window.removeEventListener('hb_user_updated', loadUser);
    };
  }, []);

  const handleOpenUpgrade = (planId: string, planName: string, price: string) => {
    if (!currentUser) {
      // Redirect to login
      onNavigate('auth');
      return;
    }
    setSelectedPlan({ id: planId, name: planName, price: price });
    setShowModal(true);
    setIsSuccess(false);
    setIsProcessing(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !currentUser) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Update plan in local storage user payload
      const updatedUser = { ...currentUser, plan: selectedPlan.id };
      localStorage.setItem('hb_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      // Sync plan change into ProfileScreen custom states
      localStorage.setItem('vip_tier_key', selectedPlan.id);
      
      // Broadcast events to update Header/Profile
      window.dispatchEvent(new Event('hb_user_updated'));
      window.dispatchEvent(new Event('vip_tier_updated'));
    }, 2000);
  };

  const plans = [
    {
      id: 'free',
      name: 'Thành viên FREE',
      price: '0đ',
      period: 'trọn đời',
      desc: 'Phù hợp để trải nghiệm không gian chiếu phim cơ bản nhất.',
      color: 'border-zinc-900 bg-zinc-950/60',
      badge: 'Gói Cơ Bản',
      features: [
        'Xem phim chất lượng tiêu chuẩn SD (480p)',
        'Có chứa quảng cáo ngắn khi phát',
        'Xem đồng thời trên tối đa 1 thiết bị',
        'Không thể tải xuống nội dung ngoại tuyến'
      ]
    },
    {
      id: 'basic',
      name: 'Gói BASIC VIP',
      price: '120.000đ',
      period: 'mỗi tháng',
      desc: 'Phổ biến nhất cho cá nhân muốn giải trí chất lượng HD sắc nét.',
      color: 'border-blue-900/40 bg-[#13131A] relative shadow-blue-950/10 shadow-lg',
      badge: 'Được Khuyên Dùng',
      features: [
        'Xem phim chất lượng cao HD (1080p)',
        'Hoàn toàn KHÔNG chứa quảng cáo',
        'Xem đồng thời trên 2 thiết bị cùng lúc',
        'Kho phim VIP đặc sắc cập nhật liên tục'
      ]
    },
    {
      id: 'premium',
      name: 'Rạp PREMIUM 4K',
      price: '220.000đ',
      period: 'mỗi tháng',
      desc: 'Trải nghiệm đỉnh cao công nghệ rạp phim gia đình hoành tráng.',
      color: 'border-[var(--color-brand)]/50 bg-[#13131A] relative shadow-[var(--color-brand)]/5 shadow-xl',
      badge: 'Trải Nghiệm Đỉnh Cao',
      isPopular: true,
      features: [
        'Độ phân giải 4K Ultra HD đỉnh cao + HDR',
        'Âm thanh vòm lập thể Dolby Atmos sống động',
        'Xem đồng thời cùng lúc 4 thiết bị rạp phim',
        'Không quảng cáo + Hỗ trợ tải phim ngoại tuyến'
      ]
    }
  ];

  const currentPlanId = currentUser?.plan || 'free';

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pt-24 sm:pt-28 pb-16 font-sans px-4 sm:px-6 md:px-8 max-w-6xl mx-auto relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-[-5%] left-[-10%] w-[35%] h-[35%] bg-[var(--color-brand)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-10%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Page header */}
      <div className="text-center max-w-2xl mx-auto mb-12 select-none z-10 relative">
        <span className="px-3.5 py-1.5 rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)] text-[10px] font-black uppercase tracking-widest border border-[var(--color-brand)]/15">
          Gói Thành Viên bao
        </span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mt-4">
          Nâng Cấp Trải Nghiệm Điện Ảnh
        </h1>
        <p className="text-sm text-zinc-400 mt-3 leading-relaxed font-semibold">
          Chọn gói dịch vụ lý tưởng dành riêng cho bạn để đắm chìm vào không gian phim không quảng cáo, độ phân giải sắc nét 4K mượt mà.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {plans.map((p) => {
          const isActive = currentPlanId === p.id;
          const isHigher = (p.id === 'premium' && currentPlanId !== 'premium') || (p.id === 'basic' && currentPlanId === 'free');

          return (
            <div
              key={p.id}
              className={`p-6 sm:p-8 rounded-[24px] border flex flex-col transition-all duration-300 hover:-translate-y-1.5 ${p.color} ${
                isActive ? 'ring-2 ring-[var(--color-brand)] bg-zinc-900/25' : ''
              }`}
            >
              {p.isPopular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-[var(--color-brand)] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                  Gói Cao Cấp
                </div>
              )}

              <div className="mb-6 select-none text-left">
                <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  {p.badge}
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">{p.name}</h3>
                <p className="text-xs text-zinc-400 mt-2 min-h-[32px] font-semibold leading-relaxed">
                  {p.desc}
                </p>
                <div className="flex items-baseline gap-1 mt-5">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {p.price}
                  </span>
                  <span className="text-zinc-500 text-xs font-semibold">/ {p.period}</span>
                </div>
              </div>

              {/* Feature list */}
              <div className="flex-1 border-t border-zinc-900/60 pt-5 text-left mb-8">
                <ul className="flex flex-col gap-3.5">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs">
                      <div className="w-4 h-4 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center text-[var(--color-brand)] shrink-0 mt-0.5">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <span className="text-zinc-300 leading-relaxed font-semibold">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Plan Action Trigger Button */}
              {isActive ? (
                <div className="w-full h-11 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 select-none">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Gói Của Bạn Hiện Tại</span>
                </div>
              ) : isHigher ? (
                <button
                  onClick={() => handleOpenUpgrade(p.id, p.name, p.price)}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[#C1121F] text-white hover:opacity-95 font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer active:scale-[0.98]"
                >
                  Nâng Cấp Ngay
                </button>
              ) : (
                <div className="w-full h-11 rounded-xl bg-zinc-900/30 border border-zinc-900/60 text-zinc-500 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center select-none">
                  Không khả dụng
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Modal Portal Simulator */}
      <AnimatePresence>
        {showModal && selectedPlan && currentUser && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isProcessing) setShowModal(false); }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#13131A] border border-zinc-900 text-white rounded-[24px] overflow-hidden shadow-2xl flex flex-col p-6 sm:p-8 font-sans text-left"
            >
              {isSuccess ? (
                /* Success feedback state */
                <div className="flex flex-col items-center justify-center py-8 text-center select-none">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 animate-bounce">
                    <Star size={28} fill="currentColor" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    🎉 Nâng cấp thành công!
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mt-3 leading-relaxed font-semibold">
                    Xin chúc mừng! Tài khoản của bạn đã được nâng cấp lên hạng thành viên cao cấp{' '}
                    <span className="text-[var(--color-brand)] font-bold">{selectedPlan.name}</span>.{' '}
                    Tận hưởng kho phim điện ảnh không giới hạn chất lượng đỉnh cao ngay bây giờ!
                  </p>
                  
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-7 px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[#C1121F] text-xs font-black uppercase tracking-wider text-white shadow-md cursor-pointer hover:opacity-95"
                  >
                    Bắt đầu xem phim
                  </button>
                </div>
              ) : (
                /* Checkout Form State */
                <>
                  <div className="mb-5 select-none pb-4 border-b border-zinc-900/60">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/15 text-[var(--color-brand)] font-black uppercase tracking-widest">
                      Xác nhận thanh toán
                    </span>
                    <h3 className="text-lg font-black text-white mt-2">
                      Nâng cấp lên {selectedPlan.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Tổng thanh toán: <span className="text-white font-bold">{selectedPlan.price}</span> / tháng
                    </p>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-5">
                    {/* Payment methods list selection */}
                    <div className="flex flex-col gap-2 select-none">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                        Phương thức thanh toán
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {/* Visa Mastercard channel */}
                        <div
                          onClick={() => { if (!isProcessing) setPaymentMethod('card'); }}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                            paymentMethod === 'card'
                              ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 text-white'
                              : 'border-zinc-900 bg-zinc-950/60 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          <CreditCard size={18} className="mb-1.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Thẻ tín dụng</span>
                        </div>

                        {/* MoMo channel */}
                        <div
                          onClick={() => { if (!isProcessing) setPaymentMethod('momo'); }}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                            paymentMethod === 'momo'
                              ? 'border-fuchsia-600 bg-fuchsia-950/10 text-white'
                              : 'border-zinc-900 bg-zinc-950/60 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          <Wallet size={18} className="mb-1.5 text-fuchsia-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Ví MoMo</span>
                        </div>

                        {/* VNPay channel */}
                        <div
                          onClick={() => { if (!isProcessing) setPaymentMethod('vnpay'); }}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                            paymentMethod === 'vnpay'
                              ? 'border-blue-500 bg-blue-950/10 text-white'
                              : 'border-zinc-900 bg-zinc-950/60 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          <Smartphone size={18} className="mb-1.5 text-blue-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">VNPay QR</span>
                        </div>
                      </div>
                    </div>

                    {/* Conditional input fields according to method */}
                    {paymentMethod === 'card' && (
                      <div className="flex flex-col gap-3 p-4 rounded-xl bg-zinc-950/50 border border-zinc-900/80">
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[9px] font-bold uppercase text-zinc-500">Số thẻ tín dụng</label>
                          <input
                            type="text"
                            placeholder="4111 2222 3333 4444"
                            maxLength={19}
                            className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-[var(--color-brand)] rounded-lg px-3.5 text-xs font-semibold outline-none text-white placeholder-zinc-600 transition-colors"
                            required
                            disabled={isProcessing}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-left">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase text-zinc-500">Hạn sử dụng</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-[var(--color-brand)] rounded-lg px-3.5 text-xs font-semibold outline-none text-white placeholder-zinc-600 transition-colors"
                              required
                              disabled={isProcessing}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase text-zinc-500">Mã CVV</label>
                            <input
                              type="password"
                              placeholder="•••"
                              maxLength={3}
                              className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-[var(--color-brand)] rounded-lg px-3.5 text-xs font-semibold outline-none text-white placeholder-zinc-600 transition-colors"
                              required
                              disabled={isProcessing}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {(paymentMethod === 'momo' || paymentMethod === 'vnpay') && (
                      <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-900/80 text-center flex flex-col items-center justify-center gap-2 select-none">
                        <div className="p-3 bg-white rounded-xl mb-1 border border-zinc-100">
                          {/* Simulated Scan QR vector code */}
                          <div className="w-24 h-24 bg-zinc-950 flex flex-wrap p-1.5 rounded-lg border">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-6 h-6 border-[2px] border-zinc-950 ${
                                  (i + 3) % 4 === 0 || i % 3 === 0 ? 'bg-white' : 'bg-black'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                          Hệ thống đã mã hóa yêu cầu thanh toán. <br />
                          Vui lòng bấm <span className="text-white font-bold">Xác nhận</span> để mô phỏng quét mã nạp tiền hoàn tất giao dịch tự động!
                        </p>
                      </div>
                    )}

                    {/* Notice */}
                    <div className="flex gap-2 text-zinc-500 bg-amber-500/5 p-3 rounded-xl border border-amber-500/5 select-none">
                      <AlertCircle size={14} className="text-amber-500/80 shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-relaxed font-semibold">
                        Đây hoàn toàn là màn hình giao dịch giả lập bảo mật. Bạn sẽ không bị tính bất kỳ chi phí thực tế nào khi nâng cấp.
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 mt-2 select-none">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        disabled={isProcessing}
                        className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-800 transition-all text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
                      >
                        Quay Lại
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1 h-11 bg-gradient-to-r from-[var(--color-brand)] to-[#C1121F] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>ĐANG XỬ LÝ...</span>
                          </>
                        ) : (
                          <span>XÁC NHẬN THANH TOÁN</span>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
