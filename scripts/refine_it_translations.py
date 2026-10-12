import os
import json
import re

BASE_DIR = r"d:\tmp\Java-CDAC"
JAVA_SRC = os.path.join(BASE_DIR, "src", "data", "cdac_questions.json")
JAVA_ROOT = os.path.join(BASE_DIR, "data", "cdac_questions.json")
DBMS_SRC = os.path.join(BASE_DIR, "src", "data", "cdac_dbms_questions.json")
DBMS_ROOT = os.path.join(BASE_DIR, "data", "cdac_dbms_questions.json")

def refine_text(text, en_text=""):
    if not text:
        return text

    t = text

    # Specific bad translations cleanup
    specific_fixes = [
        (r"_________________lớp học thực hiện các ổ cắm máy khách\.?", "_________________ class thực thi client socket?"),
        (r"các ổ cắm máy khách", "client socket"),
        (r"ổ cắm máy khách", "client socket"),
        (r"ổ cắm máy chủ", "server socket"),
        (r"ổ cắm", "Socket"),
        (r"Phương pháp nào sau đây", "Phương thức (method) nào sau đây"),
        (r"phương pháp nào sau đây", "phương thức (method) nào sau đây"),
        (r"Phương pháp nào", "Phương thức (method) nào"),
        (r"phương pháp nào", "phương thức (method) nào"),
        (r"phương pháp", "phương thức (method)"),
        (r"Phương pháp", "Phương thức (method)"),
        (r"lớp học", "class"),
        (r"Lớp học", "Class"),
        (r"lớp công khai", "public class"),
        (r"giao diện công khai", "public interface"),
        (r"công khai", "public"),
        (r"riêng tư", "private"),
        (r"chuỗi daemon", "daemon thread"),
        (r"đánh dấu chuỗi hiện tại", "đánh dấu thread hiện tại"),
        (r"giao diện người nghe", "Listener interface"),
        (r"Giao diện người nghe", "Listener interface"),
        (r"chế độ xem không thể sửa đổi", "unmodifiable view"),
        (r"chế độ xem", "View"),
        (r"Chế độ xem", "View"),
    ]

    for pat, rep in specific_fixes:
        t = re.sub(pat, rep, t, flags=re.IGNORECASE)

    # Clean double suffixes
    t = re.sub(r"phương thức \(method\) \(method\)", "phương thức (method)", t)
    t = re.sub(r"Phương thức \(method\) \(method\)", "Phương thức (method)", t)
    t = re.sub(r"class \(class\)", "class", t)
    t = re.sub(r"Class \(Class\)", "Class", t)

    # If original EN has exact syntax code
    if en_text:
        m_syntax = re.search(r"(public\s+class\s+\w+\s+extends\s+[_\w]+)", en_text)
        if m_syntax:
            code_part = m_syntax.group(1)
            t = re.sub(r"(?:lớp\s+công\s+khai|public\s+class)\s+\w+\s+(?:mở\s+rộng|extends)\s+[_\w]+", code_part, t)

    return t

def clean_file(src, root):
    with open(src, "r", encoding="utf-8") as f:
        questions = json.load(f)

    for q in questions:
        en = q.get("questionText", "")
        vi = q.get("questionTextVi", "")
        q["questionTextVi"] = refine_text(vi, en)

        # Options
        opts_vi = q.get("optionsVi", {})
        opts_en = q.get("options", {})
        for k in ["A", "B", "C", "D"]:
            o_vi = opts_vi.get(k, "")
            o_en = opts_en.get(k, "")
            opts_vi[k] = refine_text(o_vi, o_en)
        q["optionsVi"] = opts_vi

        # Explanation
        if "explanationVi" in q:
            q["explanationVi"] = refine_text(q["explanationVi"])

    with open(src, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    with open(root, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

clean_file(JAVA_SRC, JAVA_ROOT)
clean_file(DBMS_SRC, DBMS_ROOT)
print("Finished deep refinement.")
