import rawJavaQuestions from '../data/cdac_questions.json';
import rawJavaModules from '../data/modules_meta.json';
import rawDbmsQuestions from '../data/cdac_dbms_questions.json';
import rawDbmsModules from '../data/dbms_modules_meta.json';
import type { ModuleMeta, QuestionItem, SubjectKey, SubjectMeta } from '../types/quiz';

const javaQuestions: QuestionItem[] = rawJavaQuestions as QuestionItem[];
const javaModules: ModuleMeta[] = rawJavaModules as ModuleMeta[];

const dbmsQuestions: QuestionItem[] = rawDbmsQuestions as QuestionItem[];
const dbmsModules: ModuleMeta[] = rawDbmsModules as ModuleMeta[];

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'JAVA',
    name: 'Java Core Certification Review',
    shortName: 'Java Core',
    badge: '16 Chuyên Đề • 320 Câu',
    icon: '☕',
    description: 'Toàn bộ câu hỏi lập trình hướng đối tượng, JVM memory, Collections Framework, Multithreading, Exception và JDBC.',
    totalQuestions: 320,
    totalModules: 16,
    accentColor: '#6366f1',
    tags: ['OOP & Polymorphism', 'Collections Framework', 'Multithreading & Deadlock', 'Exception Hierarchy', 'JDBC'],
  },
  {
    id: 'DBMS',
    name: 'DBMS & SQL Certification Review',
    shortName: 'DBMS & SQL',
    badge: '13 Chuyên Đề • 260 Câu',
    icon: '🗄️',
    description: 'Ngân hàng câu hỏi cơ sở dữ liệu quan hệ, DDL, Constraints, DML, SQL Joins, Subqueries, Views và Chuẩn hóa (1NF - BCNF).',
    totalQuestions: 260,
    totalModules: 13,
    accentColor: '#06b6d4',
    tags: ['DDL & Constraints', 'DML & Transactions', 'SQL Joins & Outer Joins', 'Correlated Subqueries', '3NF & BCNF'],
  },
];

export class QuizDataService {
  static getSubjects(): SubjectMeta[] {
    return SUBJECTS;
  }

  static getSubjectMeta(subject: SubjectKey): SubjectMeta {
    return SUBJECTS.find(s => s.id === subject) || SUBJECTS[0];
  }

  static getAllQuestions(subject: SubjectKey): QuestionItem[] {
    return subject === 'JAVA' ? javaQuestions : dbmsQuestions;
  }

  static getAllModules(subject: SubjectKey): ModuleMeta[] {
    return subject === 'JAVA' ? javaModules : dbmsModules;
  }

  static getQuestionById(subject: SubjectKey, id: number): QuestionItem | undefined {
    const list = this.getAllQuestions(subject);
    return list.find(q => q.id === id);
  }

  static getQuestionsByModule(subject: SubjectKey, moduleId: number): QuestionItem[] {
    const list = this.getAllQuestions(subject);
    return list.filter(q => q.moduleId === moduleId);
  }

  static getQuestionsByIds(subject: SubjectKey, ids: number[]): QuestionItem[] {
    const list = this.getAllQuestions(subject);
    const map = new Map(list.map(q => [q.id, q]));
    return ids.map(id => map.get(id)).filter((q): q is QuestionItem => q !== undefined);
  }

  static getRandomQuestions(subject: SubjectKey, count: number, moduleId?: number): QuestionItem[] {
    const pool = moduleId ? this.getQuestionsByModule(subject, moduleId) : [...this.getAllQuestions(subject)];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(count, pool.length));
  }
}
