import express from "express"
import path from "path"

const app = express()
const port = 3000
const __dirname = import.meta.dirname

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// ---------- MIDDLEWARE: request logger (application-level) ----------
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
    next()
})

const movies = [
    // Sci-Fi
    { id: 1, title: "The Matrix", genre: "Sci-Fi" },
    { id: 2, title: "Inception", genre: "Sci-Fi" },
    { id: 3, title: "Interstellar", genre: "Sci-Fi" },

    // Tragedy
    { id: 4, title: "Macbeth", genre: "Tragedy" },
    { id: 5, title: "Hamlet", genre: "Tragedy" },
    { id: 6, title: "Requiem for a Dream", genre: "Tragedy" },

    // Crime
    { id: 7, title: "The Godfather", genre: "Crime" },
    { id: 8, title: "Goodfellas", genre: "Crime" },
    { id: 9, title: "Pulp Fiction", genre: "Crime" },

    // Romance
    { id: 10, title: "Titanic", genre: "Romance" },
    { id: 11, title: "The Notebook", genre: "Romance" },
    { id: 12, title: "Pride and Prejudice", genre: "Romance" },
]
let nextId = 13

// ---------- MIDDLEWARE: validation, only wired into routes that need it ----------
function validateMovie(req, res, next) {
    const { title, genre } = req.body
    if (!title || !genre) {
        // 400 — the request itself is malformed, before we even touch the data
        return res.status(400).json({ message: "title and genre are both required" })
    }
    next()
}

// ============ PAGE ROUTES (serve the existing templates as-is) ============

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "templates/index.html"))
})

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "templates/about.html"))
})

app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "templates/contact.html"))
})

app.get("/newmovie", (req, res) => {
    res.sendFile(path.join(__dirname, "templates/newmovie.html"))
})

// ============ SEARCH (query string — filtering, not a single resource) ============
// Note for class discussion: /search is a GET with a query string, which is the
// right call for "filter a collection" — but it's an *action name*, not a noun.
// Compare against /movie/:id below, which IS resource-based. Worth asking
// students "is /search RESTful?" as a discussion prompt.

app.get("/search", (req, res) => {
    const genre = req.query.genre
    const results = movies.filter(
        m => m.genre.toLowerCase() === String(genre).toLowerCase()
    )

    const rows = results
        .map(m => `<li>${m.title} (${m.genre})</li>`)
        .join("")

    res.status(200).send(`
        <h1>Results for "${genre}"</h1>
        <ul>${rows || "<li>No movies found</li>"}</ul>
        <a href="/">Back home</a>
    `)
})

// ============ CREATE — traditional form POST (matches newmovie.html) ============
// Idempotency note: POST is NOT idempotent. Submitting this form twice
// creates two movies, which is exactly what students should expect from POST.

app.post("/addmovie", validateMovie, (req, res) => {
    const newMovie = { id: nextId++, title: req.body.title, genre: req.body.genre }
    movies.push(newMovie)

    console.log("CREATED:", newMovie)
    console.log("Movies array now:", movies)

    res.redirect("/") // classic form-POST pattern: create, then redirect
})

// ============ RESOURCE-BASED ROUTES: /movie/:id ============
// This is the REST-y half of the app: a noun (movie) + an id, with the HTTP
// verb carrying all the meaning. Matches the fetch() calls already written
// in index.html's <script> block.

app.get("/movie/:id", (req, res) => {
    const movie = movies.find(m => m.id === Number(req.params.id))
    if (!movie) return res.status(404).json({ message: "Movie not found" })
    res.status(200).json(movie)
})

app.put("/movie/:id", validateMovie, (req, res) => {
    const movie = movies.find(m => m.id === Number(req.params.id))
    if (!movie) return res.status(404).json({ message: "Movie not found" })

    const before = { ...movie } // snapshot so we can show old vs new in the terminal

    // Idempotency note: PUT IS idempotent — sending the same body 5 times
    // leaves the movie in the same state as sending it once.
    Object.assign(movie, { title: req.body.title, genre: req.body.genre })

    console.log("UPDATED:")
    console.log("  before:", before)
    console.log("  after: ", movie)

    res.status(200).json({ message: `Updated movie ${movie.id} to "${movie.title}"`, movie })
})

app.delete("/movie/:id", (req, res) => {
    const index = movies.findIndex(m => m.id === Number(req.params.id))
    if (index === -1) return res.status(404).json({ message: "Movie not found" })

    const [deleted] = movies.splice(index, 1)

    console.log("DELETED:", deleted)
    console.log("Movies array now:", movies)

    res.status(200).json({ message: `Deleted "${deleted.title}"`, movie: deleted })
})

// ============ 404 catch-all for anything unmatched ============
app.use((req, res) => {
    res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` })
})

// ============ ERROR-HANDLING MIDDLEWARE (4 args = special to Express) ============
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: "Something went wrong on the server" })
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})