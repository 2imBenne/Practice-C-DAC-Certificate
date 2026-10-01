import os
import json
import zipfile
import re
import xml.etree.ElementTree as ET

EXCEL_FILE = r"d:\tmp\Java-CDAC\Ngan_Hang_Trac_Nghiem_Java_Core.xlsx"
OUTPUT_DIR = r"d:\tmp\Java-CDAC\data"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def parse_excel():
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
            
            # Module rows start with STT 1..16 in Col B
            stt = cells.get('B', '')
            if stt.isdigit() and int(stt) in range(1, 17):
                mod_name = cells.get('C', '')
                count = int(cells.get('D', '20')) if cells.get('D', '').isdigit() else 20
                from_q = cells.get('E', '')
                to_q = cells.get('F', '')
                modules_meta.append({
                    "id": int(stt),
                    "code": f"MOD-{int(stt):02d}",
                    "name": mod_name,
                    "questionCount": count,
                    "range": f"{from_q} - {to_q}"
                })
        
        print(f"Parsed {len(modules_meta)} modules from Sheet 1.")

        # 2. Parse Sheet 2: Questions Bank
        sheet2_xml = ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
        questions = []
        rows = sheet2_xml.findall('.//main:row', ns)
        
        for row in rows[1:]: # Skip header row
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

            # Extract module number from mod_title (e.g. "Module 1: Introduction to Java" -> 1)
            mod_match = re.search(r'Module\s+(\d+)', mod_title, re.IGNORECASE)
            mod_id = int(mod_match.group(1)) if mod_match else ((q_id - 1) // 20 + 1)

            # Code and Question Text separation logic
            has_code = False
            code_snippet = None
            question_text = raw_content

            # Detect Java code patterns:
            # - public class, class X, void main, int x =, try {, System.out
            # - multi-line with brackets / semicolons
            lines = raw_content.split('\n')
            
            # Check if there is a distinct code block
            code_indicators = ['class ', 'public ', 'void ', 'int ', 'boolean ', 'String ', 'float ', 'double ',
                               'import ', 'package ', 'try {', 'catch', 'finally', 'interface ', 'static ',
                               'System.out.', '{', '}', ';']
            
            # Common patterns:
            # Pattern A: Code at the beginning, question at the end (e.g., class Foo { ... }\nWhat is the output?)
            # Pattern B: Question at the beginning, code in the middle/end (e.g., What is the output of the following?\nclass Foo { ... })
            # Pattern C: Options or code mixed
            
            code_lines = []
            text_lines = []
            is_collecting_code = False
            
            # Let's inspect if any line contains clear code signals
            has_code_signals = any(any(ind in line for ind in ['public class', 'class ', 'void main', 'System.out.println', 'try {', 'Runnable ', 'Thread ']) for line in lines)
            
            if has_code_signals:
                has_code = True
                # Identify transition
                # Let's see if the first line is question or code
                first_line = lines[0].strip()
                if any(first_line.startswith(q_prefix) for q_prefix in ['What ', 'Which ', 'How ', 'Given: ', 'Consider ']):
                    # Question first
                    # Look for where code starts
                    split_idx = -1
                    for idx, line in enumerate(lines):
                        if any(ind in line for ind in ['class ', 'public class', 'public static void', 'interface ', 'int ', 'try {']):
                            split_idx = idx
                            break
                    if split_idx > 0:
                        question_text = '\n'.join(lines[:split_idx]).strip()
                        code_snippet = '\n'.join(lines[split_idx:]).strip()
                    else:
                        code_snippet = raw_content
                else:
                    # Code first, question prompt at the end
                    split_idx = -1
                    for idx in range(len(lines) - 1, -1, -1):
                        line = lines[idx].strip()
                        if line.endswith('?') or any(line.startswith(p) for p in ['What ', 'Which ', 'When ', 'Where ', 'Select ']):
                            split_idx = idx
                            break
                    if split_idx > 0:
                        code_snippet = '\n'.join(lines[:split_idx]).strip()
                        question_text = '\n'.join(lines[split_idx:]).strip()
                    else:
                        code_snippet = raw_content
            
            questions.append({
                "id": q_id,
                "moduleId": mod_id,
                "moduleName": mod_title,
                "rawContent": raw_content,
                "questionText": question_text,
                "hasCode": has_code,
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
        
        # Save to JSON
        modules_file = os.path.join(OUTPUT_DIR, "modules_meta.json")
        with open(modules_file, 'w', encoding='utf-8') as f:
            json.dump(modules_meta, f, ensure_ascii=False, indent=2)
        print(f"Saved modules metadata to {modules_file}")

        questions_file = os.path.join(OUTPUT_DIR, "cdac_questions.json")
        with open(questions_file, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"Saved questions bank to {questions_file}")

        return modules_meta, questions

if __name__ == "__main__":
    parse_excel()
