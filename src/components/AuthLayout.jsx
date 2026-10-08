import Icon from "./Icon";

// Shared look for the Login and Register pages.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="px-6 py-5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
          <Icon name="checklist" className="text-[20px]" />
        </div>
        <span className="font-display font-semibold text-lg">TaskFlow</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(67,56,202,0.08)] overflow-hidden">
          <div className="p-8">
            <h1 className="font-display text-3xl font-bold text-center tracking-tight">{title}</h1>
            <p className="text-center text-on-surface-variant mt-2 mb-8">{subtitle}</p>
            {children}
          </div>
          <div className="bg-surface-container-low text-center py-4 text-sm text-on-surface-variant">
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}

export const inputClass =
  "w-full h-11 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent";

export const labelClass = "block text-sm font-medium mb-1.5";

export function ErrorBanner({ children }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg bg-error-container text-on-error-container px-3 py-2.5 text-sm"
    >
      <Icon name="error" className="text-[18px] mt-px" />
      <span>{children}</span>
    </div>
  );
}
