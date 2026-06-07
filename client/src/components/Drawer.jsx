import { X } from "lucide-react";
import ActionButton from "./ActionButton.jsx";

const Drawer = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-ink/60 px-4 py-6 backdrop-blur-sm md:px-8">
      <div className="ml-auto flex h-full max-w-xl flex-col border-2 border-ink bg-paper shadow-hard">
        <div className="flex items-center justify-between border-b-2 border-ink bg-parchment px-5 py-4">
          <h3 className="font-display text-3xl font-bold">{title}</h3>
          <ActionButton aria-label="Close drawer" onClick={onClose} variant="ghost">
            <X size={18} />
          </ActionButton>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
