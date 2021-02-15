import {mapUserToUsername, User, users} from "./User";

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
    private _host: string;

    /** The participants' IDs */
    private _participants: Array<string>;

    /** The Question Sets available */
    private readonly _questionSets: Record<string, unknown>;

    /** Zeitlimit pro Frage */
    private _timeLimit: number;

    private _currentResults: {
        correctSolution: string;
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
            answered: [],
            correctSolution: null
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
        this._currentResults = {
            question,
            results: {},
            sips: {},
            answered: [],
            correctSolution: null
        }
        return {
            question,
            timeLimit: this._timeLimit
        };
    }

    deliverToGameparticipants(title: string, data: unknown): void {
        const participants = this._participants;
        if (participants) {
            for (const participant of participants) {
                users.filter(user => user.id === participant)[0]?.socket.emit(title, data);
            }
        }
    }

    leaveGameAndCleanUp(id: string): void {
        this._participants = this._participants.filter(item => item !== id);
        if (this._host === id) {
            this._host = this._participants[0];
            User.getUser(this._host).socket.emit("newHost");
        }
        this.deliverToGameparticipants("participantsChanged", this._participants.map(mapUserToUsername));
        if (this._participants.length === 0) {
            delete games[this._id];
        }
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
                if (this._currentResults.results[username] !== "Noch nie") {
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
            this._currentResults.correctSolution = this._currentResults.question.solutions[correctSolution]
        }


        function setupCorrectSolutions() {
            const answers = {};
            // noinspection JSPotentiallyInvalidUsageOfClassThis
            for (const username of Object.keys(this._currentResults.results)) {
                // noinspection JSPotentiallyInvalidUsageOfClassThis
                if (this._currentResults.results[username]) {
                    // noinspection JSPotentiallyInvalidUsageOfClassThis
                    answers[this._currentResults.results[username]] = (answers[this._currentResults.results[username]] || 0) + 1;
                }
            }
            let highestCount = 0;
            for (const answer1 in answers) {
                if (answers[answer1] > highestCount) {
                    highestCount = answers[answer1];
                }
            }
            const correctSolution = [];
            for (const answer1 in answers) {
                if (answers[answer1] === highestCount) {
                    correctSolution.push(answer1);
                }
            }
            return correctSolution;
        }

        //Majority
        if (this._currentResults.question.type === "majority") {
            const correctSolution = setupCorrectSolutions.call(this);

            for (const username of Object.keys(this._currentResults.results)) {
                if (!correctSolution.includes(this._currentResults.results[username])) {
                    this._currentResults.sips[username] = Math.min(<number>(this._currentResults.question.sips || DEFAULT_SIPS), (this._maxSips || Number.MAX_SAFE_INTEGER));
                } else {
                    this._currentResults.sips[username] = 0;
                }
            }
            this._currentResults.correctSolution = correctSolution.join(", ");
        }

        //Participants Voting
        if (this._currentResults.question.type === "voting") {
            const correctSolution = setupCorrectSolutions.call(this);

            for (const username of Object.keys(this._currentResults.results)) {
                if (correctSolution.includes(username)) {
                    this._currentResults.sips[username] = Math.min(<number>(this._currentResults.question.sips || DEFAULT_SIPS), (this._maxSips || Number.MAX_SAFE_INTEGER));
                } else {
                    this._currentResults.sips[username] = 0;
                }
            }
            this._currentResults.correctSolution = correctSolution.join(", ");
        }

        //Number
        if (this._currentResults.question.type === "number") {
            const correctSolution: number = Number.parseInt(<string>this._currentResults.question["solution"]);
            const solutions = [];
            for (const username of Object.keys(this._currentResults.results)) {
                const answer = this._currentResults.results[username] ? Number.parseInt(this._currentResults.results[username]) : Number.MAX_SAFE_INTEGER;
                solutions.push({
                    answer,
                    user: username
                });
            }
            solutions.sort((a, b) => {
                return Math.abs(correctSolution - a.answer) - Math.abs(correctSolution - b.answer);
            })

            for (let i = 0; i < solutions.length; i++) {
                this._currentResults.sips[solutions[i].user] = Math.min(i, (this._maxSips || Number.MAX_SAFE_INTEGER));
            }
            this._currentResults.correctSolution = <string>this._currentResults.question["solution"]
        }


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

export const games: { [s: string]: Game; } = {};


