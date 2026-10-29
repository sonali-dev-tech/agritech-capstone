export const Loader = () => (
  <div className="text-center py-5"><div className="spinner-border text-success" role="status" /></div>
);
export const ErrorAlert = ({ message, onClose }) =>
  message ? (
    <div className="alert alert-danger alert-dismissible">
      {message}
      {onClose && <button type="button" className="btn-close" onClick={onClose} />}
    </div>
  ) : null;
export const StatCard = ({ label, value, color = 'success' }) => (
  <div className="col-6 col-md-3">
    <div className={`card stat-card border-start border-4 border-${color} h-100`}>
      <div className="card-body"><div className="text-muted small">{label}</div><h2 className="mb-0">{value}</h2></div>
    </div>
  </div>
);
export const statusColor = (s) =>
  ({ Placed: 'secondary', Confirmed: 'info', Shipped: 'primary', Delivered: 'success', Cancelled: 'danger' }[s] || 'secondary');
