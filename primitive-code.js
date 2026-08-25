import {createServer} from "http"
import {readFile} from "fs"
import path from "path"

const port = 3000
const __dirname = import.meta.dirname

const server = createServer((req, res) => {
    if (req.url == "/") {
        readFile(path.join(__dirname, "templates/index.html"), (err, data) => {
            res.writeHead(200, {"Content-Type": "text/html"})
            res.end(data)
        })
        
    } else if(req.url == "/about") {
        readFile(path.join(__dirname, "templates/about.html"), (err, data) => {
            res.writeHead(200, {"Content-Type": "text/html"})
            res.end(data)
        })
    } else if(req.url == "/contact") {
        readFile(path.join(__dirname, "templates/contact.html"), (err, data) => {
            res.writeHead(200, {"Content-Type": "text/html"})
            res.end(data)
        })
    } else {
        res.writeHead(404, {"Content-Type": "text/html"})
        res.end("<h1>File not Found</h1>")
    }
})

server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})

