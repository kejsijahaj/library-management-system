const colors = {
  active: "bg-chartreuse text-ink",
  archived: "bg-ink text-paper",
  cancelled: "bg-cinnabar text-paper",
  fulfilled: "bg-mineral text-paper",
  inactive: "bg-cinnabar text-paper",
  overdue: "bg-cinnabar text-paper",
  pending: "bg-brass text-ink",
  ready: "bg-blueprint text-paper",
  returned: "bg-mineral text-paper"
};

const StatusPill = ({ status }) => (
  <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase tracking-[0.16em] ${colors[status] || "bg-parchment text-ink"}`}>
    {status}
  </span>
);

export default StatusPill;
