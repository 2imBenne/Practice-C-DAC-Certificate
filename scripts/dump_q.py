import json

jq = json.load(open('src/data/cdac_questions.json', encoding='utf-8'))
dq = json.load(open('src/data/cdac_dbms_questions.json', encoding='utf-8'))

with open('scratch_all_q.txt', 'w', encoding='utf-8') as f:
    f.write('=== JAVA ===\n')
    for q in jq:
        ans_k = q['correctAnswer']
        ans_v = q['options'].get(ans_k, '')
        f.write(str(q['id']) + '|M' + str(q['moduleId']) + '|' + q['questionText'].replace('\n', ' ') + '|' + ans_k + '|' + ans_v + '\n')
    f.write('=== DBMS ===\n')
    for q in dq:
        ans_k = q['correctAnswer']
        ans_v = q['options'].get(ans_k, '')
        f.write(str(q['id']) + '|M' + str(q['moduleId']) + '|' + q['questionText'].replace('\n', ' ') + '|' + ans_k + '|' + ans_v + '\n')
print('Dumped questions to scratch_all_q.txt')
