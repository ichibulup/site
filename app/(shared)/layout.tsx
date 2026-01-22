import React, { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
