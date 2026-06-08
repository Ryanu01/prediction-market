import express from "express"
import cors from "cors";
import nacl from "tweetnacl";
import bs58 from "bs58"
import jwt from "jsonwebtoken"
const app = express()

app.use(express.json())
app.use(cors())


app.post("/auth/wallet", (req, res) => {
    try {
        const {publicKey, message, signature} = req.body
        
        const verified = nacl.sign.detached.verify(new TextEncoder().encode(message), bs58.decode(signature), bs58.decode(publicKey))

        if (!verified) {
            return res.status(401).json({
                message: "Invalid signature",
            });
        }

        const token = jwt.sign(
            {
                publicKey
            },
            process.env.JWT_SECRET!
        )

        return res.status(200).json({
            token
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error while signing"
        })
    }
})


app.listen(3001, () => {
    console.log("running")
})