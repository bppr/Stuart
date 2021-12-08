/**
 * Returns true if the value is between the two positions on track, where
 * all values are modulo'd properly to deal with the track being a circuit.
 *
 * Examples:
 * - insideTrackRange(0.5, 0.4, 0.6) : true
 * - insideTrackRange(0.0, 0.9, 1.1) : true
 * - insideTrackRange(0.0, 0.9, 0.1) : true
 * - insideTrackRange(1.6, 0.7, 0.2) : false
 */
export function insideTrackRange(value: number, min: number, max: number): boolean {

    // modulo all values to get them between 0 and 1
    value -= Math.floor(value);
    min -= Math.floor(min);
    max -= Math.floor(max);

    // adjust min and max so that they're in the proper order
    if (max < min) {
        max += 1.0;
    }

    return (value >= min && value <= max) ||
        ((value + 1) >= min && (value + 1) <= max);
}