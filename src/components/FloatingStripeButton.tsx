import { useEffect, useState } from "react";
import "./FloatingStripeButton.css";

export default function FloatingStripeButton() {
  const [isOpen, setIsOpen] = useState(false);
useEffect(() => {
  const openDonationModal = () => {
    setIsOpen(true);
  };

  window.addEventListener("open-donation-modal", openDonationModal);

  return () => {
    window.removeEventListener("open-donation-modal", openDonationModal);
  };
}, []);
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="floating-donate-button"
        onClick={() => setIsOpen(true)}
      >
        Donate Now
      </button>

      {isOpen && (
        <div
          className="donation-modal-backdrop"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
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

            <stripe-buy-button
              buy-button-id="buy_btn_1TtEsS00zydPQy6p5qj35oKs"
              publishable-key="pk_live_51TrExQ00zydPQy6pkXt5RbMSUUzHosMgUdKivsq5j3Y7aRQ0gi6cRjkCe865EJVI3EzUiK05ijBpRZyzwJOcPDmv00RjJtnMtr"
            />
          </div>
        </div>
      )}
    </>
  );
}