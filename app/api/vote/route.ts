import { answerCollections, dbName, questionCollections, voteCollections } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

// the thing here we are not focusing on increasing repuation of user but the author
// here we are focusing on the reputation of the author

export async function POST(request: NextRequest) {
    try {
        const { type, typeId, voteStatus, votedById } = await request.json()

        // lets get the document 
        // who is voting
        const response = await databases.listDocuments(dbName, voteCollections,
            [
                // equal means matching
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("votedById", votedById)
            ]
        )
        // look now we have all the document which matches the user vote(either up or downvotes)

        // the first case which first time upvoting or changing the previous vote
        // since each user can make only one vote that why first document

        // checking whether the vote exist if not then create the vote else delete the vote / modify the vote

        // vote exist
        if (response.documents.length > 0) {
            // we have deleted the vote now
            await databases.deleteDocument(dbName, voteCollections, response.documents[0].$id);

            // now lets update the reputation
            const documentWhichWasVoted = await databases.getDocument(
                dbName,
                type === "question" ? questionCollections : answerCollections,
                typeId
            )

            // let get the author of the doc
            const authorPrefs = await users.getPrefs<UserPrefs>(documentWhichWasVoted.authorId)

            await users.updatePrefs<UserPrefs>(documentWhichWasVoted.authorId, {
                reputation:
                    response.documents[0].voteStatus === "upvoted"
                        ? Number(authorPrefs.reputation) - 1
                        : Number(authorPrefs.reputation) + 1,
            });
        }

        // vote not exist
        const existingVoteStatus = response.documents[0].voteStatus || undefined
        if (existingVoteStatus !== voteStatus) {
            // if the vote doenot exist exist for the first time then it would be undefined !== voteSTatus (true)
            // now the thing is vote is changed

            const newVote = await databases.createDocument(dbName, voteCollections, ID.unique(),
                {
                    type,
                    typeId,
                    voteStatus,
                    votedById
                }
            )

            // look the vote can happen for the answer or for the question
            const documentWhichGotVoted = await databases.getDocument(dbName,
                type === "answer" ? answerCollections : questionCollections,
                typeId
            )

            // lets get the author who question or answer got voted
            const authorPref = await users.getPrefs<UserPrefs>(documentWhichGotVoted.authorId)

            if (response.documents[0]) {
                // if there was existing answer and it got downvoted then reduce the reputation of the author who made the vote
                // look the focus here is on the author the number of upvote and downvote we will figure it out using the number of doc

                await users.updatePrefs<UserPrefs>(documentWhichGotVoted.authorId,
                    {
                        // if the prev vote was upvote now removing the vote removes author reputation
                        reputation: response.documents[0].voteStatus == "upvoted" ? Number(authorPref.reputation) - 1 : Number(authorPref.reputation) + 1
                    }
                )
            }
            else {
                // now a new vote is created
                await users.updatePrefs<UserPrefs>(documentWhichGotVoted.authorId,
                    {
                        reputation: newVote.voteStatus == "upvoted" ? Number(authorPref.reputation) + 1 : Number(authorPref.reputation) - 1
                    }
                )
            }

            const [upvotes, downvotes] = await Promise.all([
                databases.listDocuments(dbName, voteCollections, [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "upvoted"),
                    Query.limit(1), // for optimization as we only need total
                ]),
                databases.listDocuments(dbName, voteCollections, [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "downvoted"),
                    Query.limit(1), // for optimization as we only need total
                ]),
            ]);

            return NextResponse.json(
                {
                    data: { document: documentWhichGotVoted, voteResult: upvotes.total - downvotes.total },
                    message: response.documents[0] ? "Vote Status Updated" : "Voted",
                },
                {
                    status: 201,
                }
            );

        }

        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(dbName, voteCollections, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "upvoted"),
                Query.limit(1), // for optimization as we only need total
            ]),
            databases.listDocuments(dbName, voteCollections, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "downvoted"),
                Query.limit(1), // for optimization as we only need total
            ]),
        ]);

        return NextResponse.json(
            {
                data: {
                    document: null, voteResult: upvotes.total - downvotes.total
                },
                message: "Vote Withdrawn",
            },
            {
                status: 200,
            }
        );

    } catch (error: any) {
        return NextResponse.json(
            {
                error: error.message || "Error in voting"
            },
            {
                status: 500
            }
        )
    }

}