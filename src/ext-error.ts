export class ExtError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ExtError";
    }
}