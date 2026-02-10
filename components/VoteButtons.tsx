"use client";

import { databases } from "@/models/client/config";
import { dbName, voteCollections } from "@/models/name";
import { cn } from "@/lib/utils";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react";
import { ID, Models, Query } from "appwrite";
import { useRouter } from "next/navigation";
import React from "react";
import { useAuthStore } from "@/store/auth";


const VoteButtons = async (
    {
        type,
        id,
        upvotes,
        downvotes,
        className,
    }:
        {
            type: "answer" | "question",
            id: string,
            upvotes: Models.DocumentList<Models.Document>,
            downvotes: Models.DocumentList<Models.Document>,
            className?: string
        }
) => {

    const [votedDocument, setVotedDocument] = React.useState<Models.Document | null>()
    const [voteResult, setVoteResult] = React.useState<number>(upvotes.total - downvotes.total)

    const { user } = useAuthStore()
    const router = useRouter()

    React.useEffect(() => {
        const fetchVote = async () => {
            if (user) {
                const response = await databases.listDocuments(dbName, voteCollections, [
                    Query.equal("type", type),
                    Query.equal("typeId", id),
                    Query.equal("votedById", user.$id),
                ]);
                setVotedDocument(() => response.documents[0] || null);
            }
        }
        fetchVote()
    }, [user, id, type])

    const toggleUpvote = async () => {
        if (!user) return router.push("/login");

        if (votedDocument === undefined) return;

        try {
            const response = await fetch(`/api/vote`, {
                method: "POST",
                // stringify craetes a json object
                body: JSON.stringify({
                    votedById: user.$id,
                    voteStatus: "upvoted",
                    type,
                    typeId: id,
                }),
            });

            const data = await response.json();

            // it will throw the result as an exception
            if (!response.ok) throw data;

            setVoteResult(() => data.data.voteResult);
            setVotedDocument(() => data.data.document);
        } catch (error: any) {
            window.alert(error?.message || "Something went wrong");
        }
    };

    const toggleDownvote = async () => {

        if (!user) return

        if (votedDocument === undefined) return

        try {
            const response = await fetch(`/api/vote`, {
                method: "POST",
                body: JSON.stringify({
                    votedById: user.$id,
                    voteStatus: "downvoted",
                    type,
                    typeId: id,
                }),
            })

            const data = await response.json()

            if (!response.ok) throw data

            setVoteResult(() => data.data.voteResult);
            setVotedDocument(() => data.data.document);

        }
        catch (error: any) {
            window.alert(error?.message || "Something went wrong");
        }
    }

    return (
        <div className={cn("flex shrink-0 flex-col items-center justify-start gap-y-4", className)}>
            <button
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
                    votedDocument && votedDocument!.voteStatus === "upvoted"
                        ? "border-orange-500 text-orange-500"
                        : "border-white/30"
                )}
                onClick={toggleUpvote}
            >
                <IconCaretUpFilled />
            </button>
            <span>{voteResult}</span>
            <button
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
                    votedDocument && votedDocument.voteStatus === "downvoted"
                        ? "border-orange-500 text-orange-500"
                        : "border-white/30"
                )}
                onClick={toggleDownvote}
            >
                <IconCaretDownFilled />
            </button>
        </div>
    );
};

export default VoteButtons;
