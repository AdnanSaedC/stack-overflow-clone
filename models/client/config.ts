import env from '@/app/env';

// Avatars is a light weight version of images
// databases for normal data storing and storage to save images and videos
import { Client, Account, Avatars, Databases, Storage } from 'appwrite';


const client = new Client()

client
    .setEndpoint(env.appwrite.endpoint)
    .setProject(env.appwrite.projectId);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

export { account, client, databases, storage, avatars };

