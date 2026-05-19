import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { CartProvider } from "@/components/storefront/CartProvider";
import { PageTransition } from "@/components/shared/PageTransition";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </CartProvider>
  );
}

