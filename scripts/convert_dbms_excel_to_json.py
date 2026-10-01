import os
import json
import zipfile
import re
import xml.etree.ElementTree as ET

EXCEL_FILE = r"d:\tmp\Java-CDAC\Ngan_Hang_Trac_Nghiem_DBMS_SQL.xlsx"
DATA_DIR_SRC = r"d:\tmp\Java-CDAC\src\data"
DATA_DIR_ROOT = r"d:\tmp\Java-CDAC\data"

os.makedirs(DATA_DIR_SRC, exist_ok=True)
os.makedirs(DATA_DIR_ROOT, exist_ok=True)

def parse_dbms_excel():
    with zipfile.ZipFile(EXCEL_FILE, 'r') as z:
        ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        
        # 1. Parse Sheet 1: Modules Metadata
        sheet1_xml = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        modules_meta = []
        for row in sheet1_xml.findall('.//main:row', ns):
            cells = {}
            for c in row.findall('main:c', ns):
                ref = ''.join([ch for ch in c.attrib.get('r', '') if ch.isalpha()])
                is_el = c.find('main:is', ns)
                v = c.find('main:v', ns)
                val = ""
                if is_el is not None:
                    val = "".join(t.text for t in is_el.findall('.//main:t', ns) if t.text)
                elif v is not None and v.text:
                    val = v.text
                cells[ref] = val.strip()
            
            stt = cells.get('B', '')
            if stt.isdigit() and int(stt) in range(1, 14):
                mod_name = cells.get('C', '')
                count = int(cells.get('D', '20')) if cells.get('D', '').isdigit() else 20
                from_q = cells.get('E', '')
                to_q = cells.get('F', '')
                modules_meta.append({
                    "id": int(stt),
                    "code": f"DBMS-{int(stt):02d}",
                    "name": mod_name,
                    "questionCount": count,
                    "range": f"{from_q} - {to_q}"
                })
        
        print(f"Parsed {len(modules_meta)} DBMS modules from Sheet 1.")

        # 2. Parse Sheet 2: Questions Bank
        sheet2_xml = ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
        questions = []
        rows = sheet2_xml.findall('.//main:row', ns)
        
        for row in rows[1:]:
            cells = {}
            for c in row.findall('main:c', ns):
                ref = ''.join([ch for ch in c.attrib.get('r', '') if ch.isalpha()])
                is_el = c.find('main:is', ns)
                v = c.find('main:v', ns)
                val = ""
                if is_el is not None:
                    val = "".join(t.text for t in is_el.findall('.//main:t', ns) if t.text)
                elif v is not None and v.text:
                    val = v.text
                cells[ref] = val.strip()

            q_id_str = cells.get('A', '')
            if not q_id_str.isdigit():
                continue
            
            q_id = int(q_id_str)
            mod_title = cells.get('B', '')
            raw_content = cells.get('C', '')
            opt_a = cells.get('D', '')
            opt_b = cells.get('E', '')
            opt_c = cells.get('F', '')
            opt_d = cells.get('G', '')
            correct_ans = cells.get('H', '').upper().strip()
            correct_text = cells.get('I', '')
            note = cells.get('J', '')

            # Extract module id
            mod_match = re.search(r'Module\s+(\d+)', mod_title, re.IGNORECASE)
            mod_id = int(mod_match.group(1)) if mod_match else ((q_id - 1) // 20 + 1)

            # Detect SQL queries and code snippets
            has_code = False
            code_snippet = None
            question_text = raw_content

            sql_keywords = ['SELECT ', 'FROM ', 'WHERE ', 'CREATE TABLE', 'INSERT INTO', 
                            'UPDATE ', 'DELETE FROM', 'ALTER TABLE', 'GROUP BY', 'ORDER BY',
                            'HAVING ', 'JOIN ', 'UNION ', 'VARCHAR2', 'NUMBER(']

            lines = raw_content.split('\n')
            has_sql_indicators = any(any(kw in line.upper() for kw in sql_keywords) for line in lines)

            if has_sql_indicators and (len(lines) > 1 or any(kw in raw_content.upper() for kw in ['SELECT ', 'CREATE TABLE', 'Evaluate this', 'The Employee table'])):
                has_code = True
                
                # Check where question prompt starts or ends
                # Case 1: Prompt first, then query (e.g. "Evaluate this SQL statement:\nSELECT ...")
                # Case 2: Query / Schema first, then question prompt (e.g. "SELECT ...\nWhat is the output?")
                prompt_end_idx = -1
                for idx, line in enumerate(lines):
                    if any(line.strip().startswith(prefix) for prefix in ['SELECT ', 'CREATE ', 'INSERT ', 'ALTER ', 'The ']):
                        if idx > 0 and lines[0].strip().endswith(':'):
                            prompt_end_idx = idx
                            break

                if prompt_end_idx > 0:
                    question_text = '\n'.join(lines[:prompt_end_idx]).strip()
                    code_snippet = '\n'.join(lines[prompt_end_idx:]).strip()
                else:
                    # Look for question at the end
                    split_idx = -1
                    for idx in range(len(lines) - 1, -1, -1):
                        line = lines[idx].strip()
                        if line.endswith('?') or any(line.startswith(p) for p in ['What ', 'Which ', 'How ', 'Select ']):
                            split_idx = idx
                            break
                    if split_idx > 0:
                        code_snippet = '\n'.join(lines[:split_idx]).strip()
                        question_text = '\n'.join(lines[split_idx:]).strip()
                    else:
                        code_snippet = raw_content

            questions.append({
                "id": q_id,
                "subjectKey": "DBMS",
                "moduleId": mod_id,
                "moduleName": mod_title,
                "rawContent": raw_content,
                "questionText": question_text,
                "hasCode": has_code,
                "codeLanguage": "sql",
                "codeSnippet": code_snippet,
                "options": {
                    "A": opt_a,
                    "B": opt_b,
                    "C": opt_c,
                    "D": opt_d
                },
                "correctAnswer": correct_ans,
                "correctAnswerText": correct_text,
                "note": note
            })

        print(f"Parsed {len(questions)} questions from Sheet 2.")
        
        # Save to both src/data and data/
        for out_dir in [DATA_DIR_SRC, DATA_DIR_ROOT]:
            modules_file = os.path.join(out_dir, "dbms_modules_meta.json")
            with open(modules_file, 'w', encoding='utf-8') as f:
                json.dump(modules_meta, f, ensure_ascii=False, indent=2)
            print(f"Saved DBMS modules to {modules_file}")

            questions_file = os.path.join(out_dir, "cdac_dbms_questions.json")
            with open(questions_file, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)
            print(f"Saved DBMS questions to {questions_file}")

        return modules_meta, questions

if __name__ == "__main__":
    parse_dbms_excel()
