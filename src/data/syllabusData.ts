import { SyllabusUnit } from '../types';

export const DBMS_SYLLABUS: SyllabusUnit[] = [
  {
    id: "unit_1",
    unitNumber: 1,
    title: "Unit I: Introduction & ER Modeling",
    description: "Database system architecture, data models, relational model, ER Diagrams, extended ER features, entity sets, and key constraints.",
    topics: [
      "File Systems vs DBMS",
      "Three-Schema Architecture",
      "Data Independence (Physical & Logical)",
      "Entity-Relationship (ER) Diagrams",
      "Weak Entity Sets & Keys",
      "Relational Model & Constraints"
    ],
    isCompleted: true
  },
  {
    id: "unit_2",
    unitNumber: 2,
    title: "Unit II: Relational Languages & SQL",
    description: "Relational algebra operations, relational calculus, standard SQL queries, DDL, DML, DCL, TCL, subqueries, views, and joins.",
    topics: [
      "Relational Algebra (Select, Project, Join, Union, Set Difference)",
      "DDL, DML, DCL, TCL Commands",
      "SQL Aggregate Functions & Grouping",
      "Inner, Outer, & Self Joins",
      "Nested & Correlated Subqueries",
      "Database Views & Triggers"
    ],
    isCompleted: true
  },
  {
    id: "unit_3",
    unitNumber: 3,
    title: "Unit III: Database Design & Normalization",
    description: "Functional dependencies, pitfall of bad design, normalization theory (1NF, 2NF, 3NF, BCNF, 4NF, 5NF), and lossless join decomposition.",
    topics: [
      "Functional Dependencies & Closure",
      "Armstrong's Axioms",
      "First Normal Form (1NF)",
      "Second Normal Form (2NF)",
      "Third Normal Form (3NF) & Transitive Dependency",
      "Boyce-Codd Normal Form (BCNF)",
      "Lossless Join & Dependency Preservation"
    ],
    isCompleted: false
  },
  {
    id: "unit_4",
    unitNumber: 4,
    title: "Unit IV: Transaction Management & Concurrency",
    description: "Transaction concepts, ACID properties, serializability, concurrency control protocols, lock-based protocols, and deadlock handling.",
    topics: [
      "ACID Properties",
      "Transaction States & Schedule",
      "Conflict & View Serializability",
      "Two-Phase Locking (2PL) Protocol",
      "Timestamp Ordering Protocol",
      "Deadlock Detection, Prevention & Recovery"
    ],
    isCompleted: false
  },
  {
    id: "unit_5",
    unitNumber: 5,
    title: "Unit V: Indexing, Storage & NoSQL Overview",
    description: "Physical database storage, indexing structures (B-Trees, B+ Trees, Hash Indexing), query processing, query optimization, and introduction to Distributed & NoSQL DBs.",
    topics: [
      "File Organizations (Heap, Sequential, Indexed)",
      "B-Tree & B+ Tree Indexing",
      "Clustered vs Non-Clustered Indexes",
      "Query Optimization Steps",
      "Introduction to NoSQL (MongoDB, Key-Value, Document Stores)"
    ],
    isCompleted: false
  }
];


export const FREQUENT_INTERVIEW_QUESTIONS = [
  {
    category: "Concepts",
    q: "What is the difference between DBMS and RDBMS?",
    a: "DBMS stores data as files and manages simple hierarchies without formal foreign key relations. RDBMS stores data in structured tables linked through key constraints (Primary Key / Foreign Key) enforcing mathematical relational algebra."
  },
  {
    category: "SQL",
    q: "What is the difference between DELETE, TRUNCATE, and DROP?",
    a: "DELETE is a DML command that removes specified rows using WHERE and can be rolled back. TRUNCATE is a DDL command that quickly wipes all rows while retaining table schema. DROP removes both data and the table schema structure completely."
  },
  {
    category: "Transactions",
    q: "Explain ACID properties with real-life bank transfer example.",
    a: "Atomicity: Money debit from Account A and credit to Account B both succeed, or both fail. Consistency: Total account balance stays valid. Isolation: Concurrent transfers don't read intermediate half-done states. Durability: Once transfer completes, bank balance change persists even during power outage."
  },
  {
    category: "Normalization",
    q: "How to identify if a relation is in 3NF or BCNF?",
    a: "For FD X -> Y: If X is a Super Key or Y is a Prime Attribute (part of candidate key), it is in 3NF. In BCNF, X MUST ALWAYS be a Super Key (no exceptions for prime attributes)."
  }
];
