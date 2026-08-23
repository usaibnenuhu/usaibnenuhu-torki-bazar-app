import bcrypt from "bcryptjs";
import {
  ALL_PERMISSIONS,
  MANAGER_PERMISSIONS,
  SYSTEM_ROLES,
  DEFAULT_UNITS,
  DEFAULT_EXPENSE_CATEGORIES,
  INVOICE_PREFIXES,
} from "@torki-bazar/shared";
import { prisma } from "./client";

async function main() {
  console.log("Seeding Torki Bazar database...");

  // ============================================================
  // PERMISSIONS
  // ============================================================

  for (const code of ALL_PERMISSIONS) {
    const module = code.split(".")[0];

    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: {
        code,
        module,
      },
    });
  }

  // ============================================================
  // ROLES
  // ============================================================

  const ownerRole = await prisma.role.upsert({
    where: {
      name: SYSTEM_ROLES.OWNER_ADMIN,
    },
    update: {},
    create: {
      name: SYSTEM_ROLES.OWNER_ADMIN,
      description:
        "Full access to every module and setting.",
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: {
      name: SYSTEM_ROLES.MANAGER,
    },
    update: {},
    create: {
      name: SYSTEM_ROLES.MANAGER,
      description:
        "Daily operations without destructive financial access.",
      isSystem: true,
    },
  });

  // ============================================================
  // PERMISSION RECORDS
  // ============================================================

  const allPermissionRecords =
    await prisma.permission.findMany();

  const permissionByCode = new Map(
    allPermissionRecords.map((permission) => [
      permission.code,
      permission.id,
    ])
  );

  // ============================================================
  // OWNER PERMISSIONS
  // ============================================================

  for (const code of ALL_PERMISSIONS) {
    const permissionId =
      permissionByCode.get(code);

    if (!permissionId) {
      throw new Error(
        `Permission not found: ${code}`
      );
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: ownerRole.id,
          permissionId,
        },
      },
      update: {},
      create: {
        roleId: ownerRole.id,
        permissionId,
      },
    });
  }

  // ============================================================
  // MANAGER PERMISSIONS
  // ============================================================

  for (const code of MANAGER_PERMISSIONS) {
    const permissionId =
      permissionByCode.get(code);

    if (!permissionId) {
      throw new Error(
        `Permission not found: ${code}`
      );
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId,
      },
    });
  }

  // ============================================================
  // DEFAULT OWNER USER
  // ============================================================

  const ownerPasswordHash =
    await bcrypt.hash(
      "ChangeMe123!",
      12
    );

  await prisma.user.upsert({
    where: {
      username: "owner",
    },
    update: {},
    create: {
      username: "owner",
      passwordHash: ownerPasswordHash,
      fullName: "Torki Bazar Owner",
      roleId: ownerRole.id,
    },
  });

  // ============================================================
  // DEFAULT UNITS
  // ============================================================

  for (const unit of DEFAULT_UNITS) {
    await prisma.unit.upsert({
      where: {
        name: unit.name,
      },
      update: {},
      create: unit,
    });
  }

  // ============================================================
  // DEFAULT EXPENSE CATEGORIES
  // ============================================================

  for (const name of DEFAULT_EXPENSE_CATEGORIES) {
    await prisma.expenseCategory.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
      },
    });
  }

  // ============================================================
  // INVOICE SEQUENCES
  // ============================================================

  const currentYear =
    new Date().getFullYear();

  const sequencesWithYear = [
    INVOICE_PREFIXES.SALE,
    INVOICE_PREFIXES.PURCHASE,
    INVOICE_PREFIXES.RETURN,
    INVOICE_PREFIXES.EXPENSE,
    INVOICE_PREFIXES.PAYMENT,
  ];

  for (const prefix of sequencesWithYear) {
    await prisma.invoiceSequence.upsert({
      where: {
        prefix_year: {
          prefix,
          year: currentYear,
        },
      },
      update: {},
      create: {
        prefix,
        year: currentYear,
        lastNumber: 0,
      },
    });
  }

  // Membership sequence does not use a calendar year.
  await prisma.invoiceSequence.upsert({
    where: {
      prefix_year: {
        prefix:
          INVOICE_PREFIXES.MEMBERSHIP,
        year: 0,
      },
    },
    update: {},
    create: {
      prefix:
        INVOICE_PREFIXES.MEMBERSHIP,
      year: 0,
      lastNumber: 0,
    },
  });

  // ============================================================
  // DEMO CATEGORY
  // ============================================================

  const dryFood =
    await prisma.category.upsert({
      where: {
        name: "Dry Food",
      },
      update: {},
      create: {
        name: "Dry Food",
      },
    });

  // ============================================================
  // DEMO SUBCATEGORY
  // ============================================================

  const rice =
    await prisma.subcategory.upsert({
      where: {
        categoryId_name: {
          categoryId: dryFood.id,
          name: "Rice",
        },
      },
      update: {},
      create: {
        categoryId: dryFood.id,
        name: "Rice",
      },
    });

  // ============================================================
  // FIND DEFAULT UNITS
  // ============================================================

  const piece =
    await prisma.unit.findUniqueOrThrow({
      where: {
        name: "Piece",
      },
    });

  const kg =
    await prisma.unit.findUniqueOrThrow({
      where: {
        name: "Kilogram",
      },
    });

  // Prevent unused-variable TypeScript warning
  void piece;

  // ============================================================
  // DEMO PRODUCT
  // ============================================================

  await prisma.product.upsert({
    where: {
      sku: "RICE-001",
    },
    update: {},
    create: {
      name: "Miniket Rice",
      categoryId: dryFood.id,
      subcategoryId: rice.id,
      sku: "RICE-001",
      barcode: "8901000000011",
      unitId: kg.id,
      purchasePrice: 60,
      sellingPrice: 75,
      minimumStock: 20,
      currentStock: 0,
      status: "ACTIVE",
    },
  });

  // ============================================================
  // FINISHED
  // ============================================================

  console.log("");
  console.log(
    "=================================================="
  );
  console.log(
    "Torki Bazar database seed completed successfully."
  );
  console.log(
    "=================================================="
  );

  console.log("");
  console.log(
    "Default login:"
  );
  console.log(
    "Username: owner"
  );
  console.log(
    "Password: ChangeMe123!"
  );
  console.log("");
  console.log(
    "IMPORTANT: Change this password immediately after first login."
  );
}

main()
  .catch((error) => {
    console.error("");
    console.error(
      "Database seed failed:"
    );
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });