import { dbName } from "../name";
import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comment.collection";
import { databases } from "./config";
import createQuestionCollection from "./question.collection";
import createVoteCollection from "./vote.collection";

export default async function getOrCreateDatabases() {
    try {
        await databases.get(dbName);
        console.log("DataBase connected ")
    } catch (error) {
        try {

            await databases.create(dbName, dbName)
            console.log("database craeted successfully")

            await Promise.all([
                createVoteCollection(),
                createAnswerCollection(),
                createQuestionCollection(),
                createCommentCollection()
            ])

            console.log("all the connection are craeted")
            console.log("databases connected successfully")
        } catch (error) {
            console.log("error while creating or connecting to the database", error)
        }
    }

    return databases
}