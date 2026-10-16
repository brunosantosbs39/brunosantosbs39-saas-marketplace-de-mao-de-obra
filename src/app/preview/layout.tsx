import "./preview-tokens.css";
import Script from "next/script";
import type { ReactNode } from "react";

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://ka-f.webawesome.com/webawesome@3.14.0/styles/themes/default.css"
      />
      <link
        rel="stylesheet"
        href="https://ka-f.webawesome.com/webawesome@3.14.0/styles/utilities.css"
      />
      <Script
        id="webawesome-autoloader"
        type="module"
        src="https://ka-f.webawesome.com/webawesome@3.14.0/webawesome.loader.js"
        strategy="afterInteractive"
      />
      <div className="preview-design-system">{children}</div>
    </>
  );
}
