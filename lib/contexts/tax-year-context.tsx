"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TaxYearContextType {
  taxYear: number;
  setTaxYear: (year: number) => void;
}

const TaxYearContext = createContext<TaxYearContextType | undefined>(undefined);

export function TaxYearProvider({ children }: { children: ReactNode }) {
  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear());

  return (
    <TaxYearContext.Provider value={{ taxYear, setTaxYear }}>
      {children}
    </TaxYearContext.Provider>
  );
}

export function useTaxYear() {
  const context = useContext(TaxYearContext);
  if (context === undefined) {
    throw new Error("useTaxYear must be used within a TaxYearProvider");
  }
  return context;
}
