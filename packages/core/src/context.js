"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertPermission = assertPermission;
const shared_1 = require("@torki-bazar/shared");
function assertPermission(session, permission) {
    if (!session.permissions.includes(permission)) {
        throw new shared_1.UnauthorizedError(`Your role (${session.roleName}) does not have permission to perform this action.`);
    }
}
