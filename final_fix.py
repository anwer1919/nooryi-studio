# -*- coding: utf-8 -*-
import os, re

# ═══ 1) الصفحة الرئيسية: حذف الهيدر المكرر (الذي يخفي القائمة والاسم) ═══
p = os.path.join("src", "app", "page.tsx")
s = open(p, encoding="utf-8").read()
before = len(s)
s = re.sub(r"\{/\*\s*═+\s*Header\s*═+\s*\*/\}.*?</header>", "", s, count=1, flags=re.S)
if len(s) != before:
    open(p, "w", encoding="utf-8").write(s)
    print("homepage duplicate header REMOVED")
else:
    # محاولة ثانية بصيغة أبسط
    s2 = re.sub(r"<header className=\"fixed top-0.*?</header>", "", s, count=1, flags=re.S)
    if len(s2) != len(s):
        open(p, "w", encoding="utf-8").write(s2)
        print("homepage duplicate header REMOVED (alt pattern)")
    else:
        print("WARN: header not found in homepage")

# ═══ 2) LoginFormClient: توجيه صحيح بجلسة طازجة (بدون cache) ═══
p = os.path.join("src", "app", "login", "LoginFormClient.tsx")
s = open(p, encoding="utf-8").read()
pat = re.compile(r"setStep\(\"success\"\).*?setTimeout\(\(\) => \{ window\.location\.href = [^}]*\}, 1500\)", re.S)
new = '''setStep("success")
      router.refresh()
      let role = "USER"
      try {
        const sr = await fetch("/api/auth/session")
        const sj = await sr.json()
        role = sj?.user?.role || "USER"
      } catch {}
      const home = (role === "SUPER_ADMIN" || role === "ADMIN" || role === "ARTIST_MANAGER") ? "/admin" : "/"
      setTimeout(() => { window.location.href = callbackUrl || home }, 1500)'''
s2, n = pat.subn(new, s, count=1)
if n:
    open(p, "w", encoding="utf-8").write(s2)
    print("login redirect FIXED (fresh session fetch)")
else:
    print("WARN: redirect pattern not found")

print("ALL DONE")