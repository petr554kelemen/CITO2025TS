type QuizQuestion = {
    type: string;
    question: string;
    options: string[];
    answer: number;
    hint?: string;
};

export class Quiz {
    private questions: QuizQuestion[] = [];
    private language: string = 'cs';

    constructor(language: string = 'cs') {
        this.language = language;
    }

    async loadQuestions() {
        let questionsArray = [];
        try {
            const res = await fetch(`assets/locales/quiz-${this.language}.json`);
            questionsArray = await res.json();
        } catch (e) {
            const res = await fetch('assets/locales/quiz-cs.json');
            questionsArray = await res.json();
        }
        if (!Array.isArray(questionsArray) || !questionsArray.length) {
            throw new Error("Quiz: Nenalezeny žádné otázky!");
        }
        this.questions = questionsArray;
    }

    getQuestionForType(type: string): QuizQuestion | null {
        return this.questions.find(q => q.type === type) || null;
    }
}