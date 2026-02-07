// look you cant config this the same way we did for client because
// you can use the same but the thing is it is design for browser first and limited possiblity but here in the server side more cntrol and not browser first
// the things is here we are doing the same thing but core engine is optimised for node
// in the client we are importing from appwrite

// we have to use SDK for that
import env from '@/app/env'
import { Client, Avatars, Databases, Storage, Users } from 'node-appwrite';

// here client is the endpoint or instance throug which we are taking to the database
let client = new Client();

client
    .setEndpoint(env.appwrite.endpoint) // Your API Endpoint
    .setProject(env.appwrite.projectId) // Your project ID
    .setKey(env.appwrite.apiKey) // Your secret API key

const users = new Users(client)
const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

export { users, client, databases, storage, avatars };