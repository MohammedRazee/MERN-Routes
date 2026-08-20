import express from "express"
import path from "path"


const app = express()
const port = 3000
const __dirname = import.meta.dirname

app.use(express.static("public"))

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

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "templates/index.html"))
})

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "templates/about.html"))
})

app.get("/search", (req, res) => {
    const item = req.query.genre.toLowerCase()
    let results = []

    movies.forEach((movie) => {
        if (movie.genre.toLowerCase() === item) {
            results.push(movie.title)
        }
    })

    let html = `<h1>Movies searched for the genre ${item}</h1><ul>`
    results.forEach((title) => {
        html += `<li>${title}</li>`
    })
    html += `</ul>`
    res.send(html)
})

app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "templates/contact.html"))
})

app.listen(port, (req, res) => {
    console.log(`Listening on http://localhost:${port}`)
})
