import { answerCollections, dbName } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/auth";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {

        const { answer, questionId, authorId } = await request.json()

        const response = await databases.createDocument(dbName, answerCollections, ID.unique(),
            {
                content: answer,
                questionId,
                authorId
            }
        )

        // now lets incraese the reputation of author
        // so the thing is get the prefence of this author and it is of this type
        const currentAuthorPref = await users.getPrefs<UserPrefs>(authorId)
        await users.updatePrefs(authorId,
            {
                reputation: Number(currentAuthorPref.reputation) + 1
            })

        return NextResponse.json(
            {
                data: response
            }
            , {
                status: 201
            }
        )

    } catch (error: any) {
        console.log("Error in answer route", error)
        return NextResponse.json(
            { error: error?.message || "Internal server error in api/answer" }, { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {

        const { answerId } = await request.json()

        const answer = await databases.getDocument(dbName, answerCollections, answerId)
        if (!answer) {
            console.log("answer not found")
            return NextResponse.json({ message: "answer not found" }, { status: 300 })
        }

        const response = await databases.deleteDocument(dbName, answerCollections, answerId)

        // lets reduce the reputation
        const currentAuthorPref = await users.getPrefs<UserPrefs>(answer.authorId)
        await users.updatePrefs(answer.authorId,
            {
                reputation: Number(currentAuthorPref.reputation) - 1
            })

        return NextResponse.json(
            {
                data: response
            },
            {
                status: 200
            }
        )

    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Error while deleting the answer" },
            { status: 500 }
        )
    }
}