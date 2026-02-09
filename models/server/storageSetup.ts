import { Permission } from "node-appwrite";
import { questionAttachmentBucket } from "../name";
import { storage } from "./config";

export default async function getOrCreateStorage() {
    try {
        await storage.getBucket({ bucketId: questionAttachmentBucket });
        console.log("Storage connected successfully")
    } catch (error) {

        try {
            await storage.createBucket(
                questionAttachmentBucket,
                questionAttachmentBucket,
                [
                    Permission.read("any"),
                    Permission.create("users"),
                    Permission.read("users"),
                    Permission.update("users"),
                    Permission.delete("users"),
                ],
                false,
                undefined,
                undefined,
                [
                    "jpg", "png", "gif", "jpeg", "webp", "heic"
                ],

            )

            console.log("Storage Created")
            console.log("Storage connected")
        } catch (error) {
            console.log("Error in connecting to the bucket otr craeting bucket", error)
        }
    }
}