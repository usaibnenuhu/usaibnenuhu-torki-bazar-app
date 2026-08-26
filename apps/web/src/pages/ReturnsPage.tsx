import { useState, useEffect } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Field, Input, Select } from "../components/Form";
import { useToastStore } from "../store/toastStore";

interface SaleItem {
  id: string;
  productId: string;
  quantity: string;
  unitPrice: string;
  product: { name: string };
}
interface Sale {
  id: string;
  saleNumber: string;
  items: SaleItem[];
}

interface ReturnRecord {
  id: string;
  returnNumber: string;
  returnDate: string;
  totalRefund: string;
  reason?: string;
  sale: {
    saleNumber: string;
    customer?: {
      name: string;
      phone: string;
    };
  };
  items: {
    id: string;
    quantity: string;
    refundAmount: string;
    condition: string;
    product: { name: string };
  }[];
}

export function ReturnsPage() {
  const [saleId, setSaleId] = useState("");
  const [sale, setSale] = useState<Sale | null>(null);
  const [selections, setSelections] = useState<Record<string, { quantity: string; condition: string }>>({});
  const [reason, setReason] = useState("");
  
  const [returnsList, setReturnsList] = useState<ReturnRecord[]>([]);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");
  const push = useToastStore((s) => s.push);

  async function fetchReturns() {
    try {
      // Robustly fallback to common backend route variants
      let result: ReturnRecord[] = [];
      try {
        result = await call<ReturnRecord[]>("returns:list", {});
      } catch {
        try {
          result = await call<ReturnRecord[]>("return:list", {});
        } catch {
          result = await call<ReturnRecord[]>("returns:search", {});
        }
      }
      setReturnsList(result ?? []);
    } catch (err) {
      console.error("Failed to fetch returns list:", err);
      push("Could not load return history. Please check backend route registration.", "error");
    }
  }

  useEffect(() => {
    fetchReturns();
  }, []);

  async function handleLoad(e: React.FormEvent) {
    e.preventDefault();
    if (!saleId.trim()) return;
    try {
      const result = await call<Sale>("sales:get", { id: saleId.trim() });
      setSale(result);
      setSelections({});
      push("Sale loaded successfully", "success");
    } catch (err) {
      push(err instanceof Error ? err.message : "Sale not found", "error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sale) return;
    const items = Object.entries(selections)
      .filter(([, v]) => Number(v.quantity) > 0)
      .map(([saleItemId, v]) => ({ saleItemId, quantity: Number(v.quantity), condition: v.condition }));
    if (items.length === 0) {
      push("Select at least one item and quantity to return.", "error");
      return;
    }
    try {
      await call("returns:create", { saleId: sale.id, items, reason });
      push("Return recorded and inventory updated.", "success");
      setSale(null);
      setSaleId("");
      setReason("");
      fetchReturns();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to create return", "error");
    }
  }

  const filteredReturns = returnsList.filter((r) => {
    const rDate = new Date(r.returnDate);
    const now = new Date();
    if (dateFilter === "today") {
      return rDate.toDateString() === now.toDateString();
    }
    if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
      return rDate >= weekAgo;
    }
    if (dateFilter === "month") {
      return rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Returns Management</h1>
        <p className="text-sm text-slate-500">Process returns and view complete return history.</p>
      </div>

      <Card>
        <form onSubmit={handleLoad} className="flex gap-2">
          <Input
            placeholder="Sale ID or Number (e.g. TB-SALE-2026-000005)"
            value={saleId}
            onChange={(e) => setSaleId(e.target.value)}
          />
          <Button type="submit">Load Sale</Button>
        </form>
      </Card>

      {sale && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">Sale {sale.saleNumber}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {sale.items.map((item) => (
                <div key={item.id} className="grid grid-cols-4 items-end gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="col-span-2">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-slate-400">Sold qty: {item.quantity}</p>
                  </div>
                  <Field label="Return qty">
                    <Input
                      type="number"
                      min={0}
                      value={selections[item.id]?.quantity ?? ""}
                      onChange={(e) =>
                        setSelections((s) => ({
                          ...s,
                          [item.id]: { condition: s[item.id]?.condition ?? "RESELLABLE", quantity: e.target.value },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Condition">
                    <Select
                      value={selections[item.id]?.condition ?? "RESELLABLE"}
                      onChange={(e) =>
                        setSelections((s) => ({
                          ...s,
                          [item.id]: { quantity: s[item.id]?.quantity ?? "0", condition: e.target.value },
                        }))
                      }
                    >
                      <option value="RESELLABLE">Resellable</option>
                      <option value="DAMAGED">Damaged</option>
                      <option value="EXPIRED">Expired</option>
                    </Select>
                  </Field>
                </div>
              ))}
            </div>
            <Field label="Reason">
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for return..." />
            </Field>
            <Button type="submit" className="w-full">
              Process Return & Refund
            </Button>
          </form>
        </Card>
      )}

      {/* Return History Section */}
      <Card>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="font-semibold text-slate-800">Return History</h2>
          <div className="flex gap-2">
            {(["today", "week", "month", "all"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setDateFilter(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  dateFilter === tab
                    ? "bg-emerald-600 text-white shadow"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab === "week" ? "Last 7 Days" : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-700">
              <tr>
                <th className="p-3">Return #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Sale #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items Returned</th>
                <th className="p-3">Refund Amount</th>
                <th className="p-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-400">
                    No return history found for this period.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr key={ret.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{ret.returnNumber}</td>
                    <td className="p-3">{new Date(ret.returnDate).toLocaleString()}</td>
                    <td className="p-3 font-medium text-slate-800">{ret.sale?.saleNumber}</td>
                    <td className="p-3">{ret.sale?.customer?.name || "Walk-in"}</td>
                    <td className="p-3">
                      {ret.items?.map((i, idx) => (
                        <div key={idx} className="text-xs">
                          • {i.product?.name} (Qty: {i.quantity})
                        </div>
                      ))}
                    </td>
                    <td className="p-3 font-semibold text-rose-600">৳{Number(ret.totalRefund).toFixed(2)}</td>
                    <td className="p-3 text-slate-500">{ret.reason || "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
