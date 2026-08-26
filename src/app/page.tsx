{/* Features Section */}
<section className="py-24">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="text-center mb-16 space-y-4">
      <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2">
        <Sparkles className="text-yellow-400" size={14} />
        <span className="text-xs font-semibold text-white/80">لماذا Nooryi؟</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-black">
        تجربة حجز <span className="gradient-text">لا مثيل لها</span>
      </h2>
      <p className="text-lg text-white/60 max-w-2xl mx-auto">
        صممنا كل تفصيلة في المنصة لتضمن لك أفضل تجربة ممكنة
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {/* Card 1 - Yellow */}
      <div className="group relative glass rounded-3xl p-8 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Music className="text-yellow-400" size={28} />
        </div>
        <h3 className="text-xl font-bold mb-3">مواهب مُعتمدة</h3>
        <p className="text-white/60 leading-relaxed">نختار فنانيك بعناية فائقة، مع ملفات تعريفية شاملة وتقييمات حقيقية.</p>
      </div>

      {/* Card 2 - Green */}
      <div className="group relative glass rounded-3xl p-8 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Shield className="text-green-400" size={28} />
        </div>
        <h3 className="text-xl font-bold mb-3">حجز آمن ومضمون</h3>
        <p className="text-white/60 leading-relaxed">نظام دفع محمي يضمن حقك وحق الفنان، مع تتبع حالة الحجز.</p>
      </div>

      {/* Card 3 - Blue */}
      <div className="group relative glass rounded-3xl p-8 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Calendar className="text-blue-400" size={28} />
        </div>
        <h3 className="text-xl font-bold mb-3">شفافية كاملة</h3>
        <p className="text-white/60 leading-relaxed">لا رسوم مخفية. اعرف التكلفة الإجمالية قبل تأكيد الحجز.</p>
      </div>
    </div>
  </div>
</section>