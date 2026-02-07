
import { IndexType, OrderBy, Permission } from "node-appwrite";
import { dbName, questionCollections } from "../name";
import { databases } from "./config";

// for crating the databasee dbName,collectionName,collectionName and permissions

export default async function createQuestionCollection() {
    await databases.createCollection(dbName, questionCollections, questionCollections,
        [
            // there are two types of users first is any they can read but not legged in but user are the one who are logged in
            Permission.read("any"),
            Permission.read("users"),
            Permission.create("users"),
            Permission.update("users"),
            Permission.delete("users"),
        ]
    )

    console.log("question collection created successfully")

    // creating attributes
    // we have to create attributes for question collection everything is await thus
    await Promise.all(
        [
            // the thing db,collection,colName,size,required/not,defaultvalue,arrayOfValue or not
            databases.createStringAttribute(dbName, questionCollections, "title", 100, true),
            databases.createStringAttribute(dbName, questionCollections, "content", 10000, true),
            databases.createStringAttribute(dbName, questionCollections, "authorId", 50, true),
            databases.createStringAttribute(dbName, questionCollections, "tags", 50, true, undefined, true),
            databases.createStringAttribute(dbName, questionCollections, "attachmentId", 50, false),
        ]
    )

    console.log("Question collections attributes created")

    // craeteIndex function takes these parameter
    // databaseId,collectionId,key,type,attributes,orders

    await Promise.all([
        databases.createIndex(dbName, questionCollections, "title", IndexType.Fulltext, ["title"], [OrderBy.Asc]),
        databases.createIndex(dbName, questionCollections, "content", IndexType.Fulltext, ["content"], [OrderBy.Asc])
    ])

    console.log("Question collections index created")
}