const EmptyState = ({ message, title = "Nothing here yet" }) => (
  <div className="border-2 border-dashed border-ink bg-parchment p-6">
    <p className="font-display text-3xl font-bold">{title}</p>
    <p className="mt-2 text-ink/70">{message}</p>
  </div>
);

export default EmptyState;
