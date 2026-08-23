"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.archiveCategory = archiveCategory;
exports.createSubcategory = createSubcategory;
exports.deleteSubcategory = deleteSubcategory;
exports.archiveSubcategory = archiveSubcategory;
exports.listBrands = listBrands;
exports.createBrand = createBrand;
exports.listUnits = listUnits;
exports.createUnit = createUnit;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
// ---- Categories ---------------------------------------------------------
async function listCategories(includeArchived = false) {
    return database_1.prisma.category.findMany({
        where: includeArchived ? {} : { isArchived: false },
        include: { subcategories: { where: includeArchived ? {} : { isArchived: false } } },
        orderBy: { name: "asc" },
    });
}
async function createCategory(session, name, description) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CATEGORIES_MANAGE);
    const existing = await database_1.prisma.category.findUnique({ where: { name } });
    if (existing)
        throw new shared_1.DuplicateError(`Category "${name}" already exists.`);
    const category = await database_1.prisma.category.create({ data: { name, description } });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "CATEGORY", recordId: category.id, newValue: category });
    return category;
}
async function updateCategory(session, id, data) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CATEGORIES_MANAGE);
    const before = await database_1.prisma.category.findUnique({ where: { id } });
    if (!before)
        throw new shared_1.NotFoundError("Category not found.");
    const category = await database_1.prisma.category.update({ where: { id }, data });
    await (0, auditService_1.recordAuditLog)(session, { action: "UPDATE", module: "CATEGORY", recordId: id, previousValue: before, newValue: category });
    return category;
}
async function deleteCategory(session, id) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CATEGORIES_MANAGE);
    const category = await database_1.prisma.category.findUnique({
        where: { id },
        include: { subcategories: true, products: true },
    });
    if (!category)
        throw new shared_1.NotFoundError("Category not found.");
    if (category.subcategories.length > 0 || category.products.length > 0) {
        throw new shared_1.ValidationError("Cannot delete category containing subcategories or products.");
    }
    await database_1.prisma.category.delete({ where: { id } });
    await (0, auditService_1.recordAuditLog)(session, { action: "DELETE", module: "CATEGORY", recordId: id, previousValue: category });
}
async function archiveCategory(session, id, isArchived = true) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CATEGORIES_MANAGE);
    const category = await database_1.prisma.category.update({ where: { id }, data: { isArchived } });
    await (0, auditService_1.recordAuditLog)(session, { action: isArchived ? "ARCHIVE" : "UNARCHIVE", module: "CATEGORY", recordId: id });
    return category;
}
// ---- Subcategories -------------------------------------------------------
async function createSubcategory(session, categoryId, name) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CATEGORIES_MANAGE);
    const existing = await database_1.prisma.subcategory.findUnique({ where: { categoryId_name: { categoryId, name } } });
    if (existing)
        throw new shared_1.DuplicateError(`Subcategory "${name}" already exists in this category.`);
    const subcategory = await database_1.prisma.subcategory.create({ data: { categoryId, name } });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "SUBCATEGORY", recordId: subcategory.id, newValue: subcategory });
    return subcategory;
}
async function deleteSubcategory(session, id) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CATEGORIES_MANAGE);
    const subcategory = await database_1.prisma.subcategory.findUnique({
        where: { id },
        include: { products: true },
    });
    if (!subcategory)
        throw new shared_1.NotFoundError("Subcategory not found.");
    if (subcategory.products.length > 0) {
        throw new shared_1.ValidationError("Cannot delete subcategory containing products.");
    }
    await database_1.prisma.subcategory.delete({ where: { id } });
    await (0, auditService_1.recordAuditLog)(session, { action: "DELETE", module: "SUBCATEGORY", recordId: id, previousValue: subcategory });
}
async function archiveSubcategory(session, id, isArchived = true) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CATEGORIES_MANAGE);
    const subcategory = await database_1.prisma.subcategory.update({ where: { id }, data: { isArchived } });
    await (0, auditService_1.recordAuditLog)(session, { action: isArchived ? "ARCHIVE" : "UNARCHIVE", module: "SUBCATEGORY", recordId: id });
    return subcategory;
}
// ---- Brands ---------------------------------------------------------------
async function listBrands(includeArchived = false) {
    return database_1.prisma.brand.findMany({ where: includeArchived ? {} : { isArchived: false }, orderBy: { name: "asc" } });
}
async function createBrand(session, name) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CATEGORIES_MANAGE);
    const existing = await database_1.prisma.brand.findUnique({ where: { name } });
    if (existing)
        throw new shared_1.DuplicateError(`Brand "${name}" already exists.`);
    const brand = await database_1.prisma.brand.create({ data: { name } });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "BRAND", recordId: brand.id, newValue: brand });
    return brand;
}
// ---- Units ------------------------------------------------------------------
async function listUnits(includeArchived = false) {
    return database_1.prisma.unit.findMany({ where: includeArchived ? {} : { isArchived: false }, orderBy: { name: "asc" } });
}
async function createUnit(session, name, abbreviation) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CATEGORIES_MANAGE);
    const existing = await database_1.prisma.unit.findUnique({ where: { name } });
    if (existing)
        throw new shared_1.DuplicateError(`Unit "${name}" already exists.`);
    const unit = await database_1.prisma.unit.create({ data: { name, abbreviation } });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "UNIT", recordId: unit.id, newValue: unit });
    return unit;
}
