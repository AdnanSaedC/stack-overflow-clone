import { Permission } from "node-appwrite";
import { dbName, voteCollections } from "../name";
import { databases } from "./config";

export default async function createVoteCollection() {
    await databases.createCollection(dbName, voteCollections, voteCollections,
        [
            Permission.read("any"),
            Permission.create("users"),
            Permission.update("users"),
            Permission.delete("users"),
            Permission.read("users"),
        ]
    )

    console.log("Vote collection created successfully")

    // craeting attributes
    await Promise.all([
        databases.createEnumAttribute(dbName, voteCollections, "type",
            [
                "answer", "question"
            ],
            true,
        ),
        databases.createStringAttribute(dbName, voteCollections, "typeId", 50, true), //this is store the id of question or answer
        databases.createEnumAttribute(dbName, voteCollections, "voteStatus",
            [
                "upVoted", "downVoted"
            ], true
        ),
        databases.createStringAttribute(dbName, voteCollections, "votedById", 50, true)
    ])

    console.log("vote collection attribute created successfully")
}