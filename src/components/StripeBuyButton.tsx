"use client";

import { useEffect } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-buy-button": React.HTMLAttributes<HTMLElement> & {
        "buy-button-id": string;
        "publishable-key": string;
      };
    }
  }
}

export default function StripeBuyButton() {
  useEffect(() => {
    if (document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/buy-button.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <stripe-buy-button
      buy-button-id="buy_btn_1TtEsS00zydPQy6p5qj35oKs"
      publishable-key="pk_live_51TrExQ00zydPQy6pkXt5RbMSUUzHosMgUdKivsq5j3Y7aRQ0gi6cRjkCe865EJVI3EzUiK05ijBpRZyzwJOcPDmv00RjJtnMtr"
    />
  );
}