import React from 'react'
import { FormInput, Select, Option, Button, Typography } from '@material-tailwind/react'
import { useState } from 'react'

export default function Feedback() {
  return (
    <div className="flex flex-col w-full p-6 bg-white rounded-lg">
      <div className="flex justify-between w-full border-b-2 pb-4">
      <h1 className="text-2xl font-semibold mb-4">Feedback</h1>
        </div>

        <iframe className='my-3' src="https://docs.google.com/forms/d/e/1FAIpQLSd8ClLVEsHkDG7qofQWIrM7nlDQz6J__FGOvzvB8s-8ZosIyw/viewform" height={1000} frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>

        </div>
  )
}
