import React from "react";

export interface CurrencyDisplayProps {
  value: number | null | undefined;
  currency?: string;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  value,
  currency = "USD",
  className = "",
}) => {
  if (value === null || value === undefined) {
    return <span className="text-muted/60 font-mono italic">N/A</span>;
  }

  const symbols: Record<string, string> = {
    USD: "$",
    INR: "₹",
    GBP: "£",
    EUR: "€",
  };

  const symbol = symbols[currency.toUpperCase()] || currency;
  const formattedNumber = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <span className={`inline-flex items-baseline font-mono ${className}`}>
      <span className="currency-symbol text-[0.85em] font-extrabold mr-0.5 select-none text-primary/90">
        {symbol}
      </span>
      <span className="font-bold tracking-tight text-foreground">{formattedNumber}</span>
    </span>
  );
};
