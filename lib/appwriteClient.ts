// lib/appwriteClient.ts
import { Client, Account, Databases, Storage } from "appwrite";

// Browser-safe Appwrite client (no API key here)
const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("69385513000eab86c117");

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
