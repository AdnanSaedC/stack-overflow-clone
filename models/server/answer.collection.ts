import { Permission } from "node-appwrite";
import { answerCollections, dbName } from "../name";
import { databases } from "./config";


export default async function createAnswerCollection() {
    await databases.createCollection(dbName, answerCollections, answerCollections,
        [
            Permission.read("any"),
            Permission.read("users"),
            Permission.create("users"),
            Permission.update("users"),
            Permission.delete("users"),
        ]
    )

    console.log("Answer collection created successfully")

    // lets craete attributes for this
    await Promise.all([
        await databases.createStringAttribute(dbName, answerCollections, "content", 100000, true),
        await databases.createStringAttribute(dbName, answerCollections, "questionId", 50, true),
        await databases.createStringAttribute(dbName, answerCollections, "authorId", 50, true),
    ])

    console.log("Answer collection attributes created successfully")
}