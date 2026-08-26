import { useEffect, useState } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DataTable } from "../components/DataTable";
import { Field, Input, Select } from "../components/Form";
import { Modal } from "../components/Modal";
import { formatBDT } from "../utils/format";
import { useToastStore } from "../store/toastStore";

interface Employee {
  id: string;
  name: string;
  phone: string;
  position: string;
  baseSalary: string;
  status: string;
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [salaryModalFor, setSalaryModalFor] = useState<Employee | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", position: "", baseSalary: "0", address: "" });
  const [salaryForm, setSalaryForm] = useState({ salaryMonth: new Date().toISOString().slice(0, 7), bonus: "0", deduction: "0", paymentMethod: "CASH" });
  const push = useToastStore((s) => s.push);

  async function load() {
    setEmployees(await call<Employee[]>("employees:list"));
  }
  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await call("employees:create", { ...form, baseSalary: Number(form.baseSalary) });
      push("Employee added.", "success");
      setModalOpen(false);
      load();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to add employee", "error");
    }
  }

  async function handlePaySalary(e: React.FormEvent) {
    e.preventDefault();
    if (!salaryModalFor) return;
    try {
      await call("salaries:pay", {
        employeeId: salaryModalFor.id,
        salaryMonth: salaryForm.salaryMonth,
        bonus: Number(salaryForm.bonus),
        deduction: Number(salaryForm.deduction),
        paymentMethod: salaryForm.paymentMethod,
      });
      push("Salary paid and recorded as an expense.", "success");
      setSalaryModalFor(null);
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to pay salary", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500">Manage staff and monthly salary payments.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ New Employee</Button>
      </div>
      <Card>
        <DataTable
          rows={employees}
          keyFor={(e) => e.id}
          emptyMessage="No employees yet."
          columns={[
            { header: "Name", accessor: (e) => e.name },
            { header: "Position", accessor: (e) => e.position },
            { header: "Phone", accessor: (e) => e.phone },
            { header: "Base Salary", accessor: (e) => formatBDT(e.baseSalary) },
            { header: "Status", accessor: (e) => e.status },
            {
              header: "",
              accessor: (e) => (
                <button className="text-sm text-brand-600 hover:underline" onClick={() => setSalaryModalFor(e)}>
                  Pay Salary
                </button>
              ),
            },
          ]}
        />
      </Card>

      <Modal open={modalOpen} title="New Employee" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Position">
            <Input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </Field>
          <Field label="Base salary">
            <Input type="number" min={0} value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} />
          </Field>
          <Button type="submit" className="w-full">
            Save Employee
          </Button>
        </form>
      </Modal>

      <Modal open={!!salaryModalFor} title={`Pay Salary — ${salaryModalFor?.name ?? ""}`} onClose={() => setSalaryModalFor(null)}>
        <form onSubmit={handlePaySalary} className="space-y-4">
          <Field label="Salary month">
            <Input type="month" value={salaryForm.salaryMonth} onChange={(e) => setSalaryForm({ ...salaryForm, salaryMonth: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bonus">
              <Input type="number" min={0} value={salaryForm.bonus} onChange={(e) => setSalaryForm({ ...salaryForm, bonus: e.target.value })} />
            </Field>
            <Field label="Deduction">
              <Input type="number" min={0} value={salaryForm.deduction} onChange={(e) => setSalaryForm({ ...salaryForm, deduction: e.target.value })} />
            </Field>
          </div>
          <Field label="Payment method">
            <Select value={salaryForm.paymentMethod} onChange={(e) => setSalaryForm({ ...salaryForm, paymentMethod: e.target.value })}>
              <option value="CASH">Cash</option>
              <option value="BKASH">bKash</option>
              <option value="BANK">Bank Transfer</option>
            </Select>
          </Field>
          <Button type="submit" className="w-full">
            Confirm Payment
          </Button>
        </form>
      </Modal>
    </div>
  );
}
