"use client";

import { databases } from "@/models/client/config";
import { commentCollections, dbName } from "@/models/name";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils"
import convertDateToRelativeTime from "@/utils/relativeTime";

// turns name into url
import slugify from "@/utils/slugify";


import { IconTrash } from "@tabler/icons-react";
import { ID, Models } from "appwrite";
import Link from "next/link";
import React from "react";
import { data } from "framer-motion/client";

const Comment = (
    {
        comments: _comments,
        type,
        typeId,
        className,
    }:
        {
            comments: Models.DocumentList<Models.Document>
            type: "answer" | "question",
            typeId: string,
            className?: string
        }
) => {

    const [comments, setComments] = React.useState(_comments)
    const [newComment, setNewComment] = React.useState("")
    const { user } = useAuthStore()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!newComment || !user) return

        try {
            const response = await databases.createDocument(dbName, commentCollections, ID.unique(),
                {
                    content: newComment,
                    type,
                    typeId,
                    authorId: user.$id
                }
            )

            setNewComment(() => "")
            setComments(prev => prev ? ({
                total: prev!.total + 1,
                documents: [{ ...response, author: user }, ...prev!.documents]
            }) : prev)
        } catch (error: any) {
            window.alert(error?.message || "Error creating comment");
        }
    }

    const deleteComment = async (commentId: string) => {
        try {
            const response = await databases.deleteDocument(dbName, commentCollections, commentId)

            setComments(
                (prev) => prev ? ({
                    total: prev!.total,
                    documents: prev.documents.filter(eachCommnet => eachCommnet.$id !== commentId)
                }) : prev
            )
        } catch (error: any) {
            window.alert(error?.message || "Error deleting comment");
        }
    }

    return (
        <div className={cn("flex flex-col gap-2 pl-4", className)}>
            {comments?.documents.map(
                // each comment
                comment => (
                    // react.fragment allows us to export without div and <>
                    <React.Fragment key={comment.$id}>
                        <hr className="border-white/40" />
                        <div className="flex gap-2">
                            <p className="text-sm">
                                {comment?.content} -{" "}
                                <Link
                                    href={`/users/${comment.authorId}/${slugify(comment.author.name)}`}
                                    className="text-orange-500 hover:text-orange-600"
                                >
                                    {comment.author.name}
                                </Link>{" "}
                                <span className="opacity-60">
                                    {convertDateToRelativeTime(new Date(comment.$createdAt))}
                                </span>
                            </p>
                            {user?.$id === comment.authorId ? (
                                <button
                                    onClick={() => deleteComment(comment.$id)}
                                    className="shrink-0 text-red-500 hover:text-red-600"
                                >
                                    <IconTrash className="h-4 w-4" />
                                </button>
                            ) : null}
                        </div>
                    </React.Fragment>
                ))}
            <hr className="border-white/40" />
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <textarea
                    className="w-full rounded-md border border-white/20 bg-white/10 p-2 outline-none"
                    rows={1}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={e => setNewComment(() => e.target.value)}
                />
                <button className="shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600">
                    Add Comment
                </button>
            </form>
        </div>
    );
}

export default Comment;

