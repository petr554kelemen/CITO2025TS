type QuizQuestion = {
    question: string;
    options: string[];
    answer: number; // index správné odpovědi
    hint?: string;  // volitelný hint
};

export class Quiz {
    private questions: QuizQuestion[] = [];
    private language: string = 'cs';

    constructor(language: string = 'cs') {
        this.language = language;
    }

    async loadQuestions(count: number) {
        let questionsData;
        try {
            questionsData = await import(`../../public/assets/locales/quiz-${this.language}.json`);
        } catch (e) {
            // Pokud jazykový soubor neexistuje, použij češtinu jako výchozí
            questionsData = await import(`../../public/assets/locales/quiz-cs.json`);
        }
        this.questions = this.shuffle(questionsData.default).slice(0, count);
    }

    getQuestion(index: number): QuizQuestion | null {
        return this.questions[index] || null;
    }

    get length(): number {
        return this.questions.length;
    }

    private shuffle(array: any[]) {
        return array
            .map((a) => [Math.random(), a] as [number, any])
            .sort((a, b) => a[0] - b[0])
            .map((a) => a[1]);
    }
}