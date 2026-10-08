import Icon from "./Icon";

const NAV = [
  { key: "all", label: "All Tasks", icon: "checklist" },
  { key: "pending", label: "Pending", icon: "schedule" },
  { key: "completed", label: "Completed", icon: "task_alt" },
];

export default function Sidebar({ user, filter, onFilterChange, onLogout, open, onClose }) {
  return (
    <>
      {/* Dark overlay behind the sidebar on phones */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between
        shadow-[0_1px_8px_rgba(0,0,0,0.06)] transition-transform md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          <div className="h-16 flex items-center px-6 gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
              <Icon name="checklist" className="text-[20px]" />
            </div>
            <span className="font-display font-semibold text-lg">TaskFlow</span>
          </div>

          <nav className="px-4 py-2 flex flex-col gap-1">
            {NAV.map((item) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onFilterChange(item.key);
                    onClose();
                  }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors
                  ${active
                    ? "bg-secondary-container text-on-secondary-fixed"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"}`}
                >
                  <Icon name={item.icon} className="text-[20px]" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logged-in user at the bottom */}
        <div className="m-2 p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 text-sm font-semibold">
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{user.name}</p>
              <p className="text-xs text-on-surface-variant truncate leading-tight">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container transition-colors"
          >
            <Icon name="logout" className="text-[20px]" />
          </button>
        </div>
      </aside>
    </>
  );
}
