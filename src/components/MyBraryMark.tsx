/** Black squircle + white open-book mark used as login B.I. emblem (matches favicon). */
export function MyBraryMark({ className = "" }: { className?: string }) {
  return (
    <span className={"mybrary-mark " + className} aria-hidden>
      <svg className="mybrary-mark-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="currentColor" />
        <path
          d="M12 11.5v17.2c0 .6.35 1 .9 1 .2 0 .4-.05.6-.15 1.55-.75 3.45-.75 5 0 .2.1.4.15.6.15h.05c.55 0 .9-.4.9-1V11.5c0-.55-.4-.95-.95-.95-.25 0-.5.07-.7.2-1.7.95-3.85.95-5.55 0a1.1 1.1 0 0 0-.7-.2c-.55 0-.95.4-.95.95Z"
          stroke="var(--color-enamel, #faf9f6)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M20.05 11.5v17.2c0 .6.35 1 .9 1 .2 0 .4-.05.6-.15 1.55-.75 3.45-.75 5 0 .2.1.4.15.6.15h.05c.55 0 .9-.4.9-1V11.5c0-.55-.4-.95-.95-.95-.25 0-.5.07-.7.2-1.7.95-3.85.95-5.55 0a1.1 1.1 0 0 0-.7-.2c-.55 0-.95.4-.95.95Z"
          stroke="var(--color-enamel, #faf9f6)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M20.05 11.5v17.2"
          stroke="var(--color-enamel, #faf9f6)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
