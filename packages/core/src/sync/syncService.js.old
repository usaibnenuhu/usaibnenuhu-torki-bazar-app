"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyncStatus = getSyncStatus;
exports.getPendingSyncCount = getPendingSyncCount;
exports.enqueueSync = enqueueSync;
exports.syncPendingChanges = syncPendingChanges;
const database_1 = require("@torki-bazar/database");
const neonClient_1 = require("@torki-bazar/database/dist/neonClient");
const BATCH_SIZE = 50;
async function getSyncStatus() {
    const [pending, failed, lastSynced] = await Promise.all([
        database_1.prisma.syncQueue.count({
            where: { syncStatus: "PENDING" },
        }),
        database_1.prisma.syncQueue.count({
            where: { syncStatus: "FAILED" },
        }),
        database_1.prisma.syncQueue.findFirst({
            where: {
                syncStatus: "SYNCED",
                syncedAt: { not: null },
            },
            orderBy: {
                syncedAt: "desc",
            },
            select: {
                syncedAt: true,
            },
        }),
    ]);
    return {
        pending,
        failed,
        lastSyncedAt: lastSynced?.syncedAt ?? null,
        isSyncing: false,
    };
}
async function getPendingSyncCount() {
    return database_1.prisma.syncQueue.count({
        where: {
            syncStatus: "PENDING",
        },
    });
}
async function enqueueSync(entityType, entityId, operationType, payload) {
    return database_1.prisma.syncQueue.create({
        data: {
            entityType,
            entityId,
            operationType,
            payload: JSON.stringify(payload),
            syncStatus: "PENDING",
        },
    });
}
/**
 * Upload pending local changes to Neon.
 *
 * IMPORTANT:
 * This first version intentionally handles the SyncQueue itself.
 * We will add entity-specific upserts after verifying the engine.
 */
async function syncPendingChanges() {
    const items = await database_1.prisma.syncQueue.findMany({
        where: {
            syncStatus: "PENDING",
        },
        orderBy: {
            createdAt: "asc",
        },
        take: BATCH_SIZE,
    });
    if (items.length === 0) {
        return {
            synced: 0,
            failed: 0,
            pending: 0,
        };
    }
    let synced = 0;
    let failed = 0;
    for (const item of items) {
        try {
            await database_1.prisma.syncQueue.update({
                where: {
                    id: item.id,
                },
                data: {
                    syncStatus: "SYNCING",
                },
            });
            /*
             * We have confirmed that Neon is reachable.
             *
             * For now we only test the cloud connection here.
             * We DO NOT write arbitrary local data into Neon yet.
             */
            await neonClient_1.neonPrisma.$queryRaw `
        SELECT 1 AS connected
      `;
            await database_1.prisma.syncQueue.update({
                where: {
                    id: item.id,
                },
                data: {
                    syncStatus: "SYNCED",
                    syncedAt: new Date(),
                    errorMessage: null,
                },
            });
            synced++;
        }
        catch (error) {
            failed++;
            await database_1.prisma.syncQueue.update({
                where: {
                    id: item.id,
                },
                data: {
                    syncStatus: "FAILED",
                    errorMessage: error instanceof Error
                        ? error.message
                        : String(error),
                },
            });
        }
    }
    const pending = await database_1.prisma.syncQueue.count({
        where: {
            syncStatus: "PENDING",
        },
    });
    return {
        synced,
        failed,
        pending,
    };
}
