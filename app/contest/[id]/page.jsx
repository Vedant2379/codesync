'use client'
import CountdownTimer from '@/components/CountdownTimer'
import Spinner from '@/components/Spinner'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaCheckCircle, FaCopy, FaCheck, FaExternalLinkAlt } from 'react-icons/fa'

const page = () => {
  const { id } = useParams()
  const [contestData, setContestData] = useState({})
  const [loading, setLoading] = useState(true)
  const [solved, setSolved] = useState([])
  const [copyButtonText, setCopyButtonText] = useState('Copy link to share')
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/contest/${id}`)
        const data = await res.json()
        if (!data.ok) {
          return
        }
        setContestData(data.contest)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    const fetchSolved = async () => {
      try {
        const res = await fetch(`/api/contest-status/${id}`)
        const data = await res.json()
        if (data.ok) {
          setSolved(data.solved)
        }
      } catch (error) {
        console.log(error)
      }
    }

    fetchData()
    fetchSolved()
  }, [id])

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/contest-status/${id}`)
        const data = await res.json()
        if (data.ok) {
          setSolved(data.solved)
        }
      } catch (error) {
        console.log(error)
      }
    }, 30000)

    return () => clearInterval(timer)
  }, [id])

  const handleCopyLink = () => {
    const contestUrl = window.location.href
    navigator.clipboard.writeText(contestUrl)
      .then(() => {
        setIsCopied(true)
        setCopyButtonText('Copied!')
        setTimeout(() => {
          setIsCopied(false)
          setCopyButtonText('Copy link to share')
        }, 2000)
      })
      .catch((error) => {
        console.error('Failed to copy text: ', error)
      })
  }

  return loading ? (
    <Spinner loading={loading} />
  ) : (
    <div className="container mx-auto px-4 py-10 mt-10 bg-gray-50 border border-pink-100 shadow-md rounded-md mb-7">
      <h1 className='text-4xl text-pink-700 font-bold text-center'>Contest Page</h1>
      <div className='mt-5 mx-auto text-center'>
        <CountdownTimer targetDate={new Date(contestData.timeEnding)} />
        <div className='mt-10 flex justify-center'>
          <button onClick={handleCopyLink} className='flex items-center text-blue-500 hover:text-blue-700'>
            {isCopied ? (
              <FaCheck className='mr-2' style={{ width: '24px', height: '24px' }} />
            ) : (
              <FaCopy className='mr-2' style={{ width: '24px', height: '24px' }} />
            )}
            {copyButtonText}
          </button>
        </div>
        <div className='pt-5'>
          {contestData.problemList.map((problem, index) => (
            <div className='flex flex-wrap mt-10 justify-center items-center' key={index}>
              <span className='text-blue-900 font-semibold'>{index + 1}. {problem.name}</span>
              <Link
                href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
                className='text-blue-900 bg-gray-100 p-1 rounded-xl ms-3 border hover:border-blue-200 inline-flex items-center'
                target='_blank'
              >
                <FaExternalLinkAlt/>
              </Link>
              {solved.some(solvedProblem =>
                solvedProblem.contestId === problem.contestId && solvedProblem.index === problem.index
              ) && <FaCheckCircle className='text-green-500 ms-2' style={{ width: '24px', height: '24px' }} />
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default page
