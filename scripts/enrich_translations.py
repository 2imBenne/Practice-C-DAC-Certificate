import os
import json
import re
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

BASE_DIR = r"d:\tmp\Java-CDAC"
JAVA_JSON = os.path.join(BASE_DIR, "src", "data", "cdac_questions.json")
DBMS_JSON = os.path.join(BASE_DIR, "src", "data", "cdac_dbms_questions.json")
CACHE_FILE = os.path.join(BASE_DIR, "data", "translation_cache.json")

# 1. Load or initialize persistent translation cache
os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)
cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            cache = json.load(f)
        print(f"Loaded {len(cache)} cached translations.")
    except Exception as e:
        print(f"Cache load error: {e}")

# 2. Rule-based translation patterns for instantaneous offline accuracy
PATTERN_TRANSLATIONS = [
    (r"When is the (\w+) object, created in line (\d+), eligible for garbage collection\?",
     r"Khi nào đối tượng \1, được tạo ở dòng \2, đủ điều kiện để bộ gom rác (Garbage Collector) thu dọn?"),
    (r"When is the (\w+) object eligible for garbage collection\?",
     r"Khi nào đối tượng \1 đủ điều kiện để bộ gom rác (Garbage Collector) thu dọn?"),
    (r"Which of the [fF]ollowing is not the feature of Java\?",
     "Đặc điểm nào sau đây KHÔNG phải là tính năng của Java?"),
    (r"Which of the [fF]ollowing is not a feature of Java\?",
     "Đặc điểm nào sau đây KHÔNG phải là tính năng của Java?"),
    (r"Which of the following is not (.*)\?",
     r"Điều nào sau đây KHÔNG phải là \1?"),
    (r"Which of the following is (.*)\?",
     r"Điều nào sau đây là \1?"),
    (r"What is the output of the following (code|program)\?",
     r"Kết quả đầu ra (output) của đoạn mã sau là gì?"),
    (r"What will be the output of the following (code|program)\?",
     r"Đoạn mã sau sẽ cho kết quả đầu ra là gì?"),
    (r"What is the output of (.*)\?",
     r"Kết quả đầu ra của \1 là gì?"),
    (r"What will be the output of (.*)\?",
     r"Kết quả đầu ra của \1 sẽ là gì?"),
    (r"What is the result of (.*)\?",
     r"Kết quả của \1 là gì?"),
    (r"Which keyword is used to (.*)\?",
     r"Từ khóa nào được sử dụng để \1?"),
    (r"Which operator is used to (.*)\?",
     r"Toán tử nào được sử dụng để \1?"),
    (r"Which method is used to (.*)\?",
     r"Phương thức nào được sử dụng để \1?"),
    (r"Which clause is used to (.*)\?",
     r"Mệnh đề nào được sử dụng để \1?"),
    (r"Which statement is true regarding (.*)\?",
     r"Phát biểu nào sau đây là ĐÚNG liên quan đến \1?"),
    (r"Which statement is true (.*)\?",
     r"Phát biểu nào sau đây là ĐÚNG \1?"),
    (r"Which statement is false (.*)\?",
     r"Phát biểu nào sau đây là SAI \1?"),
    (r"How many objects are created (.*)\?",
     r"Có bao nhiêu đối tượng được tạo ra \1?"),
    (r"What is the default value of (.*)\?",
     r"Giá trị mặc định của \1 là gì?"),
    (r"Which normal form (.*)\?",
     r"Dạng chuẩn nào \1?"),
]

OPTION_MAP = {
    "None of the above": "Không có đáp án nào ở trên",
    "None of the above.": "Không có đáp án nào ở trên.",
    "None of these": "Không có đáp án nào trong các phương án trên",
    "All of the above": "Tất cả các phương án trên",
    "All of the above.": "Tất cả các phương án trên.",
    "All of the mentioned": "Tất cả các phương án được nêu",
    "All of these": "Tất cả các phương án trên",
    "Compilation fails": "Lỗi biên dịch (Compilation fails)",
    "Compilation fails.": "Lỗi biên dịch (Compilation fails).",
    "Compilation error": "Lỗi biên dịch (Compilation error)",
    "Compile error": "Lỗi biên dịch (Compile error)",
    "Runtime exception": "Phát sinh lỗi khi chạy (Runtime exception)",
    "An exception is thrown at runtime": "Ngoại lệ bị ném ra trong thời gian chạy (Runtime Exception)",
    "An exception is thrown": "Một ngoại lệ bị ném ra",
    "True": "Đúng (True)",
    "False": "Sai (False)",
    "true": "true (Đúng)",
    "false": "false (Sai)",
    "Not Robust.": "Không mạnh mẽ (Not Robust)",
    "Object Oriented.": "Hướng đối tượng (Object Oriented)",
    "Distributed.": "Phân tán (Distributed)",
    "Interpreted": "Thông dịch (Interpreted)",
    "0": "0",
    "1": "1",
    "null": "null",
}

def translate_option_fast(text):
    if not text:
        return ""
    text_clean = text.strip()
    if text_clean in OPTION_MAP:
        return OPTION_MAP[text_clean]
    
    # "just after line X" -> "Ngay sau dòng X"
    m = re.match(r"^(just\s+)?after\s+line\s+(\d+)$", text_clean, re.IGNORECASE)
    if m:
        return f"Ngay sau dòng {m.group(2)}"
    
    m2 = re.match(r"^at\s+line\s+(\d+)$", text_clean, re.IGNORECASE)
    if m2:
        return f"Tại dòng {m2.group(1)}"
        
    return None

def translate_via_mymemory(text):
    if not text or len(text.strip()) <= 1:
        return text
    clean = text.strip()
    if clean in cache:
        return cache[clean]
        
    url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(clean)}&langpair=en|vi&de=cdac_dev_exam@gmail.com"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=7) as response:
            res = json.loads(response.read().decode("utf-8"))
            if res.get("responseStatus") == 200:
                trans = res.get("responseData", {}).get("translatedText", "")
                if trans and not trans.startswith("MYMEMORY WARNING"):
                    cache[clean] = trans
                    return trans
    except Exception:
        pass
    return None

def translate_question_text(q_text):
    if not q_text:
        return ""
    q_clean = q_text.strip()
    
    # 1. Check cache
    if q_clean in cache:
        return cache[q_clean]
        
    # 2. Check regex patterns
    for pat, rep in PATTERN_TRANSLATIONS:
        m = re.search(pat, q_clean, re.IGNORECASE)
        if m:
            translated = re.sub(pat, rep, q_clean, flags=re.IGNORECASE)
            cache[q_clean] = translated
            return translated
            
    # 3. Try online
    online_res = translate_via_mymemory(q_clean)
    if online_res:
        return online_res
        
    return q_clean

def generate_explanation(q):
    """Generates rich, contextual technical Vietnamese explanation based on question and correct answer."""
    subject = q.get("subjectKey", "JAVA")
    mod_id = q.get("moduleId", 1)
    mod_name = q.get("moduleName", "")
    q_text = q.get("questionText", "")
    ans_key = q.get("correctAnswer", "A")
    ans_text = q.get("options", {}).get(ans_key, "")
    has_code = q.get("hasCode", False)
    code = q.get("codeSnippet", "")
    
    # Special detailed explanations for common topics
    if "garbage collection" in q_text.lower() or "eligible for garbage" in q_text.lower():
        return (
            f"🎯 Phân tích cơ chế Garbage Collection (Bộ thu gom rác) trong JVM:\n"
            f"- Trong Java, một đối tượng trên vùng nhớ Heap chỉ đủ điều kiện để GC thu dọn khi nó hoàn toàn 'Unreachable' (không còn bất kỳ biến tham chiếu còn sống nào trỏ tới nó).\n"
            f"- Tại {ans_text}: Các biến tham chiếu trỏ tới đối tượng này đều đã được gán về null (hoặc ra khỏi phạm vi hoạt động). Không còn tham chiếu hợp lệ nào tồn tại.\n"
            f"👉 Vì vậy, đáp án chính xác là: {ans_key} - {ans_text}."
        )

    if "feature of java" in q_text.lower():
        return (
            f"🎯 Phân tích đặc tính cốt lõi của Java:\n"
            f"- Java được thiết kế với các tiêu chí: Hướng đối tượng (Object-Oriented), Độc lập nền tảng (Platform Independent qua Bytecode & JVM), Phân tán (Distributed - hỗ trợ RMI/Socket), An toàn (Secure), và Mạnh mẽ (Robust - quản lý bộ nhớ tự động, kiểm tra kiểu nghiêm ngặt và cơ chế Exception).\n"
            f"- '{ans_text}' là một phát biểu trái ngược với các nguyên lý trên.\n"
            f"👉 Đáp án đúng là: {ans_key}."
        )

    if "first web browser" in q_text.lower():
        return (
            f"🎯 Lịch sử phát triển Java:\n"
            f"- HotJava (tên mã ban đầu là WebRunner) là trình duyệt web đầu tiên được viết bằng ngôn ngữ Java bởi Sun Microsystems vào năm 1995, minh họa khả năng chạy các đoạn mã Applet tương tác động trên nền Web.\n"
            f"👉 Đáp án đúng: {ans_key} - {ans_text}."
        )

    if "default value" in q_text.lower():
        return (
            f"🎯 Giá trị mặc định của biến trường (Field/Instance variable) trong Java:\n"
            f"- Biến kiểu số (byte, short, int, long): mặc định là 0.\n"
            f"- Biến kiểu thực (float, double): mặc định là 0.0.\n"
            f"- Biến boolean: mặc định luôn là false.\n"
            f"- Biến tham chiếu đối tượng (Object, String, mảng): mặc định là null.\n"
            f"👉 Đáp án đúng là: {ans_key} - {ans_text}."
        )

    if "compilation fails" in ans_text.lower() or "compile error" in ans_text.lower():
        return (
            f"🎯 Phân tích lỗi biên dịch (Compilation Error):\n"
            f"- Đoạn mã vi phạm quy tắc cú pháp hoặc ràng buộc kiểu của trình biên dịch javac.\n"
            f"- Các lỗi thường gặp: sai phạm vi truy cập (access specifier), ép kiểu không hợp lệ (downcasting sai), biến local chưa khởi tạo hoặc phương thức trừu tượng chưa được override.\n"
            f"👉 Đáp án chính xác: {ans_key} - {ans_text}."
        )

    if subject == "JAVA":
        if mod_id in [1, 2]: # Intro & OOP
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Nguyên lý OOP cốt lõi: Tính đóng gói (Encapsulation), Tính kế thừa (Inheritance), Tính đa hình (Polymorphism) và Tính trừu tượng (Abstraction). Hãy chú ý cách khai báo hàm khởi tạo (constructor), từ khóa static, và phân biệt biến cục bộ (local variable) với biến thể hiện (instance variable)."
            )
        elif mod_id == 3: # Access Control & Interfaces
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Cấp độ truy cập trong Java: private (chỉ trong class) < default/package-private (cùng package) < protected (cùng package + lớp con khác package) < public (toàn bộ dự án). Một interface chỉ chứa các hằng số (public static final) và các phương thức public abstract (hoặc default/static từ Java 8)."
            )
        elif mod_id == 4: # Memory & Keywords
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Phân biệt vùng nhớ JVM: Stack lưu trữ các khung gọi hàm (stack frames) và biến nguyên thủy cục bộ; Heap lưu trữ tất cả đối tượng (Objects). Từ khóa `final` ngăn chặn sửa đổi giá trị (biến), ghi đè (phương thức) hoặc kế thừa (lớp)."
            )
        elif mod_id == 5: # Collections
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Collections Framework: List (cho phép phần tử trùng lặp và duy trì thứ tự chèn), Set (không cho phép phần tử trùng lặp - HashSet không thứ tự, TreeSet sắp xếp tự nhiên), Map (lưu cặp Key-Value, Key là duy nhất). Vector và Hashtable là thread-safe (đồng bộ) còn ArrayList và HashMap thì không."
            )
        elif mod_id == 6: # Exception Handling
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Cây phả hệ Throwable gồm Exception và Error. Checked Exception (kế thừa từ Exception trực tiếp, trừ RuntimeException) bắt buộc phải try-catch hoặc khai báo throws. Khối `finally` luôn luôn thực thi trừ khi gọi `System.exit(0)`."
            )
        elif mod_id == 7: # Multithreading
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Luồng (Thread): Có thể tạo thread bằng cách kế thừa `Thread` hoặc triển khai `Runnable`. Từ khóa `synchronized` đảm bảo chỉ một thread được truy cập vào tài nguyên dùng chung tại một thời điểm (Mutual Exclusion)."
            )
        elif mod_id == 8: # Java I/O
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- I/O Streams: Byte Streams (InputStream/OutputStream) xử lý dữ liệu nhị phân 8-bit; Character Streams (Reader/Writer) xử lý ký tự Unicode 16-bit. Sử dụng BufferedReader/BufferedWriter để tối ưu hiệu năng bộ đệm."
            )
        elif mod_id == 10: # JDBC
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Quy trình JDBC chuẩn: 1. Nạp Driver (Class.forName) -> 2. Mở Connection (DriverManager.getConnection) -> 3. Tạo Statement/PreparedStatement -> 4. Thực thi câu lệnh (executeQuery/executeUpdate) -> 5. Xử lý ResultSet -> 6. Đóng tài nguyên."
            )
        else:
            return (
                f"🎯 Trọng tâm câu hỏi chuyên đề {mod_name}:\n"
                f"- Phương án chính xác: {ans_key} ({ans_text}).\n"
                f"- Ghi nhớ quy tắc cú pháp và quy chuẩn vận hành của Java Core để áp dụng chính xác trong kỳ thi CDAC."
            )

    else: # DBMS & SQL
        if mod_id in [1, 2]: # DBMS Intro & SQL Intro
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- DBMS cung cấp tính độc lập dữ liệu (Logical & Physical Data Independence). SQL là ngôn ngữ phi thủ tục (non-procedural/declarative), phân loại thành DDL, DML, DCL, TCL."
            )
        elif mod_id == 3: # DDL
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Các lệnh DDL (CREATE, ALTER, DROP, TRUNCATE, RENAME) tác động lên cấu trúc (schema) bảng. Lệnh TRUNCATE xóa toàn bộ dữ liệu nhanh hơn DELETE và ngầm định COMMIT (không thể ROLLBACK trong chuẩn SQL)."
            )
        elif mod_id == 4: # Constraints
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Ràng buộc toàn vẹn: PRIMARY KEY (duy nhất và NOT NULL), FOREIGN KEY (toàn vẹn tham chiếu - trỏ tới Primary/Unique key bảng cha), UNIQUE (cho phép 1 hoặc nhiều NULL tùy DBMS), CHECK (kiểm tra biểu thức logic điều kiện)."
            )
        elif mod_id == 5: # DML & Transactions
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Lệnh DML (INSERT, UPDATE, DELETE) thao tác trên dữ liệu hàng. Giao dịch tuân thủ tính chất ACID (Atomicity - Nguyên tử, Consistency - Nhất quán, Isolation - Cô lập, Durability - Bền vững). Sử dụng COMMIT để lưu vĩnh viễn, ROLLBACK để hoàn tác."
            )
        elif mod_id in [6, 7]: # Single Row & Group Functions
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Hàm nhóm (Aggregate Functions: COUNT, SUM, AVG, MIN, MAX) bỏ qua giá trị NULL (ngoại trừ COUNT(*)). Mệnh đề WHERE lọc từng bản ghi trước khi nhóm, còn HAVING lọc các nhóm sau khi GROUP BY."
            )
        elif mod_id == 8: # SQL Joins
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Phép kết (Joins): INNER JOIN trả về các hàng khớp ở cả 2 bảng; LEFT JOIN giữ lại toàn bộ bảng bên trái và điền NULL cho bên phải không khớp; FULL JOIN giữ lại toàn bộ dữ liệu cả 2 bảng; CROSS JOIN tạo tích Descartes (m x n hàng)."
            )
        elif mod_id in [9, 10]: # Subqueries
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Subquery (truy vấn con): Độc lập (Non-correlated) thực thi 1 lần trước; Tương quan (Correlated subquery) thực thi lặp lại cho từng hàng của truy vấn ngoài. Các toán tử so sánh nhiều dòng: IN, ANY, ALL, EXISTS."
            )
        elif mod_id == 11: # Views
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- View là một bảng ảo (virtual table) được định nghĩa từ câu lệnh SELECT, không lưu trữ dữ liệu thực tế (trừ Materialized View). View giúp bảo mật và đơn giản hóa truy vấn phức tạp."
            )
        elif mod_id == 12: # Set Operators
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Toán tử tập hợp: UNION (gộp và loại bỏ trùng lặp), UNION ALL (gộp và giữ nguyên trùng lặp, chạy nhanh hơn), INTERSECT (lấy phần giao chung), MINUS/EXCEPT (lấy phần có ở tập 1 nhưng không có ở tập 2)."
            )
        elif mod_id == 13: # Normalization
            return (
                f"🎯 Trọng tâm chuyên đề {mod_name}:\n"
                f"- Đáp án đúng: {ans_key} - {ans_text}.\n"
                f"- Chuẩn hóa CSDL: 1NF (giá trị nguyên tố, không có thuộc tính đa trị), 2NF (thỏa 1NF và loại bỏ phụ thuộc một phần vào khóa chính), 3NF (thỏa 2NF và loại bỏ phụ thuộc bắc cầu - transitive dependency), BCNF (mọi định thức determinant đều là candidate key)."
            )
        else:
            return (
                f"🎯 Trọng tâm câu hỏi chuyên đề {mod_name}:\n"
                f"- Phương án chính xác: {ans_key} ({ans_text}).\n"
                f"- Nắm vững các chuẩn SQL ANSI và nguyên lý quản trị cơ sở dữ liệu quan hệ để xử lý chính xác đề thi CDAC."
            )

def process_file(json_path):
    print(f"\nProcessing {json_path}...")
    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    # Gather texts needing translation
    to_translate_online = []
    for q in questions:
        q_text = q.get("questionText", "").strip()
        if q_text and q_text not in cache:
            # Check if handled by regex
            matched = False
            for pat, rep in PATTERN_TRANSLATIONS:
                if re.search(pat, q_text, re.IGNORECASE):
                    cache[q_text] = re.sub(pat, rep, q_text, flags=re.IGNORECASE)
                    matched = True
                    break
            if not matched:
                to_translate_online.append(q_text)

    print(f"Total questions: {len(questions)}. Remaining online candidates: {len(to_translate_online)}")

    # Translate batch in parallel
    if to_translate_online:
        print(f"Translating {len(to_translate_online)} items via pool...")
        with ThreadPoolExecutor(max_workers=6) as ex:
            ex.map(translate_via_mymemory, to_translate_online[:120]) # translate up to 120 in this batch

    # Now enrich each question
    enriched_count = 0
    for q in questions:
        # Question VI
        q_vi = translate_question_text(q.get("questionText", ""))
        q["questionTextVi"] = q_vi

        # Options VI
        opts = q.get("options", {})
        opts_vi = {}
        for k in ["A", "B", "C", "D"]:
            orig_opt = opts.get(k, "")
            fast_opt = translate_option_fast(orig_opt)
            if fast_opt:
                opts_vi[k] = fast_opt
            elif orig_opt in cache:
                opts_vi[k] = cache[orig_opt]
            else:
                opts_vi[k] = orig_opt
        q["optionsVi"] = opts_vi

        # Explanation VI
        q["explanationVi"] = generate_explanation(q)
        enriched_count += 1

    # Save back to file
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    # Also save to root data/ folder if exists
    root_data_copy = os.path.join(BASE_DIR, "data", os.path.basename(json_path))
    with open(root_data_copy, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"Successfully enriched and saved {enriched_count} questions in {json_path} and {root_data_copy}.")

# Run on both Java and DBMS
process_file(JAVA_JSON)
process_file(DBMS_JSON)

# Save cache
with open(CACHE_FILE, "w", encoding="utf-8") as f:
    json.dump(cache, f, ensure_ascii=False, indent=2)
print(f"Cache saved with {len(cache)} entries.")
