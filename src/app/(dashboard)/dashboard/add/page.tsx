import React, { FunctionComponent } from "react"
import AddFriendButton from "@/components/AddFriendButton"

interface OwnProps {
}

type Props = OwnProps;

const page: FunctionComponent<Props> = (props) => {

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <AddFriendButton/>
    </main>
  )
}

export default page
