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

const DEFAULT_SIPS = 3;

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

    private readonly _currentResults: {
        question: Record<string, unknown>;
        results: Record<string, string>;
        sips: Record<string, number>;
        answered: Array<string>;
    }

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
        this._currentResults = {
            question: null,
            results: {},
            sips: {},
            answered: []
        }
    }

    startGame(
        settings: {
            '#/properties/maxSips': string | unknown,
            '#/properties/zeitlimit': string,
            '#/properties/kategorien': Array<string>
        }): Record<string, unknown> {
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
        const question = this._questions?.pop();
        this._currentResults.question = question;
        this._currentResults.results = {};
        this._currentResults.sips = {};
        return {
            question,
            timeLimit: this._timeLimit
        };
    }

    addAnswerAndReturnResults(answer: string, username: string, id: string): {
        question: Record<string, unknown>;
        results: Record<string, string>;
        sips: Record<string, number>;
    } | false {
        this._currentResults.results[username] = answer;
        this._currentResults.answered.push(id);

        for (const participant of this._participants) {
            if (!this._currentResults.answered.includes(participant)) {
                return false;
            }
        }

        //Auswertung
        if (this._currentResults.question.type === "neverHaveIever") {
            for (const username of Object.keys(this._currentResults.results)) {
                if (this._currentResults.results[username] === "Doch") {
                    this._currentResults.sips[username] = Math.min(<number>(this._currentResults.question.sips || DEFAULT_SIPS), (this._maxSips || Number.MAX_SAFE_INTEGER));
                } else {
                    this._currentResults.sips[username] = 0;
                }
            }
        }

        //MultipleChoice
        if (this._currentResults.question.type === "multipleChoice") {
            const correctSolution: number = <number>this._currentResults.question["correctSolution"];
            for (const username of Object.keys(this._currentResults.results)) {
                if (this._currentResults.results[username] !== this._currentResults.question.solutions[correctSolution]) {
                    this._currentResults.sips[username] = Math.min(<number>(this._currentResults.question.sips || DEFAULT_SIPS), (this._maxSips || Number.MAX_SAFE_INTEGER));
                } else {
                    this._currentResults.sips[username] = 0;
                }
            }
        }
        //@TODO

        return this._currentResults;


    }

    get timeLimit()
        :
        number {
        return this._timeLimit;
    }

    get maxSips()
        :
        number {
        return this._maxSips;
    }

    set maxSips(value
                    :
                    number
    ) {
        this._maxSips = value;
    }

    get id()
        :
        string {
        return this._id;
    }

    get questions()
        :
        Array<Record<string, unknown>> {
        return this._questions;
    }

    set questions(value
                      :
                      Array<Record<string, unknown>>
    ) {
        this._questions = value;
    }

    get host()
        :
        string {
        return this._host;
    }

    get participants()
        :
        Array<string> {
        return this._participants;
    }

    set participants(value
                         :
                         Array<string>
    ) {
        this._participants = value;
    }

    get questionSets()
        :
        Record<string, unknown> {
        return this._questionSets;
    }

}
