import json
import sys

with open('src/data/cdac_questions.json', 'r', encoding='utf-8') as f:
    java_q = json.load(f)
with open('src/data/cdac_dbms_questions.json', 'r', encoding='utf-8') as f:
    dbms_q = json.load(f)

for fname, qs in [('JAVA', java_q), ('DBMS', dbms_q)]:
    count = 0
    for q in qs:
        t = q.get('questionTextVi', '').lower()
        opts = [v.lower() for v in q.get('optionsVi', {}).values()]
        all_text = t + " " + " ".join(opts)
        
        for bw in ['công khai', 'riêng tư', 'lớp học', 'chuỗi daemon', 'giao diện resultset', 'phương pháp nào sau đây']:
            if bw in all_text:
                sys.stdout.buffer.write(f"{fname} Q{q['id']}: matched '{bw}' in: {q.get('questionTextVi', '')[:80]}\n".encode('utf-8'))
                count += 1
                break
    print(f"{fname}: remaining occurrences = {count}")
