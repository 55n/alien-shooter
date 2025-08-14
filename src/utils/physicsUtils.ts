import * as Cannon from 'cannon-es';

export function getBodyHeight(body: Cannon.Body) {
    if (!body || !body.aabb) return 0;
    return body.aabb.upperBound.y - body.aabb.lowerBound.y;
}
