export class Game {
    /** Maximal amount of sips to be assigned for one question */
    private _maxSips: number;

    /** ID of the game */
    private readonly _id: string;

    /** The Questions for this game */
    private _questions: Array<Record<string, unknown>>;

    /** The ID of the game's host */
    private readonly _host: string;

    /** The participants' IDs */
    private _participants: Array<string>;

    /** The Question Sets available */
    private readonly _questionSets: Record<string, unknown>;

    /**
     * Creates a new Game
     * @param {string} id The ID of he new game
     * @param {string} host The ID of the host
     * @param {Array<Object>} questionSets The Question Sets available
     */
    constructor(id: string, host: string, questionSets: Record<string, unknown>) {
        this._id = id;
        this._host = host;
        this._participants = [host];
        this._questionSets = questionSets;
        this._maxSips = NaN;
    }

    get maxSips(): number {
        return this._maxSips;
    }
    set maxSips(value: number) {
        this._maxSips = value;
    }

    get id(): string {
        return this._id;
    }

    get questions(): Array<Record<string, unknown>> {
        return this._questions;
    }

    set questions(value: Array<Record<string, unknown>>) {
        this._questions = value;
    }
    get host(): string {
        return this._host;
    }

    get participants(): Array<string> {
        return this._participants;
    }
    set participants(value: Array<string>) {
        this._participants = value;
    }

    get questionSets(): Record<string, unknown> {
        return this._questionSets;
    }
}
