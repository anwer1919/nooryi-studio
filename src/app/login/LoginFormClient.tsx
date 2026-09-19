  const handleVerified = async () => {
    try {
      // إنشاء جلسة NextAuth باستخدام البريد وكلمة المرور المحفوظة
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok && !result?.error) {
        // نجاح → توجيه حسب الدور
        const sr = await fetch("/api/auth/session");
        const sj = await sr.json();
        const role = sj?.user?.role || "USER";
        const home = ["SUPER_ADMIN", "ADMIN", "ARTIST_MANAGER"].includes(role)
          ? "/admin"
          : "/";
        window.location.href = callbackUrl || home;
      } else {
        // Fallback: إعادة تحميل الصفحة (الجلسة قد تكون موجودة أصلاً)
        window.location.href = callbackUrl || "/admin";
      }
    } catch {
      window.location.href = callbackUrl || "/admin";
    }
  };
