import { Permission } from "node-appwrite";
import { commentCollections, dbName } from "../name";
import { databases } from "./config";

export default async function createCommentCollection() {
    await databases.createCollection(dbName, commentCollections, commentCollections,
        [
            Permission.read("any"),
            Permission.read("users"),
            Permission.create("users"),
            Permission.update("users"),
            Permission.delete("users"),
        ]
    )

    console.log("Comment collection created successfully")

    await Promise.all([
        databases.createStringAttribute(dbName, commentCollections, "content", 10000, true),
        // what is enum it is nothing but it can store only predefined values nothing else
        databases.createEnumAttribute(dbName, commentCollections, "type", ["answer", "question"], true),
        databases.createStringAttribute(dbName, commentCollections, "typeId", 50, true),
        databases.createStringAttribute(dbName, commentCollections, "authorId", 50, true),
    ])
    console.log("Comment collection attributes created successfully")
}