import {
  Building2, Phone, Smartphone, FileText,
  CreditCard, Copy, CheckCircle2
} from "lucide-react"

interface ArtistPaymentDisplayProps {
  artist: {
    name: string
    bankName?: string | null
    bankAccount?: string | null
    iban?: string | null
    vodafoneCash?: string | null
    instaPay?: string | null
    paymentNote?: string | null
  }
  amount: number
}

export default function ArtistPaymentDisplay({ artist, amount }: ArtistPaymentDisplayProps) {
  const hasPaymentInfo = artist.bankName || artist.vodafoneCash || artist.instaPay

  if (!hasPaymentInfo) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 text-center">
        <FileText size={40} className="mx-auto text-yellow-500 mb-3" />
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
          بيانات الدفع غير متوفرة
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          يرجى التواصل معنا لإتمام عملية الدفع
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#b8941f]/10 border border-[#D4AF37]/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard size={20} className="text-[#D4AF37]" />
            بيانات الدفع — {artist.name}
          </h3>
          <span className="text-2xl font-black text-[#D4AF37]">
            {amount.toLocaleString()} ج.م
          </span>
        </div>

        <div className="space-y-4">
          {/* التحويل البنكي */}
          {artist.bankName && (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                تحويل بنكي
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">البنك:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{artist.bankName}</span>
                </div>
                {artist.bankAccount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">رقم الحساب:</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono" dir="ltr">
                      {artist.bankAccount}
                    </span>
                  </div>
                )}
                {artist.iban && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">IBAN:</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono text-xs" dir="ltr">
                      {artist.iban}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* فودافون كاش */}
          {artist.vodafoneCash && (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Phone size={16} className="text-red-500" />
                فودافون كاش
              </h4>
              <p className="text-xl font-black text-gray-900 dark:text-white font-mono text-center py-2" dir="ltr">
                {artist.vodafoneCash}
              </p>
            </div>
          )}

          {/* إنستا باي */}
          {artist.instaPay && (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Smartphone size={16} className="text-purple-500" />
                إنستا باي
              </h4>
              <p className="text-lg font-bold text-gray-900 dark:text-white font-mono text-center py-2" dir="ltr">
                {artist.instaPay}
              </p>
            </div>
          )}

          {/* ملاحظات */}
          {artist.paymentNote && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                💡 {artist.paymentNote}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          ⚠️ بعد إتمام الدفع، سيتم مراجعة طلبك وتأكيده خلال 24 ساعة
        </p>
      </div>
    </div>
  )
}