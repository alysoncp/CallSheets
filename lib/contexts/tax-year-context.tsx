"use client";

import { createContext, useContext, useState, useMemo, ReactNode, useCallback } from "react";

interface TaxYearContextType {
  taxYear: number;
  setTaxYear: (year: number) => void;
}

const TaxYearContext = createContext<TaxYearContextType | undefined>(undefined);

export function TaxYearProvider({ children }: { children: ReactNode }) {
  const [taxYear, setTaxYearState] = useState<number>(new Date().getFullYear());

  const setTaxYear = useCallback((year: number) => {
    setTaxYearState(year);
  }, []);

  const value = useMemo(() => ({
    taxYear,
    setTaxYear,
  }), [taxYear, setTaxYear]);

  return (
    <TaxYearContext.Provider value={value}>
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
