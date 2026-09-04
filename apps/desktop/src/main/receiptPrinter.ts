import { BrowserWindow } from "electron";

interface ReceiptProduct {
  name?: string;
  sku?: string;
}

interface ReceiptItem {
  quantity: number | string;
  unitPrice: number | string;
  discount?: number | string;
  product?: ReceiptProduct | null;
}

interface ReceiptCustomer {
  name?: string | null;
  phone?: string | null;
}

export interface PosReceiptData {
  saleNumber: string;
  saleDate?: string;
  customer?: ReceiptCustomer | null;
  customerName?: string | null;
  customerPhone?: string | null;
  subtotal: number | string;
  discount: number | string;
  totalAmount: number | string;
  paymentMethod: string;
  paymentStatus?: string;
  onlineOrderNumber?: string | null;
  createdBy?: {
    name?: string | null;
    username?: string | null;
  } | null;
  items: ReceiptItem[];
  logoDataUrl?: string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function money(value: unknown): string {
  const number = Number(value ?? 0);

  return number.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string): string {
  if (!value) return new Date().toLocaleString("en-BD");

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-BD", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export async function printPosReceipt(
  receipt: PosReceiptData
): Promise<{ success: true }> {
  const itemsHtml = receipt.items
    .map((item, index) => {
      const quantity = Number(item.quantity ?? 0);
      const unitPrice = Number(item.unitPrice ?? 0);
      const discount = Number(item.discount ?? 0);

      const lineTotal =
        quantity * unitPrice - discount;

      return `
        <div class="item">
          <div class="item-name">
            ${index + 1}. ${escapeHtml(item.product?.name || "Product")}
          </div>

          <div class="item-row">
            <span>${quantity} × ${money(unitPrice)}</span>
            <span>${money(lineTotal)}</span>
          </div>

          ${
            discount > 0
              ? `<div class="item-discount">
                   Discount: -${money(discount)}
                 </div>`
              : ""
          }

          ${
            item.product?.sku
              ? `<div class="sku">
                   SKU: ${escapeHtml(item.product.sku)}
                 </div>`
              : ""
          }
        </div>
      `;
    })
    .join("");

  const customerName =
    receipt.customer?.name ||
    receipt.customerName ||
    "Walk-in Customer";

  const customerPhone =
    receipt.customer?.phone ||
    receipt.customerPhone ||
    "";

  const logoHtml = receipt.logoDataUrl
    ? `
      <img
        class="logo"
        src="${receipt.logoDataUrl}"
        alt="Torki Bazar"
      />
    `
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />

<style>
  * {
    box-sizing: border-box;
  }

  @page {
    size: 80mm auto;
    margin: 0;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    width: 80mm;
    background: white;
  }

  body {
    font-family:
      Arial,
      Helvetica,
      sans-serif;

    color: #111;
    font-size: 11px;
    line-height: 1.35;
  }

  .receipt {
    width: 80mm;
    padding: 5mm 4mm 7mm;
  }

  .header {
    text-align: center;
  }

  .logo {
    display: block;
    width: 42mm;
    max-height: 24mm;
    object-fit: contain;
    margin: 0 auto 2mm;
  }

  .store-name {
    font-size: 19px;
    font-weight: 900;
    letter-spacing: 0.5px;
    margin-bottom: 1mm;
  }

  .store-info {
    font-size: 9.5px;
    line-height: 1.45;
  }

  .divider {
    border-top: 1px dashed #111;
    margin: 3mm 0;
  }

  .meta {
    font-size: 10px;
  }

  .meta-row {
    display: flex;
    gap: 2mm;
    margin: 0.7mm 0;
  }

  .meta-label {
    width: 25mm;
    font-weight: 700;
  }

  .meta-value {
    flex: 1;
    word-break: break-word;
  }

  .items-header,
  .item-row {
    display: flex;
    justify-content: space-between;
    gap: 2mm;
  }

  .items-header {
    font-weight: 800;
    font-size: 9px;
    border-bottom: 1px solid #111;
    padding-bottom: 1mm;
    margin-bottom: 1mm;
  }

  .item {
    padding: 1.5mm 0;
    border-bottom: 1px dotted #aaa;
  }

  .item-name {
    font-weight: 700;
    word-break: break-word;
  }

  .item-row {
    font-size: 10px;
    margin-top: 0.5mm;
  }

  .item-discount,
  .sku {
    font-size: 8.5px;
    color: #444;
  }

  .summary {
    margin-top: 2mm;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin: 1mm 0;
  }

  .total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-top: 1.5px solid #111;
    border-bottom: 1.5px solid #111;
    padding: 2.5mm 0;
    margin-top: 2mm;
    font-size: 17px;
    font-weight: 900;
  }

  .payment {
    margin-top: 3mm;
    font-size: 10px;
  }

  .footer {
    text-align: center;
    margin-top: 5mm;
  }

  .thank-you {
    font-size: 15px;
    font-weight: 900;
  }

  .footer-small {
    font-size: 9px;
    margin-top: 1mm;
  }

  .sale-number {
    margin-top: 3mm;
    font-weight: 800;
    font-size: 10px;
  }
</style>
</head>

<body>
  <div class="receipt">

    <div class="header">
      ${logoHtml}

      <div class="store-name">
        TORKI BAZAR
      </div>

      <div class="store-info">
        Torki Bandar, Gournadi, Barishal<br />
        E-mail: contact@torkibazar.com<br />
        Website: torkibazar.com
      </div>
    </div>

    <div class="divider"></div>

    <div class="meta">
      <div class="meta-row">
        <span class="meta-label">Sale No.</span>
        <span class="meta-value">
          ${escapeHtml(receipt.saleNumber)}
        </span>
      </div>

      <div class="meta-row">
        <span class="meta-label">Date</span>
        <span class="meta-value">
          ${escapeHtml(formatDate(receipt.saleDate))}
        </span>
      </div>

      <div class="meta-row">
        <span class="meta-label">Customer</span>
        <span class="meta-value">
          ${escapeHtml(customerName)}
        </span>
      </div>

      ${
        customerPhone
          ? `
            <div class="meta-row">
              <span class="meta-label">Mobile</span>
              <span class="meta-value">
                ${escapeHtml(customerPhone)}
              </span>
            </div>
          `
          : ""
      }

      ${
        receipt.onlineOrderNumber
          ? `
            <div class="meta-row">
              <span class="meta-label">Order</span>
              <span class="meta-value">
                ${escapeHtml(receipt.onlineOrderNumber)}
              </span>
            </div>
          `
          : ""
      }
    </div>

    <div class="divider"></div>

    <div class="items-header">
      <span>ITEM</span>
      <span>AMOUNT</span>
    </div>

    ${itemsHtml}

    <div class="summary">

      <div class="summary-row">
        <span>Subtotal</span>
        <span>${money(receipt.subtotal)}</span>
      </div>

      <div class="summary-row">
        <span>Discount</span>
        <span>-${money(receipt.discount)}</span>
      </div>

      <div class="total">
        <span>TOTAL</span>
        <span>৳${money(receipt.totalAmount)}</span>
      </div>

    </div>

    <div class="payment">

      <div class="summary-row">
        <strong>Payment</strong>
        <strong>
          ${escapeHtml(receipt.paymentMethod)}
        </strong>
      </div>

      ${
        receipt.paymentStatus
          ? `
            <div class="summary-row">
              <span>Status</span>
              <span>
                ${escapeHtml(receipt.paymentStatus)}
              </span>
            </div>
          `
          : ""
      }

    </div>

    <div class="footer">

      <div class="divider"></div>

      <div class="thank-you">
        Thank You!
      </div>

      <div class="footer-small">
        Visit Again
      </div>

      <div class="footer-small">
        Torki Bazar
      </div>

      <div class="sale-number">
        ${escapeHtml(receipt.saleNumber)}
      </div>

    </div>

  </div>
</body>
</html>
`;

  const printWindow = new BrowserWindow({
    width: 420,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: true,
    },
  });

  try {
    await printWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
    );

    const height =
      Math.max(
        220,
        150 +
          receipt.items.length * 32
      ) * 1000;

    await new Promise<void>((resolve, reject) => {
      printWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          margins: {
            marginType: "none",
          },
          pageSize: {
            width: 80000,
            height,
          },
        },
        (success, failureReason) => {
          if (success) {
            resolve();
            return;
          }

          reject(
            new Error(
              failureReason ||
                "Thermal receipt printing failed."
            )
          );
        }
      );
    });

    return { success: true };
  } finally {
    if (!printWindow.isDestroyed()) {
      printWindow.close();
    }
  }
}
