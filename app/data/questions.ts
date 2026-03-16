export type Question = {
  id: string;
  course: string;
  professor: string;
  text: string;
  status: 'Pending' | 'Answered' | 'Saved for next lecture' | 'Important' | 'Revision';
  votes: number;
  posted: string;
  anonymous: boolean;
  answer?: string;
  tags: string[];
};

export const sampleQuestions: Question[] = [
  { id: 'q1', course: 'Programming', professor: 'Dr. Hatem', text: 'How can we optimize nested loops for large datasets?', status: 'Pending', votes: 24, posted: '2m ago', anonymous: true, tags: ['Programming', 'Optimization'] },
  { id: 'q2', course: 'Mathematics', professor: 'Dr. Rana', text: 'Can you explain the intuition behind eigenvectors?', status: 'Answered', votes: 18, posted: '15m ago', anonymous: false, answer: 'Eigenvectors point in directions where linear transforms scale but not rotate...', tags: ['Mathematics', 'Linear Algebra'] },
  { id: 'q3', course: 'Physics', professor: 'Dr. Omar', text: 'Why does energy quantize in a particle in a box?', status: 'Revision', votes: 10, posted: '50m ago', anonymous: true, tags: ['Physics', 'Quantum Mechanics'] }
];
