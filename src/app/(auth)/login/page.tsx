import React from 'react'
import SignInCard from './_components/SignInCard'
import { Suspense } from 'react'

const page = () => {
  return (
    <div>
      <Suspense>
        <SignInCard/>
      </Suspense>
    </div>
  )
}

export default page
