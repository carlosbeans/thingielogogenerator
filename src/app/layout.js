//handle custom font
import localFont from 'next/font/local';
const albertus = localFont({
  src: './fonts/AlbertusMTStd.woff',
})

import "./globals.css";


export const metadata = {
  title: "Thingify",
  description: "See your logo in the style of The Thing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={albertus.className}>
      <body>
        {children}
      </body>
    </html>
  );
}
