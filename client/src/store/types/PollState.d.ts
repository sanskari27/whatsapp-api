export type PollState = {
    polls: { title: string; options: string[]; isMultiSelect: boolean }[];
    error: { pollIndex: number; message: string };
};
