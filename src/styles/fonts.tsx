import { 
  Geist, 
  Geist_Mono, 
  Playfair_Display, 
  Space_Grotesk,
} from "next/font/google";

const space = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export { 
  space, 
  playfair, 
  geistSans, 
  geistMono,
};