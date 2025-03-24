import { Poppins } from "next/font/google";
import "@/../styles/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100","200","400","700"],
});


export const metadata = {
  title: "Meal Match",
  description: "Mix and match meal components",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={poppins.className}
      >
        {children}
      </body>
    </html>
  );
}
