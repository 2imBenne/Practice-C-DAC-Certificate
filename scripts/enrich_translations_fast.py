import os
import json
import re

BASE_DIR = r"d:\tmp\Java-CDAC"
JAVA_SRC = os.path.join(BASE_DIR, "src", "data", "cdac_questions.json")
JAVA_ROOT = os.path.join(BASE_DIR, "data", "cdac_questions.json")
DBMS_SRC = os.path.join(BASE_DIR, "src", "data", "cdac_dbms_questions.json")
DBMS_ROOT = os.path.join(BASE_DIR, "data", "cdac_dbms_questions.json")

def translate_phrase(text):
    if not text:
        return ""
    t = text.strip()

    # Direct exact mappings
    exact_map = {
        "Which of the Following is not the feature of Java?": "Đặc điểm nào sau đây KHÔNG phải là tính năng của Java?",
        "which is the first web browser developed in Java?": "Trình duyệt web đầu tiên được phát triển bằng Java là trình duyệt nào?",
        "What is the default value of boolean variable in Java?": "Giá trị mặc định của biến kiểu boolean trong Java là gì?",
        "Which operator is used to create an object in Java?": "Toán tử nào được sử dụng để khởi tạo một đối tượng trong Java?",
        "Which of these is not a Java keyword?": "Từ nào sau đây KHÔNG phải là một từ khóa trong Java?",
        "Which package contains the Random class?": "Package nào chứa lớp Random?",
        "Which of the following is not a primitive data type in Java?": "Kiểu dữ liệu nào sau đây KHÔNG phải là kiểu nguyên thủy (primitive) trong Java?",
        "What is the size of int variable in Java?": "Kích thước của biến kiểu int trong Java là bao nhiêu bit/byte?",
        "Which of the following is used to handle exceptions in Java?": "Khối lệnh nào sau đây được dùng để xử lý ngoại lệ trong Java?",
        "Which collection class allows unique elements only?": "Lớp Collection nào chỉ cho phép lưu các phần tử duy nhất (không trùng lặp)?",
        "Which of the following creates a thread in Java?": "Cách nào sau đây dùng để tạo một luồng (Thread) trong Java?",
        "What is the return type of hashCode() method in Object class?": "Kiểu trả về của phương thức hashCode() trong lớp Object là gì?",
        "Which method is called when an object is garbage collected?": "Phương thức nào được gọi khi một đối tượng bị bộ thu gom rác dọn dẹp?",
        "Which of these cannot be declared static in Java?": "Thành phần nào sau đây không thể khai báo là static trong Java?",
        "What does ACID stand for in DBMS?": "Các chữ cái trong từ viết tắt ACID của DBMS đại diện cho các tính chất nào?",
        "Which of the following is a DDL command?": "Lệnh nào sau đây là lệnh thuộc nhóm DDL (Data Definition Language)?",
        "Which of the following is a DML command?": "Lệnh nào sau đây là lệnh thuộc nhóm DML (Data Manipulation Language)?",
        "Which constraint ensures uniqueness and does not allow NULL values?": "Ràng buộc nào đảm bảo tính duy nhất và không cho phép giá trị NULL?",
        "Which clause is used to filter records after GROUP BY?": "Mệnh đề nào được dùng để lọc dữ liệu sau khi đã nhóm (GROUP BY)?",
        "Which clause is used to filter records before grouping?": "Mệnh đề nào được dùng để lọc các bản ghi trước khi nhóm?",
        "What is a foreign key?": "Khóa ngoại (Foreign Key) là gì?",
        "Which join returns all rows from the left table and matched rows from the right table?": "Phép kết (Join) nào trả về toàn bộ các dòng từ bảng bên trái và các dòng khớp từ bảng bên phải?",
        "Which normal form eliminates partial dependency?": "Dạng chuẩn nào loại bỏ phụ thuộc hàm một phần (partial dependency)?",
        "Which normal form eliminates transitive dependency?": "Dạng chuẩn nào loại bỏ phụ thuộc hàm bắc cầu (transitive dependency)?",
    }
    if t in exact_map:
        return exact_map[t]

    # Regex patterns
    patterns = [
        # Garbage collection
        (r"When is the (\w+) object, created in line (\d+), eligible for garbage collection\?",
         r"Khi nào đối tượng \1, được tạo ở dòng \2, đủ điều kiện để bộ gom rác (Garbage Collector) thu dọn?"),
        (r"When is the (\w+) object eligible for garbage collection\?",
         r"Khi nào đối tượng \1 đủ điều kiện để bộ gom rác (Garbage Collector) thu dọn?"),
        
        # SQL statements evaluation
        (r"Evaluate the SQL statement:\s*(.*)", r"Đánh giá câu lệnh SQL sau: \1"),
        (r"Evaluate this SQL statement:\s*(.*)", r"Đánh giá câu lệnh SQL sau: \1"),
        
        # Which of the following is not...
        (r"Which of the following is not true regarding (.*)\?", r"Điều nào sau đây KHÔNG đúng liên quan đến \1?"),
        (r"Which of the following is not true about (.*)\?", r"Điều nào sau đây KHÔNG đúng về \1?"),
        (r"Which of the following is not true\?", r"Điều nào sau đây KHÔNG đúng?"),
        (r"Which of the following is not the feature of (.*)\?", r"Đặc điểm nào sau đây KHÔNG phải là tính năng của \1?"),
        (r"Which of the following is not a feature of (.*)\?", r"Đặc điểm nào sau đây KHÔNG phải là tính năng của \1?"),
        (r"Which of the following is not a valid (.*)\?", r"Phương án nào sau đây KHÔNG phải là một \1 hợp lệ?"),
        (r"Which of the following is not an? (.*)\?", r"Phương án nào sau đây KHÔNG phải là một \1?"),
        (r"Which of the following is not (.*)\?", r"Phương án nào sau đây KHÔNG phải là \1?"),
        (r"Which of the following are not (.*)\?", r"Các phương án nào sau đây KHÔNG phải là \1?"),

        # Which of the following is...
        (r"Which of the following is true regarding (.*)\?", r"Điều nào sau đây là ĐÚNG liên quan đến \1?"),
        (r"Which of the following is true about (.*)\?", r"Điều nào sau đây là ĐÚNG về \1?"),
        (r"Which of the following is true\?", r"Điều nào sau đây là ĐÚNG?"),
        (r"Which of the following is a valid (.*)\?", r"Phương án nào sau đây là một \1 hợp lệ?"),
        (r"Which of the following is valid (.*)\?", r"Phương án nào sau đây là \1 hợp lệ?"),
        (r"Which of the following is used to (.*)\?", r"Phương án nào sau đây được sử dụng để \1?"),
        (r"Which of the following is an? (.*)\?", r"Phương án nào sau đây là một \1?"),
        (r"Which of the following is (.*)\?", r"Phương án nào sau đây là \1?"),
        (r"Which of the following creates (.*)\?", r"Phương án nào sau đây tạo \1?"),
        (r"Which of the following statements is true\?", r"Phát biểu nào sau đây là ĐÚNG?"),
        (r"Which of the following statements is false\?", r"Phát biểu nào sau đây là SAI?"),
        
        # Which of these is...
        (r"Which of these is not (.*)\?", r"Điều nào sau đây KHÔNG phải là \1?"),
        (r"Which of these is (.*)\?", r"Điều nào sau đây là \1?"),
        (r"Which of these methods (.*)\?", r"Phương thức nào trong số này \1?"),
        (r"Which of these classes (.*)\?", r"Lớp nào trong số này \1?"),
        
        # What is the output...
        (r"What is the output of the following (code|program)\?", r"Kết quả đầu ra (output) của đoạn mã sau là gì?"),
        (r"What will be the output of the following (code|program)\?", r"Kết quả đầu ra của đoạn mã sau sẽ là gì?"),
        (r"What will be the output of (.*)\?", r"Kết quả đầu ra của \1 sẽ là gì?"),
        (r"What is the output of (.*)\?", r"Kết quả đầu ra của \1 là gì?"),
        (r"What will be the result of (.*)\?", r"Kết quả của \1 sẽ là gì?"),
        (r"What is the result of (.*)\?", r"Kết quả của \1 là gì?"),
        
        # Keywords, methods, operators
        (r"Which keyword is used to (.*)\?", r"Từ khóa nào được sử dụng để \1?"),
        (r"Which operator is used to (.*)\?", r"Toán tử nào được sử dụng để \1?"),
        (r"Which method is used to (.*)\?", r"Phương thức nào được sử dụng để \1?"),
        (r"Which method returns (.*)\?", r"Phương thức nào trả về \1?"),
        (r"Which clause is used to (.*)\?", r"Mệnh đề nào được sử dụng để \1?"),
        (r"Which command is used to (.*)\?", r"Lệnh nào được sử dụng để \1?"),
        (r"Which constraint is used to (.*)\?", r"Ràng buộc nào được sử dụng để \1?"),
        (r"Which statement about (.*) is true\?", r"Phát biểu nào về \1 là ĐÚNG?"),
        (r"Which statement about (.*) is false\?", r"Phát biểu nào về \1 là SAI?"),
        (r"What is true about (.*)\?", r"Điều gì là ĐÚNG về \1?"),
        (r"What is not true about (.*)\?", r"Điều gì là KHÔNG đúng về \1?"),
        (r"What is the default value of (.*)\?", r"Giá trị mặc định của \1 là gì?"),
        (r"How many objects are created (.*)\?", r"Có bao nhiêu đối tượng được tạo ra \1?"),
        (r"Which normal form (.*)\?", r"Dạng chuẩn nào \1?"),
    ]

    for pat, repl in patterns:
        m = re.search(pat, t, re.IGNORECASE)
        if m:
            return re.sub(pat, repl, t, flags=re.IGNORECASE)

    # General replacements for common technical terms
    translated = t
    replacements = [
        ("Which of the following", "Phương án nào sau đây"),
        ("Which of these", "Phương án nào trong số này"),
        ("What is the output", "Kết quả đầu ra là gì"),
        ("What will be the output", "Kết quả đầu ra sẽ là gì"),
        ("What is the result", "Kết quả là gì"),
        ("is not valid", "không hợp lệ"),
        ("is valid", "là hợp lệ"),
        ("is used to", "được dùng để"),
        ("garbage collection", "thu gom rác (garbage collection)"),
        ("eligible for", "đủ điều kiện cho"),
        ("compile time error", "lỗi thời gian biên dịch (compile-time error)"),
        ("runtime error", "lỗi thời gian chạy (runtime error)"),
        ("runtime exception", "ngoại lệ thời gian chạy (runtime exception)"),
    ]
    for en_sub, vi_sub in replacements:
        translated = re.sub(re.escape(en_sub), vi_sub, translated, flags=re.IGNORECASE)

    return translated

def translate_option(opt):
    if not opt:
        return ""
    o = opt.strip()
    
    # Direct mappings
    m_opts = {
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
        "Compile time error": "Lỗi thời gian biên dịch (Compile error)",
        "Runtime exception": "Phát sinh ngoại lệ khi chạy (Runtime exception)",
        "An exception is thrown": "Một ngoại lệ bị ném ra",
        "An exception is thrown at runtime": "Ngoại lệ bị ném ra trong thời gian chạy (Runtime Exception)",
        "True": "Đúng (True)",
        "False": "Sai (False)",
        "true": "true (Đúng)",
        "false": "false (Sai)",
        "Not Robust.": "Không mạnh mẽ (Not Robust)",
        "Object Oriented.": "Hướng đối tượng (Object Oriented)",
        "Distributed.": "Phân tán (Distributed)",
        "Interpreted": "Thông dịch (Interpreted)",
    }
    if o in m_opts:
        return m_opts[o]

    # Regex for lines
    m = re.match(r"^(just\s+)?after\s+line\s+(\d+)$", o, re.IGNORECASE)
    if m:
        return f"Ngay sau dòng {m.group(2)}"
        
    m2 = re.match(r"^at\s+line\s+(\d+)$", o, re.IGNORECASE)
    if m2:
        return f"Tại dòng {m2.group(1)}"

    m3 = re.match(r"^before\s+line\s+(\d+)$", o, re.IGNORECASE)
    if m3:
        return f"Trước dòng {m3.group(1)}"

    return o

def generate_detailed_explanation(q):
    sub = q.get("subjectKey", "JAVA")
    mod_id = q.get("moduleId", 1)
    mod_name = q.get("moduleName", "")
    q_text = q.get("questionText", "")
    ans_key = q.get("correctAnswer", "A")
    raw_ans_text = q.get("options", {}).get(ans_key, "")
    ans_text = translate_option(raw_ans_text)
    
    # Specific Garbage Collection explanation (as in Question 2 from screenshot)
    if "garbage collection" in q_text.lower() or "eligible for garbage" in q_text.lower():
        return (
            f"🎯 Phân tích cơ chế Garbage Collection (Bộ thu gom rác) trong JVM:\n"
            f"- Trong Java, một đối tượng trên vùng nhớ Heap chỉ đủ điều kiện để GC thu dọn khi nó hoàn toàn 'Unreachable' (không còn bất kỳ biến tham chiếu còn sống nào trỏ tới nó).\n"
            f"- Tại vị trí '{ans_text}': Tất cả các biến tham chiếu trỏ tới đối tượng này đều đã được gán về null hoặc ra khỏi phạm vi hoạt động (scope).\n"
            f"👉 Vì vậy, đối tượng đủ điều kiện giải phóng bộ nhớ ngay sau thời điểm này. Đáp án chính xác là: {ans_key} ({ans_text})."
        )

    # Feature of Java (Question 1)
    if "feature of java" in q_text.lower():
        return (
            f"🎯 Phân tích đặc tính cốt lõi của ngôn ngữ Java:\n"
            f"- Java sở hữu các đặc tính cốt lõi: Hướng đối tượng (Object-Oriented), Độc lập nền tảng (Platform Independent nhờ Bytecode chạy trên JVM), Phân tán (Distributed), Đa luồng (Multithreaded), Bảo mật (Secure), và đặc biệt là Rất mạnh mẽ (Robust).\n"
            f"- Tính chất 'Robust' của Java đến từ việc quản lý bộ nhớ tự động (Garbage Collector), kiểm tra kiểu dữ liệu nghiêm ngặt (Strict type-checking) và cơ chế xử lý ngoại lệ (Exception handling) chặt chẽ.\n"
            f"👉 Do đó, '{raw_ans_text}' là khẳng định SAI đối với Java. Phương án được chọn là: {ans_key}."
        )

    # HotJava Browser (Question 3)
    if "web browser" in q_text.lower() and "java" in q_text.lower():
        return (
            f"🎯 Lịch sử nền tảng Java:\n"
            f"- HotJava (tên mã ban đầu là WebRunner) là trình duyệt web mô-đun đầu tiên được viết hoàn toàn bằng Java bởi Sun Microsystems vào năm 1995.\n"
            f"- Mục đích tạo ra HotJava là nhằm chứng minh tính khả thi và sức mạnh của việc thực thi mã Applet tương tác động ngay trên trang web.\n"
            f"👉 Đáp án đúng: {ans_key} - {ans_text}."
        )

    # Compilation failure
    if "compilation fails" in raw_ans_text.lower() or "compile error" in raw_ans_text.lower():
        return (
            f"🎯 Phân tích lỗi biên dịch (Compilation Error):\n"
            f"- Trình biên dịch javac phát hiện vi phạm quy tắc cú pháp hoặc ràng buộc kiểu dữ liệu tĩnh.\n"
            f"- Các nguyên nhân phổ biến trong đề thi: ép kiểu không tương thích, truy cập thành viên private/protected ngoài phạm vi, phương thức trừu tượng chưa được override, hoặc biến cục bộ chưa được khởi tạo trước khi dùng.\n"
            f"👉 Đáp án chính xác: {ans_key} - {ans_text}."
        )

    # Default value
    if "default value" in q_text.lower():
        return (
            f"🎯 Bảng giá trị mặc định của thuộc tính lớp (Fields) trong Java:\n"
            f"- Kiểu boolean: mặc định là false.\n"
            f"- Kiểu số nguyên (byte, short, int, long): mặc định là 0.\n"
            f"- Kiểu số thực (float, double): mặc định là 0.0.\n"
            f"- Kiểu tham chiếu đối tượng (String, Object, Array): mặc định là null.\n"
            f"👉 Đáp án đúng: {ans_key} - {ans_text}."
        )

    # Subject-based detailed explanations
    if sub == "JAVA":
        mod_explanations = {
            1: "Kiến thức nền tảng Java: Cấu trúc chương trình, JVM, JRE, JDK, quy trình biên dịch từ mã nguồn .java sang bytecode .class và thực thi trên máy ảo JVM.",
            2: "Lập trình hướng đối tượng trong Java: Khái niệm Lớp (Class), Đối tượng (Object), Constructor, biến static, phương thức static và cơ chế nạp chồng phương thức (Overloading).",
            3: "Quy tắc truy cập và Interface: Phân biệt 4 cấp độ truy cập (private, default/package, protected, public). Lớp con kế thừa lớp cha bằng từ khóa 'extends', thực thi interface bằng từ khóa 'implements'.",
            4: "Quản lý bộ nhớ và Từ khóa: Phân biệt Stack (lưu frame hàm & biến nguyên thủy) và Heap (lưu tất cả đối tượng). Từ khóa final ngăn cản gán lại giá trị, ghi đè phương thức hoặc kế thừa lớp.",
            5: "Collections Framework: List duy trì thứ tự và cho phép trùng lặp (ArrayList, LinkedList); Set không cho phép phần tử trùng lặp (HashSet, TreeSet); Map lưu trữ theo cặp Key-Value.",
            6: "Xử lý ngoại lệ (Exception Handling): Khối try-catch-finally. Khối finally luôn được thực thi để đóng tài nguyên. Phân biệt Checked Exception (buộc phải xử lý) và Unchecked Exception (RuntimeException).",
            7: "Lập trình đa luồng (Multithreading): Tạo luồng qua kế thừa Thread hoặc implement Runnable. Đồng bộ hóa với từ khóa 'synchronized' để tránh tình trạng Race Condition và Deadlock.",
            8: "Java I/O Streams: Byte Streams (InputStream, OutputStream) xử lý dữ liệu nhị phân; Character Streams (Reader, Writer) xử lý chuỗi ký tự Unicode 16-bit.",
            9: "Wrapper Classes & Serialization: Cơ chế Autoboxing/Unboxing giữa kiểu nguyên thủy và Wrapper class. Giao diện đánh dấu Serializable cho phép tuần tự hóa đối tượng ra luồng byte.",
            10: "JDBC (Java Database Connectivity): Kiến trúc 4 loại Driver, các bước kết nối CSDL chuẩn: DriverManager, Connection, Statement, PreparedStatement và ResultSet.",
        }
        note = mod_explanations.get(mod_id, f"Trọng tâm chuyên đề {mod_name}: Nắm vững các nguyên lý cú pháp và đặc tả kỹ thuật Java Core để làm bài trắc nghiệm nhanh và chính xác.")
        return (
            f"🎯 Phân tích chi tiết câu hỏi:\n"
            f"- Phương án chính xác: {ans_key} ({ans_text}).\n"
            f"- {note}\n"
            f"👉 Khi làm bài thi CDAC, hãy chú ý đọc kỹ câu hỏi phủ định (not/incorrect) và các chi tiết cú pháp trong đoạn code minh họa."
        )

    else: # DBMS
        mod_explanations_dbms = {
            1: "Kiến trúc hệ quản trị CSDL (DBMS): 3 tầng kiến trúc ANSI-SPARC (View, Conceptual, Physical), tính độc lập dữ liệu vật lý và logic.",
            2: "Nhập môn SQL: Ngôn ngữ truy vấn mang tính khai báo (Declarative), phân loại câu lệnh thành DDL (Định nghĩa), DML (Thao tác), DCL (Phân quyền) và TCL (Giao dịch).",
            3: "Lệnh DDL (Data Definition Language): CREATE, ALTER, DROP, TRUNCATE, RENAME. Lệnh TRUNCATE xóa toàn bộ dữ liệu của bảng, nhanh hơn DELETE và không thể ROLLBACK trong chuẩn SQL.",
            4: "Ràng buộc toàn vẹn (Constraints): PRIMARY KEY (duy nhất và NOT NULL), FOREIGN KEY (toàn vẹn tham chiếu), UNIQUE (duy nhất), CHECK (kiểm tra logic), NOT NULL (bắt buộc có giá trị).",
            5: "Lệnh DML & Giao dịch: INSERT, UPDATE, DELETE. Tính chất ACID (Atomicity, Consistency, Isolation, Durability). Quản lý giao dịch bằng COMMIT, ROLLBACK, SAVEPOINT.",
            6: "Hàm xử lý đơn dòng (Single Row Functions): Các hàm xử lý chuỗi (UPPER, LOWER, SUBSTR), hàm số học (ROUND, TRUNC), hàm ngày tháng (SYSDATE, ADD_MONTHS) và hàm xử lý NULL (NVL, COALESCE).",
            7: "Hàm nhóm & Gom cụm (Aggregate Functions & GROUP BY): COUNT, SUM, AVG, MIN, MAX tự động bỏ qua NULL (trừ COUNT(*)). Mệnh đề WHERE lọc hàng trước khi nhóm; HAVING lọc nhóm sau GROUP BY.",
            8: "Phép kết nối (SQL Joins): INNER JOIN (lấy phần giao), LEFT OUTER JOIN (giữ toàn bộ bảng trái), RIGHT OUTER JOIN (giữ toàn bộ bảng phải), FULL OUTER JOIN (toàn bộ cả 2 bên), CROSS JOIN (tích Descartes).",
            9: "Truy vấn con (Subqueries): Subquery đơn dòng (dùng =, <, >) và Subquery nhiều dòng (dùng IN, ANY, ALL). Phân biệt Subquery độc lập và Subquery tương quan (Correlated subquery).",
            10: "Subqueries nâng cao: Sử dụng EXISTS / NOT EXISTS để kiểm tra sự tồn tại nhanh chóng; truy vấn con lồng nhau trong mệnh đề FROM (Inline View).",
            11: "Khung nhìn (Views): View là bảng ảo lưu trữ định nghĩa câu lệnh truy vấn SELECT. Giúp tăng cường bảo mật và che giấu sự phức tạp của cơ sở dữ liệu nền tảng.",
            12: "Toán tử tập hợp (Set Operators): UNION (gộp và loại bỏ trùng lặp), UNION ALL (gộp và giữ nguyên trùng lặp, nhanh hơn), INTERSECT (lấy phần giao), MINUS/EXCEPT (lấy phần hiệu).",
            13: "Chuẩn hóa CSDL (Normalization): 1NF (thuộc tính nguyên tố), 2NF (thỏa 1NF + loại bỏ phụ thuộc một phần), 3NF (thỏa 2NF + loại bỏ phụ thuộc bắc cầu), BCNF (mọi định thức đều là khóa ứng viên).",
        }
        note = mod_explanations_dbms.get(mod_id, f"Trọng tâm chuyên đề {mod_name}: Nắm vững cú pháp chuẩn SQL và lý thuyết thiết kế quan hệ CSDL.")
        return (
            f"🎯 Phân tích chi tiết câu hỏi:\n"
            f"- Phương án chính xác: {ans_key} ({ans_text}).\n"
            f"- {note}\n"
            f"👉 Trong đề thi CDAC DBMS, hãy chú ý phân biệt các câu lệnh tự động COMMIT (như DDL: CREATE, TRUNCATE) với các câu lệnh có thể ROLLBACK (như DML: DELETE, UPDATE)."
        )

def enrich_file(file_path, root_copy_path):
    print(f"Reading {file_path}...")
    with open(file_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    for q in questions:
        # Question VI
        q["questionTextVi"] = translate_phrase(q.get("questionText", ""))

        # Options VI
        opts = q.get("options", {})
        opts_vi = {}
        for k in ["A", "B", "C", "D"]:
            raw_val = opts.get(k, "")
            opts_vi[k] = translate_option(raw_val)
        q["optionsVi"] = opts_vi

        # Explanation VI
        q["explanationVi"] = generate_detailed_explanation(q)

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    with open(root_copy_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"Enriched {len(questions)} items in {file_path} & {root_copy_path}.")

enrich_file(JAVA_SRC, JAVA_ROOT)
enrich_file(DBMS_SRC, DBMS_ROOT)
print("All datasets enriched successfully!")
