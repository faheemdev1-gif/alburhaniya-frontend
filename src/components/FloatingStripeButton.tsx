import { useEffect, useRef, useState } from "react";
import './FloatingStripeButton.css';
import { useContent } from '../content';
import DonationWidget from './DonationWidget';

export default function FloatingStripeButton() {
  const label = useContent().navigation.donate;
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const openDonationModal = () => setIsOpen(true);
    window.addEventListener("open-donation-modal", openDonationModal);
    return () => window.removeEventListener("open-donation-modal", openDonationModal);
  }, []);
  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    modalRef.current?.querySelector<HTMLButtonElement>('.donation-modal-close')?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const elements = Array.from(modalRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]') || []).filter(el => !el.matches(':disabled'));
        const first = elements[0], last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="floating-donate-button"
        onClick={() => setIsOpen(true)}
      >
        {label}
      </button>

      {isOpen && (
        <div
          className="donation-modal-backdrop"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            ref={modalRef}
            className="donation-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Make a donation"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="donation-modal-close"
              aria-label="Close donation window"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>

            <DonationWidget />
          </div>
        </div>
      )}
    </>
  );
}