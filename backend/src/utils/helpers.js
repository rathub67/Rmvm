import { randomUUID } from 'node:crypto';

function newId(prefix) {
    return `${prefix}_${randomUUID()}`;
}

function texto(value) {
    return String(value || "")
        .trim()
        .replace(/\s+/g, " ");
}

const userFilter = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    lastLoginAt: true,
    loginCount: true
};

export { newId, texto, userFilter };
