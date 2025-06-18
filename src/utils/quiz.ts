export type QuizQuestion = {
    type: string;
    question: string;
    options: string[];
    answer: number;
    hint?: string;
};

type QuizCallbacks = {
    onCorrect?: (question: QuizQuestion) => void;
    onIncorrect?: (question: QuizQuestion) => void;
    onHintUsed?: (question: QuizQuestion, hintsLeft: number) => void;
    onHintsDepleted?: () => void;
    onQuizEnd?: (success: boolean, correctCount: number) => void;
    onTimePenalty?: (seconds: number) => void;
};

export class Quiz {
    private questions: QuizQuestion[] = [];
    private language: string = 'cs';
    private correctCount: number = 0;
    private totalHintsLeft: number = 2;
    private callbacks: QuizCallbacks = {};
    private currentQuestion: QuizQuestion | null = null;

    constructor(language: string = 'cs', callbacks?: QuizCallbacks) {
        this.language = language;
        if (callbacks) this.callbacks = callbacks;
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

    getHintsLeft(): number {
        return this.totalHintsLeft;
    }

    reset(): void {
        this.correctCount = 0;
        this.totalHintsLeft = 2;
    }

    answer(question: QuizQuestion, optionIndex: number): boolean {
        this.currentQuestion = question;
        const correct = optionIndex === question.answer;
        if (correct) {
            this.correctCount++;
            this.callbacks.onCorrect?.(question);
        } else {
            this.callbacks.onIncorrect?.(question);
        }
        return correct;
    }

    useHint(): boolean {
        if (this.totalHintsLeft > 0 && this.currentQuestion?.hint) {
            this.totalHintsLeft--;
            this.callbacks.onHintUsed?.(this.currentQuestion, this.totalHintsLeft);
            this.callbacks.onTimePenalty?.(10); // penalizace 10s
            if (this.totalHintsLeft === 0) {
                this.callbacks.onHintsDepleted?.();
            }
            return true;
        }
        return false;
    }

    isSuccess(): boolean {
        // Pevně: 8 a více správných odpovědí z 10
        return this.correctCount >= 8;
    }

    getCorrectCount(): number {
        return this.correctCount;
    }
}