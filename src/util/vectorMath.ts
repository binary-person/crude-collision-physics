const TOLERANCE = 0.000000001;

export interface Point2D {
    x: number;
    y: number;
}

export interface Polar2D {
    magnitude: number;
    angle: number;
}

export interface LineEquation {
    a: number;
    b: number;
    c: number;
}

export interface CircleEquation {
    x: number;
    y: number;
    radius: number;
}

export function numberEquals(num1: number, num2: number): boolean {
    return Math.abs(num1 - num2) < TOLERANCE;
}

export function isZero(num: number): boolean {
    return Math.abs(num) < TOLERANCE;
}

export function add(pt1: Point2D, pt2: Point2D): Point2D {
    return { x: pt1.x + pt2.x, y: pt1.y + pt2.y };
}

export function dist(pt1: Point2D, pt2: Point2D): number {
    return Math.hypot(pt1.x - pt2.x, pt1.y - pt2.y);
}

export function pointToPolar(pt: Point2D): Polar2D {
    return { magnitude: Math.hypot(pt.x, pt.y), angle: Math.atan2(pt.y, pt.x) };
}

export function pointsToPolar(pt1: Point2D, pt2: Point2D): Polar2D {
    return { magnitude: dist(pt1, pt2), angle: Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) };
}

export function polarToPoint(polar: Polar2D): Point2D {
    return { x: polar.magnitude * Math.cos(polar.angle), y: polar.magnitude * Math.sin(polar.angle) };
}

export function rotateVector(pt: Point2D, angle: number): Point2D {
    const polar = pointToPolar(pt);
    polar.angle += angle;
    return polarToPoint(polar);
}

export function averagePoints(points: Point2D[]): Point2D {
    if (points.length === 0)
        throw new TypeError('length cannot be 0');
    let x = 0;
    let y = 0;
    for (const pt of points) {
        x += pt.x;
        y += pt.y;
    }
    return { x: x / points.length, y: y / points.length };
}

export function reversePointXY(pt: Point2D): Point2D {
    return { x: pt.y, y: pt.x };
}

export function reverseLineEquationXY(line: LineEquation): LineEquation {
    return { a: line.b, b: line.a, c: line.c };
}

export function reverseCircleEquationXY(circle: CircleEquation): CircleEquation {
    return { x: circle.y, y: circle.x, radius: circle.radius };
}

export function twoPointsLineEquation(pt1: Point2D, pt2: Point2D): LineEquation {
    const rise = pt2.y - pt1.y;
    const run = pt2.x - pt1.x;
    if (isZero(rise) && isZero(run)) {
        throw new TypeError('they are the same point');
    }
    if (isZero(run)) {
        return reverseLineEquationXY(twoPointsLineEquation(reversePointXY(pt1), reversePointXY(pt2)));
    }
    const m = rise / run;
    return { a: m, b: -1, c: (m * pt1.x) - pt1.y };
}

export function lineEquationSolveY(x: number, line: LineEquation): number {
    return (line.c - (line.a * x)) / line.b;
}

export function lineIntersection(l1: LineEquation, l2: LineEquation): Point2D {
    const denominator = (l1.a * l2.b) - (l2.a * l1.b);
    if (isZero(denominator)) {
        throw new TypeError('no solution');
    }
    const x = ((l1.c * l2.b) - (l2.c * l1.b)) / denominator;
    return {
        x,
        y: lineEquationSolveY(x, l1)
    };
}

export function sameSign(num1: number, num2: number): boolean {
    if (isZero(num1) || isZero(num2))
        return true;
    return num1 >= -TOLERANCE === num2 >= -TOLERANCE;
}

export function withinBoxBounds(pt: Point2D, pt1: Point2D, pt2: Point2D): boolean {
    const distX = pt1.x - pt.x;
    const distY = pt1.y - pt.y;
    const distX2 = pt1.x - pt2.x;
    const distY2 = pt1.y - pt2.y;
    return (sameSign(distX, distX2) && Math.abs(distX) <= Math.abs(distX2) + TOLERANCE)
        && (sameSign(distY, distY2) && Math.abs(distY) <= Math.abs(distY2) + TOLERANCE)
}

export function withinCircleBounds(pt: Point2D, circleCenter: Point2D, circleRadius: number): boolean {
    return dist(pt, circleCenter) <= circleRadius + TOLERANCE;
}

export function lineCircleIntersection(line: LineEquation, circle: CircleEquation): Point2D[] {
    if (isZero(line.a) && isZero(line.b)) {
        throw new TypeError('invalid line equation');
    }
    if (isZero(line.b)) {
        return lineCircleIntersection(reverseLineEquationXY(line), reverseCircleEquationXY(circle)).map(reversePointXY);
    }
    const m1 = -line.a / line.b;
    const b1 = line.c / line.b;
    const x1 = circle.x;
    const y1 = circle.y;
    const r = circle.radius;

    const a = 1 + Math.pow(m1, 2);
    const b = (-2 * x1) + (2 * m1 * b1) - (2 * m1 * y1);
    const c = Math.pow(x1, 2) + Math.pow(b1, 2) - (2 * b1 * y1) + Math.pow(y1, 2) - Math.pow(r, 2);

    const discriminant = Math.pow(b, 2) - (4 * a * c);
    if (discriminant < 0) {
        return [];
    } else {
        const xs1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const xs2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        return [{
            x: xs1,
            y: lineEquationSolveY(xs1, line)
        }, {
            x: xs2,
            y: lineEquationSolveY(xs2, line)
        }];
    }
}

/**
 * @param m1 - mass of object 1
 * @param vi1 - initial velocity of object 1
 * @param m2 - mass of object 2. If null, the solver assumes the mass is infinite
 * @param vi2 - initial velocity of object 2
 * @param cor - coefficient of restitution
 */
interface RestitutionCollisionCalculationOptions {
    m1: number;
    vi1: number;
    m2: number | null;
    vi2: number;
    cor: number;
}

/**
 * 
 * @param {RestitutionCollisionCalculationOptions} options
 * @returns final velocity of object 1
 */
export function restitutionCollisionVf1({ m1, vi1, m2, vi2, cor }: RestitutionCollisionCalculationOptions ): number {
    if (m2 === null) {
        return (cor * (vi2 - vi1)) + vi2;
    }
    return ((m2 * cor * (vi2 - vi1)) + (m1 * vi1) + (m2 * vi2)) / (m1 + m2);
}
