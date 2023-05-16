import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

import { fetchRedis } from "@/helpers/redis"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email: emailToAdd } = addFriendValidator.parse(body.email)

    const idToAdd=await fetchRedis("get", `user:email:${emailToAdd}`) as string

    if (!idToAdd) {
      return new Response("This person does not exist.", { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (idToAdd === session.user.id) {
      return new Response("You cannot add yourself as a friend.", { status: 400 })
    }

    // check if user already added
    const isAlreadyAdded = await fetchRedis("sismember", `user:${idToAdd}:incoming_friend_requests`, session.user.id) as 0 | 1
    if (isAlreadyAdded) {
      return new Response("Already added this user.", { status: 400 })
    }

    // check if user already added
    const isAlreadyFriends = await fetchRedis("sismember", `user:${session.user.id}:friends`, idToAdd) as 0 | 1
    if (isAlreadyFriends) {
      return new Response("Already friends.", { status: 400 })
    }

    // Valid request
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

    return new Response("OK")
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload.", { status: 422 })
    }

    return new Response("Invalid request.", { status: 400 })
  }
}