'use client'
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Spinner from '@/components/Spinner';


const ProvideCodeforcesHandle = () => {
  const { data: session } = useSession();
  const [codeforcesHandle, setCodeforcesHandle] = useState('');
  const router = useRouter();
  const [loading , setLoading] = useState(true)

  useEffect(() => {
    if(session && session.user && session.codeforcesId != ''){
        router.push('/')
    }
    setLoading(false)
  }, [session])

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
        const res = await fetch('/api/provide-codeforces-handle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email, codeforcesHandle }),
        });
        const data = await res.json()
        if(data.ok){
            toast.success(data.message)
            session.codeforcesId = codeforcesHandle
            router.push('/')
        }   
        else{
            toast.error(data.message)
            console.log(data.message)
        }
    }
    catch(error){
        console.log(error)
        toast.error('Failed to upload ID')
    }
  };

  return loading ? <Spinner loading={loading}/> : !session ? <div className="flex mt-10 justify-center h-screen">
  <span className="text-3xl text-pink-700">Please sign in first</span>
</div> : (
    <div className="container mx-auto px-10 py-8 bg-gray-50 border border-pink-50 mt-7 rounded-md shadow-md">
      <h1 className="text-2xl font-bold text-pink-700">Provide Your Codeforces Handle</h1>
      <form onSubmit={handleSubmit}>
        <label className="block text-gray-700 mt-5">Codeforces Handle  (YOU CANNOT CHANGE THIS IN THE FUTURE)</label>
        <input
          type="text"
          value={codeforcesHandle}
          onChange={(e) => setCodeforcesHandle(e.target.value)}
          className="border rounded w-full py-2 px-3"
          required
        />
        <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ProvideCodeforcesHandle;
