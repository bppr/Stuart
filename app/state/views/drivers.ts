/**
 * The "Drivers" view represents information about all the cars and drivers in the race, and includes information that updates infrequently, including:
 * 
 * Cars: (essentially, "teams")
 * - idx
 * - number
 * - class
 * - class color
 * - car model
 * - team name
 * - current driver ID (iracing customer ID)
 * - team incident count
 * - drivers
 *   - name
 *   - customer id
 *   - irating
 *   - license level and color
 *   - personal incident count 
 */

export type Flag = "Black" | "Meatball" | "Checkered" | "DQ";

export type Driver = {
    name: string,
    id: number,
}

export type Car = {
    id: number,
    number: string,
    driverId: number,
    drivers: Driver[],
    className: string,
    classColor: string,   // a hex color value in the form "#FFFFFF"
    flags: Flag[]
}