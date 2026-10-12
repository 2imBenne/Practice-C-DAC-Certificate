import json
import random

random.seed(42)

jq = json.load(open('src/data/cdac_questions.json', encoding='utf-8'))
dq = json.load(open('src/data/cdac_dbms_questions.json', encoding='utf-8'))

with open('scratch_samples.txt', 'w', encoding='utf-8') as f:
    f.write('=== SAMPLE 5 JAVA QUESTIONS ===\n')
    for q in random.sample(jq, 5):
        f.write(f"ID {q['id']} (Module {q['moduleId']}): {q['questionText']}\n")
        f.write(f"Question Vi: {q.get('questionTextVi')}\n")
        f.write(f"Options Vi: {json.dumps(q.get('optionsVi'), ensure_ascii=False)}\n")
        f.write(f"Ans: {q['correctAnswer']} - {q['options'][q['correctAnswer']]}\n")
        f.write(f"Expl:\n{q['explanationVi']}\n")
        f.write("--------------------------------------------------\n")

    f.write('=== SAMPLE 5 DBMS QUESTIONS ===\n')
    for q in random.sample(dq, 5):
        f.write(f"ID {q['id']} (Module {q['moduleId']}): {q['questionText']}\n")
        f.write(f"Question Vi: {q.get('questionTextVi')}\n")
        f.write(f"Options Vi: {json.dumps(q.get('optionsVi'), ensure_ascii=False)}\n")
        f.write(f"Ans: {q['correctAnswer']} - {q['options'][q['correctAnswer']]}\n")
        f.write(f"Expl:\n{q['explanationVi']}\n")
        f.write("--------------------------------------------------\n")

print('Dumped samples to scratch_samples.txt')
