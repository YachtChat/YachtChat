import {Point} from "../model/model";
import {userProportion} from "../userSlice";

/**
 * For a given circle and a given array of circles, check if the circle is non overlapping
 * @param point: Point - center of the circle
 * @param arrayOfPoints: Point - array of circles centers
 */
export function isPostionValid(point: Point, arrayOfPoints: Point[]): boolean{
    let isValid: boolean = true;
    arrayOfPoints.forEach(otherPoint => {
        // given each circle has diameter of userProportion, check if the distance between the two points is less than
        // the sum of diameter
        // get the distance between the two points
        const distance = Math.sqrt(Math.pow(otherPoint.x - point.x, 2) + Math.pow(otherPoint.y - point.y, 2));

        // check if the distance is less than the diameter
        if(distance < userProportion){
            isValid = false;
        }
    })
    return isValid;
}

/**
 * Each point is the middle point of a circle. Given a point and a array of points this function returns the closest
 * valid point next to the given point
 * @param point: the point which the user submitted
 * @param arrayOfPoints: array of middlepoints of circles of the other users
 * @returns {Point}: the closest valid point next to the given point
 */
export function getNextValidPostion(point: Point, arrayOfPoints: Point[]): Point{
    // directions in which a valid point will be checked
    let lstOfDirections: Point[] = [
        {x: 1, y: 0}, // 0
        {x: 1/Math.sqrt(2), y: 1/Math.sqrt(2)}, // 1
        {x: 0, y: 1}, // 2
        {x: -1/Math.sqrt(2), y: 1/Math.sqrt(2)}, // 3
        {x: -1, y: 0}, // 4
        {x: -1/Math.sqrt(2), y: -1/Math.sqrt(2)}, // 5
        {x: 0, y: -1}, // 6
        {x: 1/Math.sqrt(2), y: -1/Math.sqrt(2)} // 7
    ];
    // compute the next valid point for each direction
    let lstOfPossiblePoints:Point[] = [];
    lstOfDirections.forEach(dir => {
        let p: Point = getBestPossiblePointForDirection(point, dir, arrayOfPoints)!;
        lstOfPossiblePoints.push({x:p.x, y: p.y})
    })
    // compute the distance for each point
    let lstOfDistances: number[] = [];
    lstOfPossiblePoints.forEach(p => {
        let distance = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
        lstOfDistances.push(distance);
    })
    // get the closest point and return it
    let minDistanceIndex: number = lstOfDistances.indexOf(Math.min(...lstOfDistances));
    return lstOfPossiblePoints[minDistanceIndex];
}

/**
 *  Given a point and a direction, this function returns the closest valid point next to the given point in the given direction
 * @param point: the point which the user submitted
 * @param direction: the direction in which the closest valid point will be checked
 * @param arrayOfPoints: array of middlepoints of circles of the other users
 * @returns {Point}: the closest valid point next to the given point
 */
function getBestPossiblePointForDirection(point: Point, direction: Point, arrayOfPoints: Point[]): Point{
    const STEPSIZE = userProportion / 25;
    const MAX_STEPS = 4;

    let factor: number = STEPSIZE;
    let updatePoint: Point = {x:point.x, y:point.y};

    while(true){
        if (factor < (STEPSIZE / MAX_STEPS) ) break;
        // add vector to point
        updatePoint.x += (direction.x * factor);
        updatePoint.y += (direction.y * factor);

        // check if the point is valid
        if (isPostionValid(updatePoint, arrayOfPoints)){
          factor /= 2;
          direction.x *= -1;
          direction.y *= -1;
        }
    }
    return updatePoint;
}
