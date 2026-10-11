import { useCallback, useEffect, useState } from "react";

const buttons = [
  { label: "C", kind: "utility" }, { label: "±", kind: "utility" },
  { label: "%", kind: "utility" }, { label: "÷", kind: "operator" },
  { label: "7" }, { label: "8" }, { label: "9" }, { label: "×", kind: "operator" },
  { label: "4" }, { label: "5" }, { label: "6" }, { label: "−", kind: "operator" },
  { label: "1" }, { label: "2" }, { label: "3" }, { label: "+", kind: "operator" },
  { label: "0", wide: true }, { label: "." }, { label: "=", kind: "equals" },
];

function calculate(aValue, bValue, operator) {
  const a = Number(aValue), b = Number(bValue);
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error("Invalid number");
  switch (operator) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": if (b === 0) throw new Error("Cannot divide by zero"); return a / b;
    default: return b;
  }
}
const formatNumber = (value) => Number.isFinite(value) ? String(Number(value.toPrecision(10))) : "Error";

export default function App() {
  const [display, setDisplay] = useState("0");
  const [storedValue, setStoredValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [startNewNumber, setStartNewNumber] = useState(false);
  const [message, setMessage] = useState("");

  const clear = useCallback(() => {
    setDisplay("0"); setStoredValue(null); setOperator(null);
    setStartNewNumber(false); setMessage("");
  }, []);

  const enterDigit = useCallback((digit) => {
    setMessage("");
    if (startNewNumber) {
      setDisplay(digit === "." ? "0." : digit);
      setStartNewNumber(false);
      return;
    }
    if (digit === "." && display.includes(".")) return;
    setDisplay((current) => {
      if (current === "0" && digit !== ".") return digit;
      if (current.length >= 14) return current;
      return current + digit;
    });
  }, [display, startNewNumber]);

  const chooseOperator = useCallback((nextOperator) => {
    setMessage("");
    if (operator && !startNewNumber && storedValue !== null) {
      try {
        const result = formatNumber(calculate(storedValue, display, operator));
        setDisplay(result); setStoredValue(result);
      } catch {
        setDisplay("Error"); setMessage("Cannot divide by zero."); setStoredValue(null);
      }
    } else setStoredValue(display);
    setOperator(nextOperator);
    setStartNewNumber(true);
  }, [display, operator, startNewNumber, storedValue]);

  const equals = useCallback(() => {
    if (!operator || storedValue === null) return;
    try {
      setDisplay(formatNumber(calculate(storedValue, display, operator)));
      setStoredValue(null); setOperator(null); setStartNewNumber(true); setMessage("");
    } catch {
      setDisplay("Error"); setStoredValue(null); setOperator(null);
      setStartNewNumber(true); setMessage("Cannot divide by zero.");
    }
  }, [display, operator, storedValue]);

  const pressButton = useCallback((label) => {
    if (/^\\d$/.test(label) || label === ".") return enterDigit(label);
    if (label === "C") return clear();
    if (label === "±") {
      if (display !== "0" && display !== "Error") setDisplay((v) => String(Number(v) * -1));
    } else if (label === "%") {
      if (display !== "Error") setDisplay(formatNumber(Number(display) / 100));
    } else if (["+", "−", "×", "÷"].includes(label)) {
      if (display !== "Error") chooseOperator(label);
    } else if (label === "=") equals();
  }, [clear, display, enterDigit, chooseOperator, equals]);

  useEffect(() => {
    const onKey = (event) => {
      if (/^\\d$/.test(event.key)) pressButton(event.key);
      else if (event.key === ".") pressButton(".");
      else if (event.key === "+") pressButton("+");
      else if (event.key === "-") pressButton("−");
      else if (event.key === "*") pressButton("×");
      else if (event.key === "/") { event.preventDefault(); pressButton("÷"); }
      else if (event.key === "Enter" || event.key === "=") pressButton("=");
      else if (event.key === "Escape" || event.key === "Backspace") { event.preventDefault(); pressButton("C"); }
      else if (event.key === "%") pressButton("%");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pressButton]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-800 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-7 text-center">
          <p className="mb-2 text-sm font-medium text-slate-500">DCIT 26 · Laboratory 1</p>
          <h1 className="text-3xl font-bold tracking-tight">My Calculator</h1>
          <p className="mt-2 text-sm text-slate-500">A simple calculator for everyday math.</p>
        </header>
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Calculator">
            <div className="mb-4 flex min-h-28 flex-col items-end justify-end overflow-hidden rounded-xl bg-slate-50 px-4 py-3">
              <div className="min-h-5 text-sm text-slate-400">{storedValue !== null && operator ? `${storedValue} ${operator}` : ""}</div>
              <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-4xl font-semibold tracking-tight sm:text-5xl" aria-live="polite">
                {display.length > 12 ? `${display.slice(0, 12)}…` : display}
              </div>
              {message && <p className="mt-1 text-xs text-rose-600">{message}</p>}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {buttons.map((button) => {
                const color = button.kind === "equals" ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : button.kind === "operator" ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  : button.kind === "utility" ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-100";
                return <button key={button.label} type="button" onClick={() => pressButton(button.label)}
                  aria-label={button.label === "C" ? "Clear" : button.label}
                  className={`min-h-14 rounded-xl text-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-1 active:scale-[0.98] ${color} ${button.wide ? "col-span-2" : ""}`}>
                  {button.label}
                </button>;
              })}
            </div>
          </section>
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">How to use</h2>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-slate-600">
              <li>Enter a number.</li><li>Choose an operation.</li><li>Enter the next number.</li>
              <li>Press <strong className="text-slate-800">=</strong> to see the answer.</li>
              <li>Press <strong className="text-slate-800">C</strong> to start again.</li>
            </ol>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold">Operations</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Addition (+), subtraction (−), multiplication (×), division (÷), and percentage (%).</p>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold">Keyboard</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Use your keyboard too. Press Enter for equals and Escape to clear.</p>
            </div>
          </aside>
        </div>
        <footer className="mt-6 text-center text-xs text-slate-400">Made for DCIT 26 Laboratory 1</footer>
      </div>
    </main>
  );
}