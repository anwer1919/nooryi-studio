<div className="cards-grid">
  {bookings.map((booking) => (
    <div key={booking.id} className="dash-card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="card-title">{booking.artist?.name || "فنان محذوف"}</h3>
          <p className="card-subtitle">{booking.clientName}</p>
        </div>
        <span className={`status-badge ${
          booking.status === "CONFIRMED" ? "confirmed" :
          booking.status === "CANCELLED" ? "cancelled" : "pending"
        }`}>
          {booking.status === "CONFIRMED" ? "مؤكد" :
           booking.status === "CANCELLED" ? "ملغى" : "قيد الانتظار"}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 card-body">
          <Calendar size={14} className="text-[#F5A623] flex-shrink-0" />
          <span>{new Date(booking.date).toLocaleDateString("ar-EG")}</span>
        </div>
        <div className="flex items-center gap-2 card-body">
          <MapPin size={14} className="text-[#F5A623] flex-shrink-0" />
          <span className="line-clamp-1">{booking.location || "غير محدد"}</span>
        </div>
        <div className="flex items-center gap-2 card-body">
          <CreditCard size={14} className="text-[#F5A623] flex-shrink-0" />
          <span>{booking.amount?.toLocaleString() || 0} ج.م</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[rgba(245,166,35,0.1)]">
        <span className="text-xs text-[var(--color-fog-veil)]">
          {new Date(booking.createdAt).toLocaleDateString("ar-EG")}
        </span>
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="text-xs font-semibold text-[#F5A623] hover:text-white transition"
        >
          التفاصيل ←
        </Link>
      </div>
    </div>
  ))}
</div>
