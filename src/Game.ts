/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

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

    /** Zeitlimit pro Frage */
    private _timeLimit: number;

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
        this._questions = [];
    }

    startGame(
        settings: {
            '#/properties/maxSips': string | unknown,
            '#/properties/zeitlimit': string,
            '#/properties/kategorien': Array<string>
        }): Record<string, unknown> {
        console.log(settings);
        if (typeof settings['#/properties/maxSips'] === "string") {
            this._maxSips = Number.parseInt(settings['#/properties/maxSips']);
        }
        this._timeLimit = Number.parseInt(settings['#/properties/zeitlimit'])
        const kategorien: Array<string> = settings['#/properties/kategorien'];
        for (const string of kategorien) {
            const q = this._questionSets[string]["questions"];
            for (const question of q) {
                this._questions.push(question);
            }
        }
        this._questions = shuffle(this._questions);
        return this.nextQuestion();
    }

    nextQuestion(): Record<string, unknown> {
        return {
            question:this._questions?.pop(),
            timeLimit: this._timeLimit
        };
    }


    get timeLimit(): number {
        return this._timeLimit;
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
