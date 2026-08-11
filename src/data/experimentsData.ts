import { LabExperiment } from '../types';

export const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: 1,
    title: "Experiment 1: DDL Commands & Student Database Creation",
    category: "Data Definition",
    aim: "To study and implement Data Definition Language (DDL) commands: CREATE, ALTER, DROP, and TRUNCATE to build a Student Database schema.",
    theory: "Data Definition Language (DDL) statements are used to define the database structure or schema. DDL commands auto-commit changes permanently to the database catalog.",
    procedure: [
      "Launch MySQL Client / PostgreSQL CLI / Oracle SQL Plus.",
      "Execute CREATE DATABASE statement to initialize lab schema.",
      "Execute CREATE TABLE statements for Student and Department tables.",
      "Use ALTER TABLE to add a new column 'phone_no'.",
      "Demonstrate TRUNCATE vs DROP operations."
    ],
    sqlCode: `-- 1. Create Database
CREATE DATABASE dbms_lab;
USE dbms_lab;

-- 2. Create Department Table
CREATE TABLE Department (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(50) NOT NULL,
    location VARCHAR(50)
);

-- 3. Create Student Table
CREATE TABLE Student (
    roll_no INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    dob DATE,
    dept_id INT,
    gpa DECIMAL(3,2),
    FOREIGN KEY (dept_id) REFERENCES Department(dept_id)
);

-- 4. Alter Table to add Phone Number
ALTER TABLE Student ADD phone_no VARCHAR(15);

-- 5. View Table Structure
DESCRIBE Student;`,
    expectedOutput: {
      columns: ["Field", "Type", "Null", "Key", "Default", "Extra"],
      rows: [
        ["roll_no", "int", "NO", "PRI", "NULL", ""],
        ["name", "varchar(50)", "NO", "", "NULL", ""],
        ["email", "varchar(100)", "YES", "UNI", "NULL", ""],
        ["dob", "date", "YES", "", "NULL", ""],
        ["dept_id", "int", "YES", "MUL", "NULL", ""],
        ["gpa", "decimal(3,2)", "YES", "", "NULL", ""],
        ["phone_no", "varchar(15)", "YES", "", "NULL", ""]
      ]
    },
    result: "The database 'dbms_lab' and required tables 'Department' and 'Student' were successfully created and altered using DDL statements.",
    vivaQuestions: [
      {
        question: "What is the difference between DROP and TRUNCATE?",
        answer: "DROP removes the table schema along with all rows permanently. TRUNCATE removes all rows instantly but retains the empty table schema structure."
      },
      {
        question: "Are DDL commands auto-committed?",
        answer: "Yes, in standard SQL, DDL statements are implicitly committed and cannot be rolled back with ROLLBACK."
      },
      {
        question: "Why do we specify a PRIMARY KEY?",
        answer: "PRIMARY KEY uniquely identifies each record in a table, ensuring no duplicate rows exist and enforces non-null values."
      }
    ],
    tips: [
      "Always set up Parent tables (like Department) before creating Child tables referencing them via Foreign Key.",
      "Use descriptive data types (VARCHAR over CHAR for variable-length text)."
    ]
  },
  {
    id: 2,
    title: "Experiment 2: DML Commands & Integrity Constraints",
    category: "Data Manipulation",
    aim: "To execute Data Manipulation Language (DML) commands (INSERT, UPDATE, DELETE) while enforcing Domain and Referential Integrity Constraints.",
    theory: "DML commands manipulate data within schema objects. Constraints enforce rules at table and column levels to maintain data integrity.",
    procedure: [
      "Insert sample records into Department table.",
      "Insert records into Student table testing PRIMARY KEY, UNIQUE, and CHECK constraints.",
      "Update student GPA and phone details using UPDATE with WHERE clause.",
      "Delete records meeting specific filter criteria."
    ],
    sqlCode: `-- 1. Populate Department Table
INSERT INTO Department VALUES 
(101, 'Computer Science', 'Block A'),
(102, 'Information Tech', 'Block B'),
(103, 'Electronics', 'Block C');

-- 2. Populate Student Table
INSERT INTO Student (roll_no, name, email, dob, dept_id, gpa, phone_no) VALUES 
(1, 'Alice Smith', 'alice@univ.edu', '2003-05-14', 101, 3.85, '9876543210'),
(2, 'Bob Jones', 'bob@univ.edu', '2002-11-20', 101, 3.40, '9876543211'),
(3, 'Charlie Brown', 'charlie@univ.edu', '2003-01-10', 102, 3.90, '9876543212'),
(4, 'Diana Prince', 'diana@univ.edu', '2002-08-25', 103, 3.10, '9876543213');

-- 3. Update Student GPA
UPDATE Student 
SET gpa = 3.95 
WHERE roll_no = 2;

-- 4. Delete Low GPA record
DELETE FROM Student 
WHERE gpa < 3.20;

-- 5. Query verified records
SELECT * FROM Student;`,
    expectedOutput: {
      columns: ["roll_no", "name", "email", "dob", "dept_id", "gpa", "phone_no"],
      rows: [
        [1, "Alice Smith", "alice@univ.edu", "2003-05-14", 101, 3.85, "9876543210"],
        [2, "Bob Jones", "bob@univ.edu", "2002-11-20", 101, 3.95, "9876543211"],
        [3, "Charlie Brown", "charlie@univ.edu", "2003-01-10", 102, 3.90, "9876543212"]
      ]
    },
    result: "DML commands successfully inserted, modified, and deleted records while respecting constraint boundaries.",
    vivaQuestions: [
      {
        question: "What happens if you run DELETE FROM Student without a WHERE clause?",
        answer: "It deletes ALL rows in the table while keeping the table definition intact."
      },
      {
        question: "What is the difference between DELETE and TRUNCATE regarding transactions?",
        answer: "DELETE is a DML command that logs individual row deletions and can be rolled back. TRUNCATE is a DDL command that deallocates data pages and cannot be rolled back easily."
      }
    ],
    tips: [
      "Always include a WHERE clause in UPDATE and DELETE statements to avoid accidental bulk changes.",
      "Test constraint violations (e.g., inserting a duplicate primary key) to verify validation works."
    ]
  },
  {
    id: 3,
    title: "Experiment 3: SQL Clauses, Grouping & Aggregate Functions",
    category: "Data Querying",
    aim: "To formulate SQL queries using WHERE, GROUP BY, HAVING, ORDER BY clauses and Aggregate functions (COUNT, AVG, SUM, MIN, MAX).",
    theory: "Aggregate functions perform calculations on multiple rows and return a single summary value. GROUP BY divides data into subsets, and HAVING filters aggregated groups.",
    procedure: [
      "Write queries calculating total students, average GPA per department.",
      "Filter groups where department average GPA is strictly above 3.5 using HAVING.",
      "Order output by GPA in descending order."
    ],
    sqlCode: `-- 1. Count Total Students & Average GPA per Department
SELECT 
    dept_id, 
    COUNT(roll_no) AS total_students,
    AVG(gpa) AS avg_gpa,
    MAX(gpa) AS top_gpa
FROM Student
GROUP BY dept_id
HAVING AVG(gpa) >= 3.50
ORDER BY avg_gpa DESC;`,
    expectedOutput: {
      columns: ["dept_id", "total_students", "avg_gpa", "top_gpa"],
      rows: [
        [102, 1, 3.90, 3.90],
        [101, 2, 3.90, 3.95]
      ]
    },
    result: "Queries with aggregate functions and grouping logic executed correctly.",
    vivaQuestions: [
      {
        question: "What is the difference between WHERE and HAVING?",
        answer: "WHERE filters rows BEFORE aggregation occurs. HAVING filters groups AFTER aggregate functions are calculated."
      },
      {
        question: "Can we use aggregate functions in the WHERE clause?",
        answer: "No, aggregate functions cannot be placed in WHERE because WHERE evaluates individual rows before grouping."
      }
    ],
    tips: [
      "Remember the execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY."
    ]
  },
  {
    id: 4,
    title: "Experiment 4: SQL Joins (INNER, LEFT, RIGHT, FULL OUTER, CROSS)",
    category: "Relational Queries",
    aim: "To retrieve consolidated data from multiple related tables using various SQL Join operations.",
    theory: "Joins combine columns from one or more tables based on a related column between them (foreign key mapping).",
    procedure: [
      "Perform INNER JOIN between Student and Department tables.",
      "Perform LEFT JOIN to display all departments even if no students are enrolled.",
      "Perform RIGHT JOIN and CROSS JOIN to inspect Cartesian products."
    ],
    sqlCode: `-- 1. INNER JOIN
SELECT S.roll_no, S.name, D.dept_name, S.gpa
FROM Student S
INNER JOIN Department D ON S.dept_id = D.dept_id;

-- 2. LEFT OUTER JOIN
SELECT D.dept_name, COUNT(S.roll_no) AS enrolled_students
FROM Department D
LEFT JOIN Student S ON D.dept_id = S.dept_id
GROUP BY D.dept_id, D.dept_name;`,
    expectedOutput: {
      columns: ["roll_no", "name", "dept_name", "gpa"],
      rows: [
        [1, "Alice Smith", "Computer Science", 3.85],
        [2, "Bob Jones", "Computer Science", 3.95],
        [3, "Charlie Brown", "Information Tech", 3.90]
      ]
    },
    result: "Relational join operations retrieved linked entity sets accurately.",
    vivaQuestions: [
      {
        question: "What is a CROSS JOIN?",
        answer: "A CROSS JOIN produces a Cartesian product matching every row of Table A with every row of Table B (rows = N x M)."
      },
      {
        question: "What is a Self Join?",
        answer: "A Self Join is a regular join in which a table is joined with itself using table aliases (e.g., finding Employee and Manager in the same table)."
      }
    ],
    tips: [
      "Always use concise table aliases (e.g., S for Student, D for Department) for readable queries."
    ]
  },
  {
    id: 5,
    title: "Experiment 5: Nested Queries, Subqueries & Correlated Subqueries",
    category: "Advanced Querying",
    aim: "To design and execute subqueries using IN, EXISTS, ANY, ALL, and correlated subqueries.",
    theory: "A subquery is a query nested inside another SELECT, INSERT, UPDATE, or DELETE statement. A correlated subquery relies on outer query values for execution.",
    procedure: [
      "Find students with higher GPA than average department GPA.",
      "Use EXISTS operator to find departments with active students.",
      "Demonstrate IN operator with nested subqueries."
    ],
    sqlCode: `-- 1. Uncorrelated Subquery (Students above overall average GPA)
SELECT name, gpa 
FROM Student 
WHERE gpa > (SELECT AVG(gpa) FROM Student);

-- 2. Correlated Subquery (Students with GPA higher than their own dept average)
SELECT S1.name, S1.gpa, S1.dept_id
FROM Student S1
WHERE S1.gpa >= (
    SELECT AVG(S2.gpa) 
    FROM Student S2 
    WHERE S2.dept_id = S1.dept_id
);`,
    expectedOutput: {
      columns: ["name", "gpa", "dept_id"],
      rows: [
        ["Bob Jones", 3.95, 101],
        ["Charlie Brown", 3.90, 102]
      ]
    },
    result: "Subqueries and correlated nested loops computed matching record sets successfully.",
    vivaQuestions: [
      {
        question: "What is the key performance drawback of correlated subqueries?",
        answer: "A correlated subquery executes once for every single row fetched by the outer query, leading to potential O(N^2) complexity on large tables."
      },
      {
        question: "Difference between IN and EXISTS?",
        answer: "IN evaluates all values in the subquery list first. EXISTS terminates as soon as a single matching row is found (short-circuiting)."
      }
    ],
    tips: [
      "Prefer JOINs over correlated subqueries whenever query optimizer performance is critical."
    ]
  },
  {
    id: 6,
    title: "Experiment 6: Database Views & Indexing Techniques",
    category: "Database Objects",
    aim: "To create, update, and manage Views for security abstraction, and build Indexes for query optimization.",
    theory: "A View is a virtual table based on the result-set of an SQL statement. An Index (B-Tree/Hash) accelerates data retrieval without scanning the whole table.",
    procedure: [
      "Create a View named 'TopStudents' exposing only Roll No, Name, and GPA.",
      "Create a non-clustered Index on Student email column.",
      "Analyze query execution plan using EXPLAIN."
    ],
    sqlCode: `-- 1. Create Security View
CREATE VIEW HighPerformers AS
SELECT roll_no, name, gpa
FROM Student
WHERE gpa >= 3.80;

-- 2. Query View
SELECT * FROM HighPerformers;

-- 3. Create Index on Email
CREATE INDEX idx_student_email ON Student(email);

-- 4. Create Composite Index on Dept & GPA
CREATE INDEX idx_dept_gpa ON Student(dept_id, gpa);`,
    expectedOutput: {
      columns: ["roll_no", "name", "gpa"],
      rows: [
        [1, "Alice Smith", 3.85],
        [2, "Bob Jones", 3.95],
        [3, "Charlie Brown", 3.90]
      ]
    },
    result: "Database views provided abstraction layers and indexing reduced search latency.",
    vivaQuestions: [
      {
        question: "Does creating an index slow down INSERT or UPDATE statements?",
        answer: "Yes. Every time data is inserted or updated, the database must also update index tree structures, adding minor overhead to writes."
      },
      {
        question: "Difference between Clustered and Non-Clustered Index?",
        answer: "A Clustered Index physical sorts table records on disk (only 1 per table). A Non-Clustered Index builds a separate lookup table referencing data pointers."
      }
    ],
    tips: [
      "Index columns frequently used in WHERE, JOIN, and ORDER BY clauses."
    ]
  },
  {
    id: 7,
    title: "Experiment 7: PL/SQL Triggers (BEFORE / AFTER)",
    category: "Programmability",
    aim: "To create BEFORE and AFTER database Triggers to enforce audit logs and automated integrity rules.",
    theory: "A Trigger is a procedural block executed automatically in response to specified DML events (INSERT, UPDATE, DELETE) on a table.",
    procedure: [
      "Create an AuditLog table to record student changes.",
      "Create an AFTER UPDATE trigger on Student table to record old vs new GPA.",
      "Execute UPDATE statement and verify audit entry."
    ],
    sqlCode: `-- 1. Create Audit Table
CREATE TABLE StudentAudit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no INT,
    old_gpa DECIMAL(3,2),
    new_gpa DECIMAL(3,2),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Trigger
DELIMITER //
CREATE TRIGGER trg_gpa_update
AFTER UPDATE ON Student
FOR EACH ROW
BEGIN
    IF OLD.gpa <> NEW.gpa THEN
        INSERT INTO StudentAudit(roll_no, old_gpa, new_gpa)
        VALUES (NEW.roll_no, OLD.gpa, NEW.gpa);
    END IF;
END;
//
DELIMITER ;`,
    expectedOutput: {
      columns: ["audit_id", "roll_no", "old_gpa", "new_gpa", "changed_at"],
      rows: [
        [1, 2, 3.40, 3.95, "2026-07-29 20:15:00"]
      ]
    },
    result: "Automated trigger executed seamlessly following GPA modifications.",
    vivaQuestions: [
      {
        question: "What are OLD and NEW pseudo-records in triggers?",
        answer: "OLD refers to data values prior to modification (available in UPDATE/DELETE). NEW refers to data values being inserted or updated (available in INSERT/UPDATE)."
      }
    ],
    tips: [
      "Avoid writing recursive triggers that cause infinite cascading execution loops."
    ]
  },
  {
    id: 8,
    title: "Experiment 8: Stored Procedures & User Defined Functions",
    category: "Programmability",
    aim: "To write reusable Stored Procedures and Stored Functions with input and output parameters.",
    theory: "Stored procedures compile reusable SQL code modules stored in the database catalog. Functions return a single value and can be called inside SELECT queries.",
    procedure: [
      "Define a stored procedure `GetDeptStudents` taking department ID as IN parameter.",
      "Define a stored function `GetGrade` converting GPA into Letter Grade.",
      "Call function inside SELECT query."
    ],
    sqlCode: `-- 1. Stored Function for Grade Calculation
DELIMITER //
CREATE FUNCTION GetGrade(gpa DECIMAL(3,2)) 
RETURNS VARCHAR(5)
DETERMINISTIC
BEGIN
    IF gpa >= 3.8 THEN RETURN 'A+';
    ELSEIF gpa >= 3.5 THEN RETURN 'A';
    ELSEIF gpa >= 3.0 THEN RETURN 'B';
    ELSE RETURN 'C';
    END IF;
END //
DELIMITER ;

-- 2. Usage in Query
SELECT name, gpa, GetGrade(gpa) AS letter_grade FROM Student;`,
    expectedOutput: {
      columns: ["name", "gpa", "letter_grade"],
      rows: [
        ["Alice Smith", 3.85, "A+"],
        ["Bob Jones", 3.95, "A+"],
        ["Charlie Brown", 3.90, "A+"]
      ]
    },
    result: "Stored Procedures and Functions executed correctly.",
    vivaQuestions: [
      {
        question: "Difference between Stored Procedure and Function?",
        answer: "Functions MUST return a single value and can be called directly inside SQL statements. Procedures do not require a return value, support IN/OUT parameters, and are invoked using CALL."
      }
    ],
    tips: [
      "Use stored procedures to encapsulate business logic on the database side to cut network round trips."
    ]
  },
  {
    id: 9,
    title: "Experiment 9: Transaction Management & ACID Properties",
    category: "Transactions",
    aim: "To demonstrate Transaction Control Language (TCL) commands: COMMIT, ROLLBACK, and SAVEPOINT to maintain ACID properties.",
    theory: "A transaction is a logical unit of database work. TCL commands preserve Atomicity, Consistency, Isolation, and Durability (ACID).",
    procedure: [
      "Begin explicit transaction using START TRANSACTION.",
      "Execute DML operations.",
      "Create SAVEPOINT sp1.",
      "Rollback to SAVEPOINT sp1 and observe atomic rollback."
    ],
    sqlCode: `-- 1. Start Transaction
START TRANSACTION;

-- 2. Modify records
UPDATE Student SET gpa = gpa + 0.1 WHERE dept_id = 101;

-- 3. Set Savepoint
SAVEPOINT gpa_boosted;

-- 4. Accidental Delete
DELETE FROM Student WHERE dept_id = 102;

-- 5. Rollback to Savepoint (Undo Delete, keep GPA boost)
ROLLBACK TO SAVEPOINT gpa_boosted;

-- 6. Permanently Commit changes
COMMIT;`,
    expectedOutput: {
      columns: ["Status Message"],
      rows: [
        ["Transaction committed successfully. Savepoint rollback restored Dept 102 record."]
      ]
    },
    result: "Transaction control commands demonstrated reliable state restoration and ACID compliance.",
    vivaQuestions: [
      {
        question: "Explain the ACID acronym.",
        answer: "Atomicity (all or nothing), Consistency (valid state transitions), Isolation (independent transactions), Durability (persisted commits)."
      }
    ],
    tips: [
      "Keep transactions as short as possible to prevent table-level locking bottlenecks."
    ]
  },
  {
    id: 10,
    title: "Experiment 10: Database Normalization (1NF to 3NF)",
    category: "Database Design",
    aim: "To analyze an unnormalized relational schema and decompose it into 1NF, 2NF, and 3NF tables eliminating redundancy.",
    theory: "Normalization minimizes data redundancy and eliminates insertion, update, and deletion anomalies through functional dependencies.",
    procedure: [
      "Identify Partial Dependencies violating 2NF (Attribute depends on part of composite key).",
      "Identify Transitive Dependencies violating 3NF (Non-prime attribute depends on another non-prime attribute).",
      "Decompose unnormalized table into 3 clean normalized tables."
    ],
    sqlCode: `-- Unnormalized Table Violation: StudentCourse (roll_no, course_code, student_name, instructor, building)
-- 3NF Decomposed Schema:

-- 1. Student Info Table (Key: roll_no)
CREATE TABLE StudentInfo (
    roll_no INT PRIMARY KEY,
    student_name VARCHAR(50) NOT NULL
);

-- 2. Course Table (Key: course_code)
CREATE TABLE CourseInfo (
    course_code VARCHAR(10) PRIMARY KEY,
    course_title VARCHAR(50),
    instructor VARCHAR(50)
);

-- 3. Enrollment Junction Table (Composite Key: roll_no, course_code)
CREATE TABLE Enrollment (
    roll_no INT,
    course_code VARCHAR(10),
    grade VARCHAR(2),
    PRIMARY KEY (roll_no, course_code),
    FOREIGN KEY (roll_no) REFERENCES StudentInfo(roll_no),
    FOREIGN KEY (course_code) REFERENCES CourseInfo(course_code)
);`,
    expectedOutput: {
      columns: ["Table Name", "Normal Form Achieved", "Functional Dependencies Resolved"],
      rows: [
        ["StudentInfo", "3NF", "roll_no -> student_name"],
        ["CourseInfo", "3NF", "course_code -> course_title, instructor"],
        ["Enrollment", "3NF", "(roll_no, course_code) -> grade"]
      ]
    },
    result: "Data anomalies removed by normalizing original schema into 3NF design.",
    vivaQuestions: [
      {
        question: "What is BCNF?",
        answer: "Boyce-Codd Normal Form (BCNF) is a stricter version of 3NF where for every functional dependency X -> Y, X must be a super key."
      },
      {
        question: "What are Insertion, Update, and Deletion Anomalies?",
        answer: "Insertion anomaly: inability to add data without extra facts. Update anomaly: inconsistent copies of same data. Deletion anomaly: unintentional loss of related data upon record deletion."
      }
    ],
    tips: [
      "Always draw Functional Dependency diagrams before designing SQL tables."
    ]
  }
];
