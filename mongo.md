# Lab Session 12: MongoDB Aggregation (Live Demo Script)

**Course:** CSA4604 MERN Stack Lab | **Maps to:** Experiment 11 (Query Modifiers and Aggregation), session-wise plan P13
**Prepared:** Oct 11, 2026 | **Follows:** Session 11 (install, CRUD, query operators)

## How to use this

This is a **script for you to run on the projector, not a worksheet for students.** For each challenge:

1. Read the one-line story to the class.
2. **Paste the command block** into mongosh.
3. Explain using the "Say" lines, in your own words.
4. Mention the "Watch for" point.

Students only need to watch, and anyone who wants to can follow along on their own machine. Nothing is assigned or marked.

**Starting it:** open a terminal, run `mongosh`, then paste the Setup block. If anything gets messy during class, paste the Setup block again. It wipes and recreates the data.

**About pasting:** each block is meant to be pasted whole, and mongosh normally accepts multi-line paste. If a block ever misbehaves on your terminal, paste it one statement at a time instead.

**Time:** there are 10 paste blocks. At about 8 minutes each with explaining, that is roughly 80 minutes; adjust to your lab length. If you are short on time, skip Challenge 7 (it only adds `$max` and `$min` to what Challenge 5 already showed). **Don't skip Challenge 8**; it is the one students will remember.

**What students learn by the end:**
- Query modifiers: `sort`, `limit`, `skip`
- Aggregation as a pipeline: `$match`, `$group`, `$sort`
- Summary tools: `$sum`, `$avg`, `$max`, `$min`
- Real data can be wrong, and MongoDB will not tell you

---

## Setup: put the class into the database

**Story:** Before anything else, we need students to look at. We will make a small class of 12.

**Paste this:**
```js
db = db.getSiblingDB('campus')
db.students.drop()
db.students.insertMany([
  { name: 'Aarav', dept: 'CSE', city: 'Bengaluru', marks: 78, attendance: 92 },
  { name: 'Diya', dept: 'IT', city: 'Mysuru', marks: 85, attendance: 88 },
  { name: 'Ravi', dept: 'CSE', city: 'Bengaluru', marks: 62, attendance: 70 },
  { name: 'Sara', dept: 'AIDS', city: 'Hubballi', marks: 91, attendance: 95 },
  { name: 'Kabir', dept: 'IT', city: 'Mysuru', marks: 55, attendance: 60 },
  { name: 'Meera', dept: 'AIDS', city: 'Bengaluru', marks: 73, attendance: 82 },
  { name: 'Imran', dept: 'CSE', city: 'Mysuru', marks: 88, attendance: 78 },
  { name: 'Ananya', dept: 'IT', city: 'Bengaluru', marks: 69, attendance: 91 },
  { name: 'Rohan', dept: 'AIDS', city: 'Hubballi', marks: 94, attendance: 65 },
  { name: 'Zoya', dept: 'CSE', city: 'Hubballi', marks: 47, attendance: 72 },
  { name: 'Karthik', dept: 'IT', city: 'Bengaluru', marks: 81, attendance: 85 },
  { name: 'Priya', dept: 'AIDS', city: 'Mysuru', marks: 76, attendance: 89 }
])
```

**You will see:** A short confirmation: `acknowledged: true` and a list of 12 `insertedIds`.

**Say:** We just created a database called campus and filled a collection called students with 12 documents. Think of a collection as a table and each document as one row.

**Watch for:** The ids are just MongoDB tagging each row. Nothing to read there; say "it worked" and move on.

---

## Challenge 1: Take a look at what we have

**Story:** Always look at your data before you do anything with it.

**Paste this:**
```js
db.students.countDocuments()
db.students.findOne()
```

**You will see:** Prints `12`, then one student document (Aarav) with a long `_id` before it.

**Say:** countDocuments says how many rows. findOne shows one example row, so we know what fields exist: name, dept, city, marks, attendance.

**Watch for:** The `_id` that MongoDB added by itself. It is the unique tag on every document.

---

## Challenge 2: Who are the top 3 scorers?

**Story:** The HOD wants the top 3 students for the notice board.

**Paste this:**
```js
db.students.find({}, { _id: 0, name: 1, marks: 1 }).sort({ marks: -1 }).limit(3)
```

**You will see:**
```js
[
  { name: 'Rohan', marks: 94 },
  { name: 'Sara', marks: 91 },
  { name: 'Imran', marks: 88 }
]
```

**Say:** Three small pieces are chained together. The second part, { _id: 0, name: 1, marks: 1 }, picks which fields to show. sort puts them in order, and -1 means biggest first. limit(3) keeps only the first three.

**Watch for:** Say it out loud: "sort first, then take the top 3". The order of ideas matters.

---

## Challenge 3: Page 2 of the class list

**Story:** The class list prints 4 names per page. We need the second page.

**Paste this:**
```js
db.students.find({}, { _id: 0, name: 1 }).sort({ name: 1 }).skip(4).limit(4)
```

**You will see:**
```js
[
  { name: 'Kabir' },
  { name: 'Karthik' },
  { name: 'Meera' },
  { name: 'Priya' }
]
```

**Say:** Same idea, plus skip(4), which jumps over the first 4. So page 1 is skip(0), page 2 is skip(4), page 3 is skip(8). Names are sorted A to Z here (1 means smallest first).

**Watch for:** Ask the class: "what would we change to get page 3?" Answer: skip(8).

---

## Challenge 4: How many students in each department?

**Story:** This is the first real "aggregate". We are not asking for students any more. We are asking for a summary.

**Paste this:**
```js
db.students.aggregate([
  { $group: { _id: '$dept', total: { $sum: 1 } } }
])
```

**You will see:**
```js
[
  { _id: 'CSE', total: 4 },
  { _id: 'IT', total: 4 },
  { _id: 'AIDS', total: 4 }
]
```

*Mongo may print the three departments in a different order than shown. That is normal; the numbers are what matter.*

**Say:** find gives you students. aggregate gives you a summary. $group says: put students into buckets by dept. For each bucket, add 1 for every student, and call that total. The $dept with a dollar sign means "the value of the dept field".

**Watch for:** The `_id` in the output is the department name. It is not a student id here. It is just where $group puts the thing you grouped by. This confuses everyone once, so say it now.

---

## Challenge 5: Average marks per department, best first

**Story:** Which department is doing best overall?

**Paste this:**
```js
db.students.aggregate([
  { $group: { _id: '$dept', average: { $avg: '$marks' } } },
  { $sort: { average: -1 } }
])
```

**You will see:**
```js
[
  { _id: 'AIDS', average: 83.5 },
  { _id: 'IT', average: 72.5 },
  { _id: 'CSE', average: 68.75 }
]
```

**Say:** Draw a conveyor belt. Students go in one end. Each box in the square brackets is a station on the belt. Station 1 groups and averages. Station 2 sorts the result. Whatever comes out of one station is what goes into the next one.

**Watch for:** The word "pipeline". An aggregate is a list of stages, run top to bottom.

---

## Challenge 6: Only Bengaluru students, average per department

**Story:** The Bengaluru alumni club wants numbers for just their city.

**Paste this:**
```js
db.students.aggregate([
  { $match: { city: 'Bengaluru' } },
  { $group: { _id: '$dept', average: { $avg: '$marks' }, students: { $sum: 1 } } }
])
```

**You will see:**
```js
[
  { _id: 'CSE', average: 70, students: 2 },
  { _id: 'AIDS', average: 73, students: 1 },
  { _id: 'IT', average: 75, students: 2 }
]
```

*Output order may differ.*

**Say:** $match is a filter station. It lets only Bengaluru students through. Then the group station works on just those. Notice we also asked for two numbers in one group: the average and how many students.

**Watch for:** Ask: "what if we put $match AFTER the $group?" It would return nothing, because by then there are no cities left, only departments. Order of stations matters.

---

## Challenge 7: Best, worst and average, all in one go

**Story:** One report with everything the HOD asked for.

**Paste this:**
```js
db.students.aggregate([
  { $group: {
      _id: '$dept',
      students: { $sum: 1 },
      average: { $avg: '$marks' },
      highest: { $max: '$marks' },
      lowest: { $min: '$marks' }
  } },
  { $sort: { highest: -1 } }
])
```

**You will see:**
```js
[
  {
    _id: 'AIDS',
    students: 4,
    average: 83.5,
    highest: 94,
    lowest: 73
  },
  {
    _id: 'CSE',
    students: 4,
    average: 68.75,
    highest: 88,
    lowest: 47
  },
  { _id: 'IT', students: 4, average: 72.5, highest: 85, lowest: 55 }
]
```

**Say:** A single $group can calculate many things at once: $sum, $avg, $max, $min. This is the whole toolbox for summaries.

**Watch for:** Nothing new here. It is a good moment to let them see that they already understand all the pieces.

---

## Challenge 8: Something looks wrong (real-world data)

**Story:** A new student, Yusuf, was added by a clerk in a hurry. Then we ask the top 3 question again.

**Paste this:**
```js
db.students.insertOne({ name: 'Yusuf', dept: 'CSE', city: 'Mysuru', marks: '90', attendance: 80 })

db.students.find({}, { _id: 0, name: 1, marks: 1 }).sort({ marks: -1 }).limit(3)
```

**You will see:**
```js
[
  { name: 'Yusuf', marks: '90' },
  { name: 'Rohan', marks: 94 },
  { name: 'Sara', marks: 91 }
]
```

**Say:** Stop and ask the class: "Is this right?" Yusuf is listed first, but Rohan scored 94. Look closely at Yusuf: marks is "90" in quotes. That is TEXT, not a number. MongoDB sorts text above numbers, so Yusuf jumped to the top.

**Watch for:** This is the lesson: the database does not warn you. It does exactly what you asked, and the answer is still wrong. Always look at results with your own eyes.

---

## Challenge 8, part 2: Find the bad record and fix it

**Story:** Now we find every record where marks is text, and repair it.

**Paste this:**
```js
db.students.find({ marks: { $type: 'string' } }, { _id: 0, name: 1, marks: 1 })

db.students.updateOne({ name: 'Yusuf' }, { $set: { marks: 90 } })

db.students.find({}, { _id: 0, name: 1, marks: 1 }).sort({ marks: -1 }).limit(3)
```

**You will see:** Prints the one bad record (Yusuf, marks: '90'), then an update result, then the corrected top 3.

**Then, after the fix, the top 3 becomes:**
```js
[
  { name: 'Rohan', marks: 94 },
  { name: 'Sara', marks: 91 },
  { name: 'Yusuf', marks: 90 }
]
```

**Say:** $type: 'string' finds every record where marks is text. updateOne with $set replaces the value, and this time 90 has no quotes, so it is a number. Run the top-3 again and Rohan (94) is first where he belongs.

**Watch for:** The same query gives a different answer now because the data was fixed, not the query.

---

## One-slide recap to put on the board at the end

| I want to... | I use... |
|---|---|
| Put results in order | `.sort({ field: 1 })` (smallest first) or `-1` (biggest first) |
| Only the first few | `.limit(n)` |
| Skip some (pages) | `.skip(n)` |
| Make a summary instead of a list | `db.students.aggregate([ ... ])` |
| Filter inside a pipeline | `{ $match: { ... } }` |
| Group into buckets | `{ $group: { _id: '$field', ... } }` |
| Count, add up, average, biggest, smallest | `$sum`, `$avg`, `$max`, `$min` |

**One sentence to end with:** "The database does what you ask, not what you mean. Always look at your results."

## Next session idea (same style)

Same format with a new story and new paste blocks: employee data (Experiment 12), then adding an index and showing a query get faster. Tell me when you want it built.