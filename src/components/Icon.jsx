// Small helper for Google's Material Symbols icons (the ones in your design).
export default function Icon({ name, className = "" }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}
