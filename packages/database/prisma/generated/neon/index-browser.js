
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  isSystem: 'isSystem',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  code: 'code',
  module: 'module',
  description: 'description'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  id: 'id',
  roleId: 'roleId',
  permissionId: 'permissionId'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  passwordHash: 'passwordHash',
  fullName: 'fullName',
  phone: 'phone',
  roleId: 'roleId',
  isActive: 'isActive',
  lastLoginAt: 'lastLoginAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoginAttemptScalarFieldEnum = {
  id: 'id',
  username: 'username',
  success: 'success',
  userId: 'userId',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  username: 'username',
  role: 'role',
  action: 'action',
  module: 'module',
  recordId: 'recordId',
  previousValue: 'previousValue',
  newValue: 'newValue',
  createdAt: 'createdAt'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  isArchived: 'isArchived',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubcategoryScalarFieldEnum = {
  id: 'id',
  categoryId: 'categoryId',
  name: 'name',
  isArchived: 'isArchived',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BrandScalarFieldEnum = {
  id: 'id',
  name: 'name',
  isArchived: 'isArchived'
};

exports.Prisma.UnitScalarFieldEnum = {
  id: 'id',
  name: 'name',
  abbreviation: 'abbreviation',
  isArchived: 'isArchived'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  name: 'name',
  imageUrl: 'imageUrl',
  categoryId: 'categoryId',
  subcategoryId: 'subcategoryId',
  brandId: 'brandId',
  sku: 'sku',
  barcode: 'barcode',
  unitId: 'unitId',
  packSize: 'packSize',
  expiryDate: 'expiryDate',
  purchasePrice: 'purchasePrice',
  sellingPrice: 'sellingPrice',
  wholesalePrice: 'wholesalePrice',
  minimumStock: 'minimumStock',
  currentStock: 'currentStock',
  description: 'description',
  status: 'status',
  defaultSupplierId: 'defaultSupplierId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductBatchScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  supplierId: 'supplierId',
  purchaseId: 'purchaseId',
  batchCode: 'batchCode',
  purchaseDate: 'purchaseDate',
  manufacturingDate: 'manufacturingDate',
  quantityReceived: 'quantityReceived',
  remainingQuantity: 'remainingQuantity',
  quantityReturned: 'quantityReturned',
  purchasePrice: 'purchasePrice',
  sellingPrice: 'sellingPrice',
  expiryDate: 'expiryDate',
  purchaseInvoiceNumber: 'purchaseInvoiceNumber',
  notes: 'notes',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StockMovementScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  batchId: 'batchId',
  movementType: 'movementType',
  quantity: 'quantity',
  previousQuantity: 'previousQuantity',
  newQuantity: 'newQuantity',
  referenceType: 'referenceType',
  referenceId: 'referenceId',
  userId: 'userId',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.SupplierScalarFieldEnum = {
  id: 'id',
  name: 'name',
  company: 'company',
  phone: 'phone',
  email: 'email',
  address: 'address',
  notes: 'notes',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PurchaseScalarFieldEnum = {
  id: 'id',
  purchaseNumber: 'purchaseNumber',
  supplierId: 'supplierId',
  invoiceNumber: 'invoiceNumber',
  purchaseDate: 'purchaseDate',
  totalAmount: 'totalAmount',
  paidAmount: 'paidAmount',
  dueAmount: 'dueAmount',
  paymentStatus: 'paymentStatus',
  status: 'status',
  voidReason: 'voidReason',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.PurchaseItemScalarFieldEnum = {
  id: 'id',
  purchaseId: 'purchaseId',
  productId: 'productId',
  batchId: 'batchId',
  quantity: 'quantity',
  unitCost: 'unitCost',
  total: 'total'
};

exports.Prisma.SupplierPaymentScalarFieldEnum = {
  id: 'id',
  idempotencyKey: 'idempotencyKey',
  paymentNumber: 'paymentNumber',
  supplierId: 'supplierId',
  purchaseId: 'purchaseId',
  amount: 'amount',
  paymentDate: 'paymentDate',
  method: 'method',
  reference: 'reference',
  notes: 'notes',
  previousOutstanding: 'previousOutstanding',
  remainingOutstanding: 'remainingOutstanding',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.SupplierReturnScalarFieldEnum = {
  id: 'id',
  returnNumber: 'returnNumber',
  supplierId: 'supplierId',
  purchaseId: 'purchaseId',
  productId: 'productId',
  batchId: 'batchId',
  quantity: 'quantity',
  unitCost: 'unitCost',
  returnValue: 'returnValue',
  returnDate: 'returnDate',
  reason: 'reason',
  notes: 'notes',
  settlementType: 'settlementType',
  status: 'status',
  cancelReason: 'cancelReason',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CustomerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  phone: 'phone',
  address: 'address',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CustomerPaymentScalarFieldEnum = {
  id: 'id',
  customerId: 'customerId',
  saleId: 'saleId',
  amount: 'amount',
  paymentDate: 'paymentDate',
  method: 'method',
  reference: 'reference',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.MembershipScalarFieldEnum = {
  id: 'id',
  membershipNumber: 'membershipNumber',
  customerId: 'customerId',
  tier: 'tier',
  discountPercent: 'discountPercent',
  issueDate: 'issueDate',
  expiryDate: 'expiryDate',
  status: 'status',
  qrCodeData: 'qrCodeData',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SaleScalarFieldEnum = {
  id: 'id',
  saleNumber: 'saleNumber',
  customerId: 'customerId',
  saleDate: 'saleDate',
  subtotal: 'subtotal',
  discount: 'discount',
  totalAmount: 'totalAmount',
  cogsAmount: 'cogsAmount',
  paymentMethod: 'paymentMethod',
  paymentStatus: 'paymentStatus',
  status: 'status',
  voidReason: 'voidReason',
  codCollectedAt: 'codCollectedAt',
  codCollectedById: 'codCollectedById',
  onlineOrderNumber: 'onlineOrderNumber',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.SaleItemScalarFieldEnum = {
  id: 'id',
  saleId: 'saleId',
  productId: 'productId',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  discount: 'discount',
  subtotal: 'subtotal',
  cogsTotal: 'cogsTotal'
};

exports.Prisma.SaleItemBatchConsumptionScalarFieldEnum = {
  id: 'id',
  saleItemId: 'saleItemId',
  batchId: 'batchId',
  quantityConsumed: 'quantityConsumed',
  unitCost: 'unitCost'
};

exports.Prisma.ReturnScalarFieldEnum = {
  id: 'id',
  returnNumber: 'returnNumber',
  saleId: 'saleId',
  customerId: 'customerId',
  returnDate: 'returnDate',
  totalRefund: 'totalRefund',
  reason: 'reason',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.ReturnItemScalarFieldEnum = {
  id: 'id',
  returnId: 'returnId',
  saleItemId: 'saleItemId',
  productId: 'productId',
  quantity: 'quantity',
  condition: 'condition',
  refundAmount: 'refundAmount',
  targetBatchId: 'targetBatchId'
};

exports.Prisma.EmployeeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  phone: 'phone',
  address: 'address',
  position: 'position',
  joiningDate: 'joiningDate',
  baseSalary: 'baseSalary',
  status: 'status',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalaryScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  salaryMonth: 'salaryMonth',
  baseSalary: 'baseSalary',
  bonus: 'bonus',
  deduction: 'deduction',
  netSalary: 'netSalary',
  paymentStatus: 'paymentStatus',
  paymentDate: 'paymentDate',
  paymentMethod: 'paymentMethod',
  reference: 'reference',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.ExpenseCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  isArchived: 'isArchived'
};

exports.Prisma.ExpenseScalarFieldEnum = {
  id: 'id',
  expenseNumber: 'expenseNumber',
  categoryId: 'categoryId',
  description: 'description',
  amount: 'amount',
  expenseDate: 'expenseDate',
  paymentMethod: 'paymentMethod',
  reference: 'reference',
  notes: 'notes',
  status: 'status',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.CashTransactionScalarFieldEnum = {
  id: 'id',
  type: 'type',
  amount: 'amount',
  transactionDate: 'transactionDate',
  note: 'note',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  type: 'type',
  title: 'title',
  message: 'message',
  severity: 'severity',
  isRead: 'isRead',
  relatedEntityType: 'relatedEntityType',
  relatedEntityId: 'relatedEntityId',
  createdAt: 'createdAt'
};

exports.Prisma.DailyClosingScalarFieldEnum = {
  id: 'id',
  closingDate: 'closingDate',
  totalSales: 'totalSales',
  cashSales: 'cashSales',
  bkashSales: 'bkashSales',
  codCollected: 'codCollected',
  returns: 'returns',
  expenses: 'expenses',
  supplierPayments: 'supplierPayments',
  customerPayments: 'customerPayments',
  cogs: 'cogs',
  grossProfit: 'grossProfit',
  netOperatingResult: 'netOperatingResult',
  closedById: 'closedById',
  createdAt: 'createdAt'
};

exports.Prisma.InvoiceSequenceScalarFieldEnum = {
  id: 'id',
  prefix: 'prefix',
  year: 'year',
  lastNumber: 'lastNumber'
};

exports.Prisma.SyncQueueScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  operationType: 'operationType',
  payload: 'payload',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  syncStatus: 'syncStatus',
  retryCount: 'retryCount',
  errorMessage: 'errorMessage',
  syncedAt: 'syncedAt'
};

exports.Prisma.BackupScalarFieldEnum = {
  id: 'id',
  filePath: 'filePath',
  fileSizeBytes: 'fileSizeBytes',
  createdAt: 'createdAt',
  createdById: 'createdById',
  notes: 'notes'
};

exports.Prisma.BkashTransactionScalarFieldEnum = {
  id: 'id',
  type: 'type',
  amount: 'amount',
  transactionDate: 'transactionDate',
  note: 'note',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BankTransactionScalarFieldEnum = {
  id: 'id',
  type: 'type',
  amount: 'amount',
  transactionDate: 'transactionDate',
  note: 'note',
  reference: 'reference',
  transferId: 'transferId',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Role: 'Role',
  Permission: 'Permission',
  RolePermission: 'RolePermission',
  User: 'User',
  LoginAttempt: 'LoginAttempt',
  AuditLog: 'AuditLog',
  Category: 'Category',
  Subcategory: 'Subcategory',
  Brand: 'Brand',
  Unit: 'Unit',
  Product: 'Product',
  ProductBatch: 'ProductBatch',
  StockMovement: 'StockMovement',
  Supplier: 'Supplier',
  Purchase: 'Purchase',
  PurchaseItem: 'PurchaseItem',
  SupplierPayment: 'SupplierPayment',
  SupplierReturn: 'SupplierReturn',
  Customer: 'Customer',
  CustomerPayment: 'CustomerPayment',
  Membership: 'Membership',
  Sale: 'Sale',
  SaleItem: 'SaleItem',
  SaleItemBatchConsumption: 'SaleItemBatchConsumption',
  Return: 'Return',
  ReturnItem: 'ReturnItem',
  Employee: 'Employee',
  Salary: 'Salary',
  ExpenseCategory: 'ExpenseCategory',
  Expense: 'Expense',
  CashTransaction: 'CashTransaction',
  Notification: 'Notification',
  DailyClosing: 'DailyClosing',
  InvoiceSequence: 'InvoiceSequence',
  SyncQueue: 'SyncQueue',
  Backup: 'Backup',
  BkashTransaction: 'BkashTransaction',
  BankTransaction: 'BankTransaction'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
