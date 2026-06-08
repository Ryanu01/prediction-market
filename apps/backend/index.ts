import express from "express"
import cors from "cors";
import authRoute from "./routes/auth/auth"
import { authMiddleware } from "./middlewares/authMiddleware";
const app = express()

app.use(express.json())
app.use(cors())


app.use(authRoute)

app.post("/buy", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "BUY"
    })
})

app.listen(3001, () => {
    console.log("running")
})