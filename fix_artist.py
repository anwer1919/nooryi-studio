# -*- coding: utf-8 -*-
import os

# ═══ 1) فورم التعديل: إضافة ACTIVE + basePrice ═══
p = os.path.join("src", "app", "admin", "artists", "[slug]", "edit", "page.tsx")
s = open(p, encoding="utf-8").read()

# إضافة state للسعر الأساسي
s = s.replace('const [uploadingImage, setUploadingImage] = useState(false)',
              'const [uploadingImage, setUploadingImage] = useState(false)\n  const [basePrice, setBasePrice] = useState(0)', 1)

# قراءة السعر الأساسي من البيانات
s = s.replace('setAccentColor(result.data.accentColor || "#EAB308")',
              'setAccentColor(result.data.accentColor || "#EAB308")\n        setBasePrice(result.data.basePrice || 0)', 1)

# إضافة ACTIVE للخيارات
s = s.replace('<option value="PENDING">قيد المراجعة</option>',
              '<option value="ACTIVE">نشط (يظهر في الرئيسية)</option>\n                <option value="PENDING">قيد المراجعة</option>', 1)

# إرسال basePrice في الحفظ
s = s.replace('profileImage, coverImage, accentColor, status,',
              'profileImage, coverImage, accentColor, status, basePrice,', 1)

# إضافة حقل السعر في الفورم (بعد اللون المميز)
price_field = '''
          {/* السعر الأساسي */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              السعر الأساسي (ج.م)
            </label>
            <input
              type="number"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
              placeholder="1000"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-muted mt-1">السعر يظهر في الصفحة الرئيسية وبطاقات الفنانين</p>
          </div>
'''
s = s.replace('          {/* اللون والحالة */}',
              price_field + '\n          {/* اللون والحالة */}', 1)

open(p, "w", encoding="utf-8").write(s)
print("✅ فورم التعديل: إضافة ACTIVE + basePrice")

# ═══ 2) API التحديث: حفظ basePrice ═══
p = os.path.join("src", "app", "api", "admin", "artists", "[slug]", "route.ts")
s = open(p, encoding="utf-8").read()

s = s.replace('status: body.status,',
              'status: body.status,\n        basePrice: body.basePrice || 0,', 1)

open(p, "w", encoding="utf-8").write(s)
print("✅ API التحديث: حفظ basePrice")

print("\n✅ ALL DONE")